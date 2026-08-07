from __future__ import annotations

from app.policy.scoring import SIGNAL_WEIGHTS, aggregate, score_signal
from app.schemas.signals import AgentSignal


def sig(sid: str, skill: str, conf: float = 1.0):
    return score_signal(
        AgentSignal(id=sid, skill=skill, confidence=conf, evidence="e"),  # type: ignore[arg-type]
        "text",
    )


def test_empty_signals_score_zero():
    score, skill, per = aggregate([])
    assert (score, skill, per) == (0.0, None, {})


def test_confidence_scales_the_configured_weight():
    s = sig("urgency-imperative", "emotional-pressure", conf=0.5)
    assert s.weight == round(SIGNAL_WEIGHTS["urgency-imperative"] * 0.5, 4)


def test_schema_rejects_invented_signal_ids():
    """The closed enum is load-bearing, not decorative.

    With `id: str`, Gemini returns things like `artificial_urgency_sharing_pressure`;
    those score 0.0 against SIGNAL_WEIGHTS, so every risk score silently collapses
    to the pre-triage heuristic and nothing ever intercepts. The Literal makes
    that a loud validation error instead of a silent zero.
    """
    import pytest
    from pydantic import ValidationError

    with pytest.raises(ValidationError):
        AgentSignal(
            id="artificial_urgency_sharing_pressure",  # type: ignore[arg-type]
            skill="emotional-pressure",
            confidence=0.9,
            evidence="e",
        )


def test_every_weighted_id_is_a_valid_signal_id():
    """SIGNAL_WEIGHTS and the schema enum must not drift apart."""
    from typing import get_args

    from app.schemas.signals import SignalId

    assert set(SIGNAL_WEIGHTS) == set(get_args(SignalId))


def test_noisy_or_accumulates_within_a_skill():
    two = aggregate(
        [
            sig("urgency-imperative", "emotional-pressure"),
            sig("suppression-claim", "emotional-pressure"),
        ]
    )[0]
    one = aggregate([sig("urgency-imperative", "emotional-pressure")])[0]
    assert two > one
    assert two < 1.0


def test_weak_signals_across_unrelated_skills_do_not_stack():
    """Four weak unrelated signals must not fake one strong signal."""
    spread = aggregate(
        [
            sig("no-verifiable-source", "sources", conf=0.4),
            sig("synthetic-artifacts", "ai-content", conf=0.4),
            sig("missing-axis-labels-or-units", "misleading-chart", conf=0.4),
            sig("stale-or-archival-cues", "image-context", conf=0.4),
        ]
    )[0]
    assert spread < 0.55, "spread-out weak signals cleared the threshold"


def test_dominant_skill_is_the_strongest_bucket():
    _, dominant, _ = aggregate(
        [
            sig("no-verifiable-source", "sources", conf=0.3),
            sig("scene-caption-mismatch", "image-context", conf=1.0),
        ]
    )
    assert dominant == "image-context"


def test_ties_break_toward_the_more_specific_skill():
    """Equal scores: teach the specific check, not the generic one."""
    _, dominant, _ = aggregate(
        [
            sig("claimed-time-place", "image-context", conf=1.0),
            sig("region-mismatch", "wildfire-context", conf=0.8),
        ]
    )
    assert dominant == "wildfire-context"


def test_score_is_bounded():
    score, _, _ = aggregate([sig("scene-caption-mismatch", "image-context") for _ in range(20)])
    assert 0.0 <= score <= 1.0
