"""Orchestration: pre-triage -> gates -> (maybe) graph -> gates -> response.

This is the "orchestrator" of the pipeline, and it is deliberately rule-based.
The gates are invariants rather than judgements, so they have to be code either
way — which would leave a model owning nothing but one float-vs-float
comparison, where it is slower, non-deterministic, unauditable, and turns the
agents' parallel `max()` latency into a `sum()`. A tunable threshold is also the
knob you actually want on stage.
"""

from __future__ import annotations

import asyncio
import logging
import time

from app.cache.ttl_cache import Analysis, AnalysisCache, analysis_key
from app.catalog.loader import Catalog, get_catalog
from app.graph.build import get_graph
from app.graph.nodes.agents import PROMPT_VERSION
from app.media.registry import resolve_media
from app.policy.gates import post_llm_gates, pre_llm_gates
from app.policy.pretriage import triage
from app.policy.scoring import WEIGHTS_VERSION
from app.schemas.common import DecisionPath
from app.schemas.risk import (
    RiskAnalyzeRequest,
    RiskAnalyzeResponse,
    RiskDecision,
    RiskDiagnostics,
    SessionSnapshot,
)
from app.session.store import SessionState, SessionStore
from app.settings import Settings

log = logging.getLogger(__name__)


def prepare_state(
    req: RiskAnalyzeRequest, settings: Settings, catalog: Catalog | None = None
) -> dict[str, object]:
    """Build the graph's initial state: resolve media, run pre-triage.

    Shared by `analyze` and the graph tests so the two can never drift.
    """
    catalog = catalog or get_catalog()
    media = resolve_media(req.post.media.asset_id, req.post.media.kind)
    tri = triage(
        req.post,
        has_binding=req.post.id in catalog.post_bindings,
        media_analyzable=bool(media and media.analyzable),
        svg_text=media.svg_text if media and media.is_svg else None,
    )
    return {
        "req": req,
        "settings": settings,
        "media": media,
        "pretriage_benign": tri.benign,
        "raw_signals": list(tri.signals),
        "agents_run": ["heuristic"],
    }


def _snapshot(session_id: str, state: SessionState) -> SessionSnapshot:
    return SessionSnapshot(
        id=session_id,
        actions_since_last_intervention=state.actions_since_last_intervention,
        recent_skills=list(state.recent_skills),
    )


