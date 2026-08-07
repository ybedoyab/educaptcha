"""Server-owned session counters.

Cooldown and no-repeat-skill are policy, not preference. Today the frontend keeps
them in a `useRef`, so a page refresh silently disables the verification pause —
policy a client can reset isn't policy. The client still sends its counters, but
only for *reconciliation*: the server takes the max, so a client can raise the
counter after a reload but never lower it.
"""

from __future__ import annotations

import time
from dataclasses import dataclass, field
from typing import Protocol

from app.schemas.common import SkillId

_RECENT_SKILLS_MAX = 5


@dataclass
class SessionState:
    actions_since_last_intervention: int = 0
    recent_skills: list[SkillId] = field(default_factory=list)
    updated_at: float = field(default_factory=time.monotonic)

    def record_action(self) -> None:
        self.actions_since_last_intervention += 1

    def record_intervention(self, skill: SkillId | None) -> None:
        self.actions_since_last_intervention = 0
        if skill is not None:
            self.recent_skills = [skill, *[s for s in self.recent_skills if s != skill]][
                :_RECENT_SKILLS_MAX
            ]

    def reconcile(self, client_count: int | None, client_skills: list[SkillId] | None) -> None:
        """Merge client mirrors upward only."""
        if client_count is not None:
            self.actions_since_last_intervention = max(
                self.actions_since_last_intervention, client_count
            )
        if client_skills:
            merged = list(self.recent_skills)
            for s in client_skills:
                if s not in merged:
                    merged.append(s)
            self.recent_skills = merged[:_RECENT_SKILLS_MAX]

    @property
    def last_skill(self) -> SkillId | None:
        return self.recent_skills[0] if self.recent_skills else None


class SessionStore(Protocol):
    def get(self, session_id: str) -> SessionState: ...
    def put(self, session_id: str, state: SessionState) -> None: ...


class MemorySessionStore:
    """TTL + LRU eviction, single process.

    Correct only with `--workers 1`; the Dockerfile pins that and says why.
    Swap in a Firestore-backed store behind the same Protocol for multi-instance.
    """

    def __init__(self, ttl_seconds: int = 1800, max_entries: int = 2000) -> None:
        self._ttl = ttl_seconds
        self._max = max_entries
        self._data: dict[str, SessionState] = {}

    def _evict(self) -> None:
        now = time.monotonic()
        stale = [k for k, v in self._data.items() if now - v.updated_at > self._ttl]
        for k in stale:
            del self._data[k]
        overflow = len(self._data) - self._max
        if overflow > 0:
            oldest = sorted(self._data.items(), key=lambda kv: kv[1].updated_at)[:overflow]
            for k, _ in oldest:
                del self._data[k]

    def get(self, session_id: str) -> SessionState:
        self._evict()
        state = self._data.get(session_id)
        if state is None:
            state = SessionState()
            self._data[session_id] = state
        return state

    def put(self, session_id: str, state: SessionState) -> None:
        state.updated_at = time.monotonic()
        self._data[session_id] = state
        self._evict()
