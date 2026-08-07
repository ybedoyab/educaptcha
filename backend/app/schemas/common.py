"""Shared primitives. Wire format is camelCase to match the frontend's TS types."""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class ApiModel(BaseModel):
    """Base for everything on the wire: camelCase out, either casing in."""

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        extra="forbid",
    )


class LocalizedText(ApiModel):
    """Mirrors the frontend `LocalizedText`. Every user-facing string is bilingual."""

    en: str
    es: str


Locale = Literal["en", "es"]

ActionType = Literal["share", "comment", "repost-image", "save", "verify-link"]

MediaKind = Literal["photo", "chart", "document", "video", "text", "thread", "official"]

Category = Literal["local-news", "health", "environment", "science", "community", "technology"]

# Declared on OpenFeedPost.triggerSkill. `ai-content` and `sources` are declared
# by the frontend but have no post and no minigame, so they can be *detected*
# but never resolve to a challenge. See catalog.actionable_skills.
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

# The only twelve ids `experienceMinigames` accepts. Declared as a Literal so
# Pydantic physically cannot serialize an unknown id — an out-of-range value
# raises ValidationError, which the route converts to "continue" rather than
# letting the frontend wedge on a dialog that never opens.
# `tests/test_catalog_parity.py` asserts this matches catalog.json exactly.
ChallengeId = Literal[
    "ch-repair",
    "ch-transfer",
    "ep-spot",
    "ep-transfer",
    "ic-match",
    "ic-transfer",
    "pr-match",
    "pr-transfer",
    "vx-inspect",
    "vx-transfer",
    "wf-match",
    "wf-transfer",
]

Outcome = Literal["continue", "intercept", "verify-ack"]

# Why the service stayed quiet (or didn't). Surfaced in diagnostics so the demo
# can explain itself, and recorded in metrics.
Gate = Literal[
    "verify-ack",
    "save",
    "no-challenge-for-skill",
    "non-affirming-comment",
    "cooldown",
    "no-repeat-skill",
    "pretriage-benign",
    "below-threshold",
    "agent-error",
    "deadline",
]

DecisionPath = Literal["pretriage", "cache", "graph", "guided", "fallback"]
