"""Orchestration: pre-triage -> gates -> (maybe) agents -> gates -> response.

This is the "orchestrator" of the pipeline, and it is deliberately rule-based.
Agents emit raw signals; scoring and challenge resolution stay here.
"""

from __future__ import annotations

import asyncio
import logging
import time

from educaptcha_agents import (
    PROMPT_VERSION,
    AgentContext,
    AgentEngagement,
    AgentMedia,
    AgentSettings,
)
from educaptcha_agents import (
    AgentSignal as RawAgentSignal,
)

from app.adapters.agent_analyzer import default_analyzer
from app.cache.ttl_cache import Analysis, AnalysisCache, analysis_key
from app.catalog.loader import Catalog, get_catalog
from app.media.registry import ResolvedMedia, resolve_media
from app.policy.gates import post_llm_gates, pre_llm_gates
from app.policy.pretriage import triage
from app.policy.scoring import WEIGHTS_VERSION, agent_for, score_signal
from app.policy.scoring import aggregate as aggregate_signals
from app.ports.risk_analyzer import RiskAnalyzer
from app.schemas.common import DecisionPath
from app.schemas.risk import (
    RiskAnalyzeRequest,
    RiskAnalyzeResponse,
    RiskDecision,
    RiskDiagnostics,
    SessionSnapshot,
)
from app.schemas.signals import AgentSignal
from app.session.store import SessionState, SessionStore
from app.settings import Settings

log = logging.getLogger(__name__)


def _agent_settings(settings: Settings) -> AgentSettings:
    return AgentSettings(
        model=settings.gemini_model,
        api_key=settings.google_api_key,
        thinking_level=settings.gemini_thinking_level,
        temperature=settings.gemini_temperature,
        timeout_ms=settings.llm_timeout_ms,
        llm_enabled=settings.llm_enabled,
    )


def to_agent_media(media: ResolvedMedia | None) -> AgentMedia | None:
    if media is None:
        return None
    return AgentMedia(
        kind=str(media.kind),
        asset_id=media.asset_id,
        analyzable=media.analyzable,
        is_svg=media.is_svg,
        has_raster=media.has_raster,
        wants_image_agent=media.wants_image_agent,
        wants_chart_agent=media.wants_chart_agent,
        data_b64=media.data_b64,
        mime=media.mime,
        svg_text=media.svg_text,
    )


def _seed_signals(signals: list[AgentSignal]) -> list[RawAgentSignal]:
    return [
        RawAgentSignal(
            id=s.id,  # type: ignore[arg-type]
            skill=s.skill,
            confidence=s.confidence,
            evidence=s.evidence,
        )
        for s in signals
    ]


def build_agent_context(
    req: RiskAnalyzeRequest,
    media: ResolvedMedia | None,
    *,
    pretriage_benign: bool,
    seed: list[AgentSignal],
) -> AgentContext:
    e = req.post.engagement
    return AgentContext(
        post_id=req.post.id,
        body_en=req.post.body.en,
        body_es=req.post.body.es,
        category=req.post.category,
        tags=list(req.post.tags or []),
        author_handle=req.post.author.handle if req.post.author else "",
        engagement=AgentEngagement(
            reactions=e.reactions if e else 0,
            comments=e.comments if e else 0,
            shares=e.shares if e else 0,
            age_minutes=e.age_minutes if e else None,
        ),
        action=req.action,
        comment_text=req.comment_text,
        top_comments=list(req.post.top_comments or []),
        media=to_agent_media(media),
        seed_signals=_seed_signals(seed),
        pretriage_benign=pretriage_benign,
    )


def prepare_state(
    req: RiskAnalyzeRequest, settings: Settings, catalog: Catalog | None = None
) -> dict[str, object]:
    """Compatibility helper for tools/tests that need media + pretriage."""
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
        "context": build_agent_context(
            req, media, pretriage_benign=tri.benign, seed=list(tri.signals)
        ),
        "agent_settings": _agent_settings(settings),
    }


def _snapshot(session_id: str, state: SessionState) -> SessionSnapshot:
    return SessionSnapshot(
        id=session_id,
        actions_since_last_intervention=state.actions_since_last_intervention,
        recent_skills=list(state.recent_skills),
    )


def _score_raw(signals: list[RawAgentSignal] | list[AgentSignal]) -> Analysis:
    api_signals: list[AgentSignal] = []
    for s in signals:
        if isinstance(s, AgentSignal):
            api_signals.append(s)
        else:
            api_signals.append(
                AgentSignal(
                    id=s.id,  # type: ignore[arg-type]
                    skill=s.skill,
                    confidence=s.confidence,
                    evidence=s.evidence,
                )
            )
    scored = [score_signal(s, agent_for(s.id)) for s in api_signals]
    score, dominant, _ = aggregate_signals(scored)
    return Analysis(
        risk_score=score,
        dominant_skill=dominant,
        signals=scored,
        agents_run=[],
        agent_errors=[],
    )


async def analyze(
    req: RiskAnalyzeRequest,
    *,
    settings: Settings,
    sessions: SessionStore,
    cache: AnalysisCache,
    catalog: Catalog | None = None,
    analyzer: RiskAnalyzer | None = None,
) -> RiskAnalyzeResponse:
    started = time.perf_counter()
    catalog = catalog or get_catalog()
    analyzer = analyzer or default_analyzer

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
        analysis, path = await _run_agents(req, settings, media, tri, analyzer), "graph"
        if not analysis.agent_errors:
            cache.put(key, analysis)

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


async def _run_agents(
    req: RiskAnalyzeRequest,
    settings: Settings,
    media: ResolvedMedia | None,
    tri: object,
    analyzer: RiskAnalyzer,
) -> Analysis:
    context = build_agent_context(
        req,
        media,
        pretriage_benign=tri.benign,  # type: ignore[attr-defined]
        seed=list(tri.signals),  # type: ignore[attr-defined]
    )
    agent_settings = _agent_settings(settings)

    try:
        out = await asyncio.wait_for(
            analyzer.analyze(context, agent_settings),
            timeout=settings.graph_deadline_ms / 1000,
        )
    except TimeoutError:
        log.warning("agents exceeded %sms deadline for %s", settings.graph_deadline_ms, req.post.id)
        scored = _score_raw(list(tri.signals))  # type: ignore[attr-defined]
        scored.agents_run = ["heuristic"]
        scored.agent_errors = ["graph:deadline"]
        return scored

    analysis = _score_raw(out.signals)
    analysis.agents_run = list(out.agents_run)
    analysis.agent_errors = list(out.agent_errors)
    return analysis
