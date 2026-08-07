"""The ordered policy gates.

Order is behaviour, not style — `tests/test_policy_gates.py` pins it, mirroring
`src/tests/LearningTriggerEngine.test.ts` case for case.

     1  verify-link                    -> verify-ack, counter untouched      pre-LLM
     2  save                           -> continue, counter += 1             pre-LLM
     3  guided                         -> intercept from post binding        pre-LLM
     4  counter += 1        (increment BEFORE the check: the 3rd action intercepts)
     5  nothing resolvable             -> continue, no-challenge-for-skill   pre-LLM
     6  comment and not affirming      -> continue, non-affirming-comment    pre-LLM
     7  counter < COOLDOWN_ACTIONS     -> continue, cooldown                 pre-LLM
     8  candidate == last skill        -> continue, no-repeat-skill          pre-LLM
     9  pretriage benign               -> continue, pretriage-benign         pre-LLM
    10  ---- specialists run in parallel ----
    11  score < threshold              -> continue, below-threshold
    12  challenge unresolvable         -> continue, no-challenge-for-skill
    13  intercept; counter = 0; recent_skills.appendleft(skill)

Gates 6-9 run *before* any model call, which skips roughly two thirds of LLM
work on a real feed. The cost is that suppressed actions have no score, so
SHADOW_MODE_ON_SUPPRESSED runs the graph anyway (returning continue) when you
want the metrics.
"""

from __future__ import annotations

from dataclasses import dataclass

from app.catalog.loader import Catalog
from app.policy.affirmation import is_affirming_comment
from app.policy.reasons import VERIFY_ACK, reason_for
from app.schemas.common import ChallengeId, Gate, SkillId
from app.schemas.risk import RiskAnalyzeRequest, RiskDecision
from app.session.store import SessionState
from app.settings import Settings

CONTINUE = RiskDecision(outcome="continue", should_intervene=False)


@dataclass
class PreGateResult:
    """Outcome of the pre-model gates."""

    decision: RiskDecision | None  # non-None means short-circuit
    gate: Gate | None
    candidate_skill: SkillId | None
    should_run_agents: bool


def _intercept(
    req: RiskAnalyzeRequest,
    skill: SkillId | None,
    resolved: tuple[str, str | None, str | None],
) -> RiskDecision:
    initial, transfer, transfer_post = resolved
    return RiskDecision(
        outcome="intercept",
        should_intervene=True,
        skill=skill,
        # Literal-typed: an id outside the catalog raises ValidationError here,
        # which the route turns into "continue" rather than wedging the dialog.
        challenge_id=initial,  # type: ignore[arg-type]
        transfer_challenge_id=transfer,  # type: ignore[arg-type]
        transfer_post_id=transfer_post,
        reason=reason_for(req.action, skill, req.comment_text),
    )


def pre_llm_gates(
    req: RiskAnalyzeRequest,
    session: SessionState,
    catalog: Catalog,
    settings: Settings,
    *,
    pretriage_benign: bool,
) -> PreGateResult:
    binding = catalog.post_bindings.get(req.post.id)
    candidate = binding.skill if binding else None

    def stop(decision: RiskDecision, gate: Gate | None) -> PreGateResult:
        # Shadow mode still runs the agents so metrics can answer "how often did
        # we suppress something that was genuinely risky?"
        shadow = settings.shadow_mode_on_suppressed and gate in {
            "cooldown",
            "no-repeat-skill",
            "pretriage-benign",
        }
        return PreGateResult(decision, gate, candidate, should_run_agents=shadow)

    # 1 — verifying is the desired behaviour; never interrupt it, never count it.
    if req.action == "verify-link":
        return stop(
            RiskDecision(outcome="verify-ack", should_intervene=False, acknowledgement=VERIFY_ACK),
            "verify-ack",
        )

    # 2 — save is not a pitch trigger, but it does advance the cooldown.
    if req.action == "save":
        if not req.dry_run:
            session.record_action()
        return stop(CONTINUE, "save")

    # 3 — guided scenario: the scripted demo path, no gates, no model.
    if req.mode == "guided":
        resolved = catalog.resolve(req.post.id, candidate)
        if resolved is None:
            return stop(CONTINUE, "no-challenge-for-skill")
        if not req.dry_run:
            session.record_intervention(candidate)
        return PreGateResult(
            _intercept(req, candidate, resolved), None, candidate, should_run_agents=False
        )

    # 4 — increment before the checks below, matching the frontend engine.
    if not req.dry_run:
        session.record_action()

    # 5 — no post binding and no analyzable media means nothing can ever resolve.
    if binding is None and req.post.media.asset_id is None and req.post.media.kind == "text":
        return stop(CONTINUE, "no-challenge-for-skill")

    # 6 — a source-seeking draft must never be quizzed.
    if req.action == "comment" and not is_affirming_comment(req.comment_text or ""):
        return stop(CONTINUE, "non-affirming-comment")

    # Gates 7 and 8 are decisions about *this* moment in the session. A dry run
    # is not making a decision — it is precomputing content analysis so the real
    # click lands on a warm cache. Applying them here would suppress the very
    # analysis the prefetch exists to produce (the counter never advances on a
    # dry run, so the cooldown would fire every single time and cache nothing).
    if not req.dry_run:
        # 7 — at most one interruption every few actions.
        if session.actions_since_last_intervention < settings.cooldown_actions:
            return stop(CONTINUE, "cooldown")

        # 8 — never practise the same skill twice in a row (when we can predict it).
        if settings.no_repeat_skill and candidate is not None and candidate == session.last_skill:
            return stop(CONTINUE, "no-repeat-skill")

    # 9 — obviously benign, decided without a model.
    if pretriage_benign:
        return stop(CONTINUE, "pretriage-benign")

    return PreGateResult(None, None, candidate, should_run_agents=True)


@dataclass
class FinalResult:
    decision: RiskDecision
    gate: Gate | None
    would_practice: SkillId | None = None


def post_llm_gates(
    req: RiskAnalyzeRequest,
    session: SessionState,
    catalog: Catalog,
    settings: Settings,
    *,
    risk_score: float,
    dominant_skill: SkillId | None,
) -> FinalResult:
    # 11
    if risk_score < settings.risk_threshold or dominant_skill is None:
        return FinalResult(CONTINUE, "below-threshold")

    # 8 again — the model may land on a different skill than the binding predicted.
    if settings.no_repeat_skill and dominant_skill == session.last_skill:
        return FinalResult(CONTINUE, "no-repeat-skill")

    # 12 — risk is real but no minigame teaches this skill yet (ai-content, sources).
    resolved = catalog.resolve(req.post.id, dominant_skill)
    if resolved is None:
        return FinalResult(CONTINUE, "no-challenge-for-skill", would_practice=dominant_skill)

    # When a post binding supplied the challenge, its skill is authoritative:
    # the challenge determines what is actually being practised, and the reason
    # copy is keyed off the skill. Otherwise p-wildfire reports
    # skill=emotional-pressure alongside challenge=wf-match, and the user gets
    # urgency copy over a photo-context exercise.
    binding = catalog.post_bindings.get(req.post.id)
    skill = binding.skill if binding is not None else dominant_skill

    # 13
    if not req.dry_run:
        session.record_intervention(skill)
    return FinalResult(_intercept(req, skill, resolved), None)


def safe_challenge_id(value: str | None) -> ChallengeId | None:
    """Last-resort narrowing helper for call sites that build ids dynamically."""
    from typing import get_args

    if value is not None and value in get_args(ChallengeId):
        return value  # type: ignore[return-value]
    return None
