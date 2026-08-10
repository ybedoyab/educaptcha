"""Agent boundary contracts.

Agents identify risk *signals*. They never decide interventions, challenge IDs,
or product policy.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Literal

from pydantic import BaseModel, Field

SkillId = Literal[
    "emotional-pressure",
    "image-context",
    "wildfire-context",
    "vaccine-claim",
    "protest-context",
    "misleading-chart",
    "ai-content",
    "sources",
]

AgentName = Literal["text", "image", "chart", "heuristic"]

SignalId = Literal[
    "urgency-imperative",
    "suppression-claim",
    "unnamed-authority",
    "no-verifiable-source",
    "proof-overclaim",
    "claimed-time-place",
    "affirming-restatement",
    "scene-caption-mismatch",
    "stale-or-archival-cues",
    "region-mismatch",
    "object-does-not-support-claim",
    "synthetic-artifacts",
    "truncated-y-axis",
    "nonuniform-or-missing-scale",
    "missing-axis-labels-or-units",
    "visual-magnitude-vs-data-ratio",
    "share-velocity",
]


class AgentSignal(BaseModel):
    id: SignalId = Field(description="Signal id from this agent's closed vocabulary.")
    skill: SkillId
    confidence: float = Field(ge=0.0, le=1.0)
    evidence: str = Field(max_length=240)


class AgentOutput(BaseModel):
    """Structured LLM output schema for every specialist."""

    signals: list[AgentSignal] = Field(default_factory=list, max_length=4)
    no_signal_reason: str | None = Field(default=None, max_length=240)


@dataclass(frozen=True)
class AgentEngagement:
    reactions: int = 0
    comments: int = 0
    shares: int = 0
    age_minutes: int | None = None


@dataclass(frozen=True)
class AgentMedia:
    """Media payload prepared by the backend (never resolved inside agents)."""

    kind: str
    asset_id: str | None = None
    analyzable: bool = False
    is_svg: bool = False
    has_raster: bool = False
    wants_image_agent: bool = False
    wants_chart_agent: bool = False
    data_b64: str | None = None
    mime: str | None = None
    svg_text: str | None = None


@dataclass(frozen=True)
class AgentContext:
    post_id: str
    body_en: str
    body_es: str
    category: str | None
    tags: list[str]
    author_handle: str
    engagement: AgentEngagement
    action: str
    comment_text: str | None = None
    top_comments: list[str] = field(default_factory=list)
    media: AgentMedia | None = None
    #: Heuristic signals already collected by backend pretriage.
    seed_signals: list[AgentSignal] = field(default_factory=list)
    pretriage_benign: bool = False


@dataclass(frozen=True)
class AgentSettings:
    model: str
    api_key: str | None
    thinking_level: str
    temperature: float
    timeout_ms: int
    llm_enabled: bool


@dataclass
class AgentAnalysis:
    signals: list[AgentSignal] = field(default_factory=list)
    agents_run: list[str] = field(default_factory=list)
    agent_errors: list[str] = field(default_factory=list)
