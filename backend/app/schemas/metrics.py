"""Anonymous outcome events.

`extra="forbid"` plus a closed field set is the privacy guarantee: there is no
field on this model that can carry free text, a user id, an IP, a user agent, or
a comment body. That makes the answer to "what do you collect?" a one-liner.
"""

from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import Field

from app.schemas.common import (
    ActionType,
    ApiModel,
    ChallengeId,
    Gate,
    Locale,
    Outcome,
    SkillId,
)

EventName = Literal[
    "risk_analyzed",
    "intervention_shown",
    "intervention_skipped",
    "challenge_completed",
    "transfer_completed",
    "intent_resolved",
    "verify_clicked",
]


class MetricEvent(ApiModel):
    event: EventName
    session_id: str = Field(min_length=8, max_length=64)
    occurred_at: datetime
    locale: Locale = "en"

    post_id: str | None = Field(default=None, max_length=64)
    action: ActionType | None = None
    skill: SkillId | None = None
    challenge_id: ChallengeId | None = None
    transfer_challenge_id: ChallengeId | None = None
    outcome: Outcome | None = None
    gate: Gate | None = None
    risk_score: float | None = Field(default=None, ge=0.0, le=1.0)
    correct: bool | None = None
    skipped: bool | None = None
    final_decision: Literal["shared", "not-shared", "cancelled"] | None = None
    duration_ms: int | None = Field(default=None, ge=0)

    schema_version: Literal[1] = 1


class MetricAck(ApiModel):
    accepted: bool = True
    sink: str
