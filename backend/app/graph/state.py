"""Graph state.

`Annotated[..., operator.add]` on the list fields is what lets the specialists
run concurrently and merge their writes without locking.
"""

from __future__ import annotations

import operator
from typing import Annotated, TypedDict

from app.media.registry import ResolvedMedia
from app.schemas.common import SkillId
from app.schemas.risk import RiskAnalyzeRequest
from app.schemas.signals import AgentSignal
from app.settings import Settings


class RiskState(TypedDict, total=False):
    req: RiskAnalyzeRequest
    # Passed explicitly rather than read from the global: the nodes' behaviour
    # depends on it (llm_enabled, timeouts), so tests must be able to inject.
    settings: Settings
    media: ResolvedMedia | None

    # Concurrent writers -> reducers.
    raw_signals: Annotated[list[AgentSignal], operator.add]
    agents_run: Annotated[list[str], operator.add]
    agent_errors: Annotated[list[str], operator.add]

    # Single writer (pretriage / aggregate).
    pretriage_benign: bool
    claimed_time_place: str | None
    risk_score: float
    dominant_skill: SkillId | None
    per_skill: dict[str, float]
