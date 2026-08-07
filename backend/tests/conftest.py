from __future__ import annotations

import json
from collections.abc import Iterator
from pathlib import Path
from typing import Any

import pytest

from app.catalog.loader import get_catalog
from app.schemas.common import LocalizedText
from app.schemas.risk import (
    PostAuthor,
    PostEngagement,
    PostMedia,
    PostPayload,
    RiskAnalyzeRequest,
    SessionRef,
)
from app.session.store import SessionState
from app.settings import Settings

FIXTURES = Path(__file__).parent / "fixtures"


_LOOPBACK = {"127.0.0.1", "::1", "localhost", "0.0.0.0"}


@pytest.fixture(autouse=True)
def _no_network(monkeypatch: pytest.MonkeyPatch) -> None:
    """Any test that reaches an external host is a bug. Fail loudly, not slowly.

    Loopback stays open: asyncio's ProactorEventLoop builds its self-pipe over a
    127.0.0.1 socket, so blocking it outright stops the event loop from starting.
    """
    import socket

    real_connect = socket.socket.connect

    def guarded(self: socket.socket, address: object, /) -> object:
        host = address[0] if isinstance(address, tuple) else address
        if isinstance(host, str) and host not in _LOOPBACK:
            raise RuntimeError(f"unexpected network call in a unit test: {host}")
        return real_connect(self, address)  # type: ignore[arg-type]

    monkeypatch.setattr(socket.socket, "connect", guarded, raising=False)


@pytest.fixture(scope="session")
def corpus() -> list[dict[str, Any]]:
    """The 18 real OpenFeed posts, dumped from the TS modules by export_catalog.mjs."""
    return json.loads((FIXTURES / "corpus.json").read_text(encoding="utf-8"))


@pytest.fixture(scope="session")
def corpus_by_id(corpus: list[dict[str, Any]]) -> dict[str, dict[str, Any]]:
    return {p["id"]: p for p in corpus}


@pytest.fixture
def catalog() -> Any:
    return get_catalog()


@pytest.fixture
def settings() -> Settings:
    return Settings(
        env="test",
        allow_no_llm=True,
        risk_threshold=0.55,
        cooldown_actions=3,
        prewarm_cache=False,
        metrics_sink="noop",
    )


@pytest.fixture
def session() -> SessionState:
    return SessionState()


def make_request(
    post: dict[str, Any],
    *,
    action: str = "share",
    comment_text: str | None = None,
    mode: str = "free-browse",
    session_id: str = "test-session-0001",
    dry_run: bool = False,
) -> RiskAnalyzeRequest:
    """Build a request from a corpus entry, excluding the curated answer fields."""
    return RiskAnalyzeRequest(
        action=action,  # type: ignore[arg-type]
        mode=mode,  # type: ignore[arg-type]
        dry_run=dry_run,
        comment_text=comment_text,
        post=PostPayload(
            id=post["id"],
            body=LocalizedText(**post["body"]),
            category=post["category"],
            tags=post["tags"],
            author=PostAuthor(handle=post["handle"]),
            engagement=PostEngagement(
                reactions=post["reactions"],
                comments=post["comments"],
                shares=post["shares"],
                age_minutes=_age_minutes(post["time"]["en"]),
            ),
            media=PostMedia(kind=post["mediaKind"], asset_id=post["mediaAssetId"]),
            top_comments=post["topComments"],
        ),
        session=SessionRef(id=session_id),
    )


def _age_minutes(rel: str) -> int | None:
    """'18m' -> 18, '3h' -> 180, '2d' -> 2880."""
    import re

    m = re.match(r"\s*(\d+)\s*([mhd])", rel.strip(), re.I)
    if not m:
        return None
    n, unit = int(m.group(1)), m.group(2).lower()
    return n * {"m": 1, "h": 60, "d": 1440}[unit]


@pytest.fixture
def request_factory() -> Iterator[Any]:
    yield make_request
