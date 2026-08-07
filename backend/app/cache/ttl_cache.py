"""Cache for the *pre-policy* analysis, never the final decision.

Policy depends on mutable session state (cooldown, no-repeat-skill), so caching
a decision would serve a stale cooldown and break the "don't nag" promise. What
is cacheable is what the models concluded about the content itself.

The key folds in prompt and weights versions, so tuning either one invalidates
cached verdicts automatically instead of quietly serving yesterday's answers
through a live demo.
"""

from __future__ import annotations

import hashlib
from dataclasses import dataclass, field

from cachetools import TTLCache

from app.schemas.common import SkillId
from app.schemas.signals import Signal

SCHEMA_VERSION = 1


@dataclass
class Analysis:
    risk_score: float
    dominant_skill: SkillId | None
    signals: list[Signal] = field(default_factory=list)
    agents_run: list[str] = field(default_factory=list)
    agent_errors: list[str] = field(default_factory=list)


def analysis_key(
    *,
    post_id: str,
    body_en: str,
    asset_id: str | None,
    media_kind: str,
    action: str,
    comment_text: str | None,
    model: str,
    prompt_version: int,
    weights_version: int,
) -> str:
    parts = (
        str(SCHEMA_VERSION),
        model,
        str(prompt_version),
        str(weights_version),
        post_id,
        body_en,
        asset_id or "-",
        media_kind,
        action,
        (comment_text or "").strip().lower(),
    )
    return hashlib.sha256("\x1f".join(parts).encode("utf-8")).hexdigest()


class AnalysisCache:
    def __init__(self, maxsize: int = 512, ttl: int = 1800) -> None:
        self._c: TTLCache[str, Analysis] = TTLCache(maxsize=maxsize, ttl=ttl)
        self.hits = 0
        self.misses = 0

    def get(self, key: str) -> Analysis | None:
        value = self._c.get(key)
        if value is None:
            self.misses += 1
        else:
            self.hits += 1
        return value

    def put(self, key: str, value: Analysis) -> None:
        self._c[key] = value

    def clear(self) -> None:
        self._c.clear()
        self.hits = self.misses = 0

    def __len__(self) -> int:
        return len(self._c)
