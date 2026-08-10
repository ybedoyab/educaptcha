"""Cache for the *pre-policy* analysis, never the final decision.

Policy depends on mutable session state (cooldown, no-repeat-skill), so caching
a decision would serve a stale cooldown and break the "don't nag" promise. What
is cacheable is what the models concluded about the content itself.

The key is a deterministic content fingerprint over every input that can change
agent analysis, plus prompt/weights/schema versions, so tuning or editing a
post invalidates cached verdicts automatically.
"""

from __future__ import annotations

import hashlib
import json
from dataclasses import dataclass, field
from typing import Any

from cachetools import TTLCache

from app.schemas.common import SkillId
from app.schemas.signals import Signal

# Bump when the fingerprint shape changes so old keys cannot collide.
SCHEMA_VERSION = 2


@dataclass
class Analysis:
    risk_score: float
    dominant_skill: SkillId | None
    signals: list[Signal] = field(default_factory=list)
    agents_run: list[str] = field(default_factory=list)
    agent_errors: list[str] = field(default_factory=list)


def content_fingerprint(payload: dict[str, Any]) -> str:
    """Canonical JSON to sha256. Sort keys; sort tags when order is irrelevant."""
    canonical = json.dumps(payload, sort_keys=True, separators=(",", ":"), ensure_ascii=False)
    return hashlib.sha256(canonical.encode("utf-8")).hexdigest()


def analysis_key(
    *,
    post_id: str,
    body_en: str,
    body_es: str,
    category: str | None,
    tags: list[str] | None,
    author_handle: str | None,
    reactions: int | None,
    comments: int | None,
    shares: int | None,
    age_minutes: int | None,
    asset_id: str | None,
    media_kind: str,
    top_comments: list[str] | None,
    action: str,
    comment_text: str | None,
    model: str,
    prompt_version: int,
    weights_version: int,
) -> str:
    payload = {
        "schema_version": SCHEMA_VERSION,
        "model": model,
        "prompt_version": prompt_version,
        "weights_version": weights_version,
        "post_id": post_id,
        "body_en": body_en,
        "body_es": body_es,
        "category": category or "",
        "tags": sorted(tags or []),
        "author_handle": author_handle or "",
        "engagement": {
            "reactions": reactions if reactions is not None else 0,
            "comments": comments if comments is not None else 0,
            "shares": shares if shares is not None else 0,
            "age_minutes": age_minutes if age_minutes is not None else -1,
        },
        "media_kind": media_kind,
        "asset_id": asset_id or "",
        "top_comments": list(top_comments or []),
        "action": action,
        "comment_text": (comment_text or "").strip().lower(),
    }
    return content_fingerprint(payload)


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
