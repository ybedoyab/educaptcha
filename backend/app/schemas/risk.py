"""Request/response for POST /risk/analyze."""

from __future__ import annotations

from typing import Literal

from pydantic import Field

from app.schemas.common import (
    ActionType,
    ApiModel,
    Category,
    ChallengeId,
    DecisionPath,
    Gate,
    Locale,
    LocalizedText,
    MediaKind,
    Outcome,
    SkillId,
)
from app.schemas.signals import Signal


class PostAuthor(ApiModel):
    handle: str = Field(max_length=64)
    display_name: str | None = Field(default=None, max_length=120)


class PostEngagement(ApiModel):
    reactions: int = 0
    comments: int = 0
    shares: int = 0
    age_minutes: int | None = Field(
        default=None,
        description="Parsed from the post's relative timestamp; drives share velocity.",
    )


class PostMedia(ApiModel):
    kind: MediaKind
    asset_id: str | None = Field(
        default=None,
        description="Resolved server-side against baked derivatives. Unknown ids are ignored, "
        "not errors. Deliberately no url and no base64: the source JPEGs are 1.7-6.9 MB.",
    )


class PostPayload(ApiModel):
    """What a host platform legitimately knows about a post.

    Deliberately excludes `tone`, `triggerSkill` and `minigameId`: those are the
    demo's curated answers, and forwarding them would make the agents decorative.
    """

    id: str = Field(max_length=64)
    body: LocalizedText
    category: Category | None = None
    tags: list[str] = Field(default_factory=list, max_length=16)
    author: PostAuthor
    engagement: PostEngagement = PostEngagement()
    media: PostMedia
    top_comments: list[str] = Field(default_factory=list, max_length=5)


class SessionRef(ApiModel):
    """Anonymous, client-generated. Never joined to a user identity."""

    id: str = Field(min_length=8, max_length=64)
    # Mirrors used for reconciliation after a page reload. The server takes
    # max(server, client) for the counter and the union of recent skills, so a
    # client can raise the counter but never lower it below server-tracked state.
    actions_since_last_intervention: int | None = Field(default=None, ge=0)
    recent_skills: list[SkillId] | None = Field(default=None, max_length=5)


class RiskAnalyzeRequest(ApiModel):
    action: ActionType
    post: PostPayload
    comment_text: str | None = Field(default=None, max_length=1000)
    locale: Locale = "en"
    mode: Literal["free-browse", "guided"] = "free-browse"
    dry_run: bool = Field(
        default=False,
        description="Speculative prefetch: warm the analysis cache without mutating "
        "session counters. Lets the click land on a warm cache.",
    )
    session: SessionRef
    client_version: str | None = Field(default=None, max_length=32)


class RiskDecision(ApiModel):
    """Maps one-to-one onto the frontend's `ActionDecision` union."""

    outcome: Outcome
    should_intervene: bool
    skill: SkillId | None = None
    challenge_id: ChallengeId | None = None
    transfer_challenge_id: ChallengeId | None = None
    transfer_post_id: str | None = None
    # LocalizedText, not str: OpenFeedChallengeDialog renders `reason[language]`.
    reason: LocalizedText | None = None
    acknowledgement: LocalizedText | None = None


class RiskDiagnostics(ApiModel):
    """Why the service decided what it decided. Powers the demo's debug drawer."""

    risk_score: float = Field(ge=0.0, le=1.0)
    threshold: float
    signals: list[Signal] = Field(default_factory=list)
    agents_run: list[str] = Field(default_factory=list)
    agent_errors: list[str] = Field(default_factory=list)
    gate: Gate | None = None
    path: DecisionPath
    latency_ms: int
    model: str | None = None
    trace_id: str | None = None
    would_practice: SkillId | None = Field(
        default=None,
        description="Set when risk cleared the threshold but no minigame exists for that "
        "skill. Evidence of demand for a challenge that has not been built yet.",
    )


class SessionSnapshot(ApiModel):
    id: str
    actions_since_last_intervention: int
    recent_skills: list[SkillId] = Field(default_factory=list)


class RiskAnalyzeResponse(ApiModel):
    decision: RiskDecision
    diagnostics: RiskDiagnostics
    session: SessionSnapshot
    schema_version: Literal[1] = 1