async def analyze(
    req: RiskAnalyzeRequest,
    *,
    settings: Settings,
    sessions: SessionStore,
    cache: AnalysisCache,
    catalog: Catalog | None = None,
) -> RiskAnalyzeResponse:
    started = time.perf_counter()
    catalog = catalog or get_catalog()

    session = sessions.get(req.session.id)
    session.reconcile(req.session.actions_since_last_intervention, req.session.recent_skills)

    media = resolve_media(req.post.media.asset_id, req.post.media.kind)
    tri = triage(
        req.post,
        has_binding=req.post.id in catalog.post_bindings,
        media_analyzable=bool(media and media.analyzable),
        svg_text=media.svg_text if media and media.is_svg else None,
    )

    pre = pre_llm_gates(req, session, catalog, settings, pretriage_benign=tri.benign)

    def respond(
        decision: RiskDecision,
        analysis: Analysis,
        path: DecisionPath,
        gate: object = None,
        would_practice: object = None,
    ) -> RiskAnalyzeResponse:
        sessions.put(req.session.id, session)
        return RiskAnalyzeResponse(
            decision=decision,
            diagnostics=RiskDiagnostics(
                risk_score=analysis.risk_score,
                threshold=settings.risk_threshold,
                signals=analysis.signals,
                agents_run=analysis.agents_run,
                agent_errors=analysis.agent_errors,
                gate=gate,  # type: ignore[arg-type]
                path=path,
                latency_ms=int((time.perf_counter() - started) * 1000),
                model=settings.gemini_model if settings.llm_enabled else None,
                would_practice=would_practice,  # type: ignore[arg-type]
            ),
            session=_snapshot(req.session.id, session),
        )

    empty = Analysis(risk_score=0.0, dominant_skill=None, agents_run=["heuristic"])

    # Short-circuit: gate fired and shadow mode is off.
    if pre.decision is not None and not pre.should_run_agents:
        path: DecisionPath = "guided" if req.mode == "guided" else "pretriage"
        return respond(pre.decision, empty, path, pre.gate)

    key = analysis_key(
        post_id=req.post.id,
        body_en=req.post.body.en,
        body_es=req.post.body.es,
        category=req.post.category,
        tags=list(req.post.tags or []),
        author_handle=req.post.author.handle if req.post.author else None,
        reactions=req.post.engagement.reactions if req.post.engagement else None,
        comments=req.post.engagement.comments if req.post.engagement else None,
        shares=req.post.engagement.shares if req.post.engagement else None,
        age_minutes=req.post.engagement.age_minutes if req.post.engagement else None,
        asset_id=req.post.media.asset_id,
        media_kind=req.post.media.kind,
        top_comments=list(req.post.top_comments or []),
        action=req.action,
        comment_text=req.comment_text,
        model=settings.gemini_model,
        prompt_version=PROMPT_VERSION,
        weights_version=WEIGHTS_VERSION,
    )

    cached = cache.get(key)
    if cached is not None:
        analysis, path = cached, "cache"
    else:
        analysis, path = await _run_graph(req, settings, media, tri), "graph"
        if not analysis.agent_errors:
            # Never cache a degraded result; a transient 503 would otherwise be
            # frozen in for the whole TTL.
            cache.put(key, analysis)

    # Shadow mode: we ran the agents purely to record a score. Honour the gate.
    if pre.decision is not None:
        return respond(pre.decision, analysis, path, pre.gate)

    final = post_llm_gates(
        req,
        session,
        catalog,
        settings,
        risk_score=analysis.risk_score,
        dominant_skill=analysis.dominant_skill,
    )
    return respond(final.decision, analysis, path, final.gate, final.would_practice)


async def _run_graph(
    req: RiskAnalyzeRequest, settings: Settings, media: object, tri: object
) -> Analysis:
    """Invoke the model layer under a hard deadline.

    A blown deadline degrades to "no signals", i.e. continue. The demo must never
    hang on a click, and an interruption caused by slowness would be the worst
    possible failure mode for a product whose pitch is "don't interrupt people".
    """
    from app.graph.build import _agent_for  # local import: avoids a cycle
    from app.policy.scoring import aggregate as aggregate_signals
    from app.policy.scoring import score_signal

    initial = {
        "req": req,
        "settings": settings,
        "media": media,
        "pretriage_benign": tri.benign,  # type: ignore[attr-defined]
        "raw_signals": list(tri.signals),  # type: ignore[attr-defined]
        "agents_run": ["heuristic"],
    }

    try:
        config = {"run_name": "risk_analyze", "recursion_limit": 10}
        out = await asyncio.wait_for(
            get_graph().ainvoke(initial, config=config),
            timeout=settings.graph_deadline_ms / 1000,
        )
    except TimeoutError:
        log.warning("graph exceeded %sms deadline for %s", settings.graph_deadline_ms, req.post.id)
        scored = [score_signal(s, _agent_for(s.id)) for s in tri.signals]  # type: ignore[attr-defined]
        score, dominant, _ = aggregate_signals(scored)
        return Analysis(
            risk_score=score,
            dominant_skill=dominant,
            signals=scored,
            agents_run=["heuristic"],
            agent_errors=["graph:deadline"],
        )

    scored = [score_signal(s, _agent_for(s.id)) for s in out.get("raw_signals", [])]
    return Analysis(
        risk_score=out.get("risk_score", 0.0),
        dominant_skill=out.get("dominant_skill"),
        signals=scored,
        agents_run=out.get("agents_run", []),
        agent_errors=out.get("agent_errors", []),
    )
