"""Process-wide singletons, attached to app.state at startup."""

from __future__ import annotations

import time
from collections import defaultdict, deque
from pathlib import Path

from fastapi import Request

from app.cache.ttl_cache import AnalysisCache
from app.metrics.sink import MetricsSink
from app.session.store import SessionStore
from app.settings import Settings

VAR_DIR = Path(__file__).resolve().parents[2] / "var"


def get_settings_dep(request: Request) -> Settings:
    return request.app.state.settings  # type: ignore[no-any-return]


def get_sessions(request: Request) -> SessionStore:
    return request.app.state.sessions  # type: ignore[no-any-return]


def get_cache(request: Request) -> AnalysisCache:
    return request.app.state.cache  # type: ignore[no-any-return]


def get_metrics(request: Request) -> MetricsSink:
    return request.app.state.metrics  # type: ignore[no-any-return]


class RateLimiter:
    """Per-session token bucket.

    The endpoint is unauthenticated by necessity — any key in a `VITE_*` var is
    readable in the public bundle — so a runaway client loop is the realistic
    abuse vector, not a malicious one.
    """

    def __init__(self, per_minute: int) -> None:
        self._per_minute = per_minute
        self._hits: dict[str, deque[float]] = defaultdict(deque)

    def allow(self, key: str) -> bool:
        now = time.monotonic()
        window = self._hits[key]
        while window and now - window[0] > 60.0:
            window.popleft()
        if len(window) >= self._per_minute:
            return False
        window.append(now)
        if len(self._hits) > 5000:
            for k in [k for k, v in self._hits.items() if not v]:
                del self._hits[k]
        return True


def get_limiter(request: Request) -> RateLimiter:
    return request.app.state.limiter  # type: ignore[no-any-return]
