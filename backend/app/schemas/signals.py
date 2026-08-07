"""Specialist-agent output.

Signal ids are a closed vocabulary per agent. That is the whole point: an open
`str` gives you free-text mush you cannot weight, chart, or regression-test.
"""

from __future__ import annotations

from typing import Literal

from pydantic import Field

from app.schemas.common import ApiModel, SkillId

AgentName = Literal["text", "image", "chart", "heuristic"]

TextSignalId = Literal[
    "urgency-imperative",
    "suppression-claim",
    "unnamed-authority",
    "no-verifiable-source",
    "proof-overclaim",
    "claimed-time-place",
    "affirming-restatement",
]

ImageSignalId = Literal[
    "scene-caption-mismatch",
    "stale-or-archival-cues",
    "region-mismatch",
    "object-does-not-support-claim",
    "synthetic-artifacts",
]

ChartSignalId = Literal[
    "truncated-y-axis",
    "nonuniform-or-missing-scale",
    "missing-axis-labels-or-units",
    "visual-magnitude-vs-data-ratio",
]

HeuristicSignalId = Literal["share-velocity"]

# Flattened so it lands in the JSON schema as a single `enum`. This is what
# actually constrains the model: with a bare `str`, Gemini cheerfully returns
# ids like `artificial_urgency_sharing_pressure`, which then score 0.0 against
# SIGNAL_WEIGHTS and silently sink every risk score to zero.
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


class AgentSignal(ApiModel):
    """One observation from one agent. Returned by the model via structured output."""

    id: SignalId = Field(description="Signal id from this agent's closed vocabulary.")
    skill: SkillId = Field(description="Which media-literacy skill this would practise.")
    confidence: float = Field(ge=0.0, le=1.0)
    evidence: str = Field(
        max_length=240,
        description="One short English clause quoting or describing what triggered this. "
        "Audit and demo only — never rendered as product copy.",
    )


class AgentOutput(ApiModel):
    """What every specialist returns. An empty list is a valid, common answer."""

    signals: list[AgentSignal] = Field(default_factory=list, max_length=4)
    no_signal_reason: str | None = Field(default=None, max_length=240)


class Signal(ApiModel):
    """A scored signal on the wire: agent confidence times its configured weight."""

    id: str
    agent: AgentName
    skill: SkillId
    weight: float = Field(ge=0.0, le=1.0)
    evidence: str = Field(max_length=240)
