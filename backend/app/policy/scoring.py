"""Turn a bag of agent signals into one risk score and one dominant skill.

Noisy-OR *within* a skill bucket, max *across* buckets — deliberately not a sum.
The question this service answers is "is there one thing here worth practising",
so four weak signals across four unrelated skills must not add up to look like
one strong signal.
"""

from __future__ import annotations

from collections import defaultdict

from app.schemas.common import SkillId
from app.schemas.signals import AgentName, AgentSignal, Signal

# Bump when any weight changes: it is hashed into the analysis cache key, so
# tuning invalidates cached verdicts instead of silently serving stale ones
# through a demo.
WEIGHTS_VERSION = 1

SIGNAL_WEIGHTS: dict[str, float] = {
    # text
    "urgency-imperative": 0.75,
    "suppression-claim": 0.80,
    "unnamed-authority": 0.65,
    "no-verifiable-source": 0.45,
    "proof-overclaim": 0.70,
    "claimed-time-place": 0.60,
    "affirming-restatement": 0.70,
    # image
    "scene-caption-mismatch": 0.85,
    "stale-or-archival-cues": 0.70,
    "region-mismatch": 0.75,
    "object-does-not-support-claim": 0.70,
    "synthetic-artifacts": 0.65,
    # chart
    "truncated-y-axis": 0.80,
    "nonuniform-or-missing-scale": 0.60,
    "missing-axis-labels-or-units": 0.40,
    "visual-magnitude-vs-data-ratio": 0.85,
    # heuristic (pre-triage, no model)
    "share-velocity": 0.25,
}

# Tie-break when two skills score within EPS of each other. More specific skills
# win: "this photo is from another wildfire" teaches more than "check the image".
SKILL_PRIORITY: tuple[SkillId, ...] = (
    "misleading-chart",
    "vaccine-claim",
    "wildfire-context",
    "protest-context",
    "image-context",
    "emotional-pressure",
    "ai-content",
    "sources",
)

_TIE_EPS = 0.10


def score_signal(sig: AgentSignal, agent: AgentName) -> Signal:
    """Agent confidence times the configured weight for that signal id."""
    weight = SIGNAL_WEIGHTS.get(sig.id, 0.0) * sig.confidence
    return Signal(
        id=sig.id,
        agent=agent,
        skill=sig.skill,
        weight=round(min(max(weight, 0.0), 1.0), 4),
        evidence=sig.evidence,
    )


def _noisy_or(weights: list[float]) -> float:
    product = 1.0
    for w in weights:
        product *= 1.0 - w
    return 1.0 - product


def aggregate(signals: list[Signal]) -> tuple[float, SkillId | None, dict[str, float]]:
    """Return (risk_score, dominant_skill, per_skill_scores)."""
    if not signals:
        return 0.0, None, {}

    buckets: dict[str, list[float]] = defaultdict(list)
    for s in signals:
        buckets[s.skill].append(s.weight)

    per_skill = {skill: round(_noisy_or(ws), 4) for skill, ws in buckets.items()}
    best = max(per_skill.values())

    # Everything within EPS of the top is a tie; SKILL_PRIORITY breaks it.
    contenders = [k for k, v in per_skill.items() if best - v <= _TIE_EPS]
    dominant = min(
        contenders,
        key=lambda k: SKILL_PRIORITY.index(k) if k in SKILL_PRIORITY else len(SKILL_PRIORITY),
    )
    return best, dominant, per_skill  # type: ignore[return-value]
