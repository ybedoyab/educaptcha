"""Golden-table regression over the whole corpus.

A prompt, weight or threshold change shows up here as a reviewable diff instead
of a surprise on demo day. Regenerate deliberately:

    cd backend
    uv run python tools/replay_corpus.py --fake --sequential --json \\
        > tests/fixtures/golden_sequential.json
    uv run python tools/replay_corpus.py --fake --fresh-session --json \\
        > tests/fixtures/golden_fresh.json
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import pytest

FIXTURES = Path(__file__).parent / "fixtures"

# Fields that must not drift. Latency is excluded — it is machine-dependent.
_STABLE = ("post", "score", "skill", "challenge", "outcome", "gate", "wouldPractice")


def _replay(sequential: bool) -> list[dict[str, Any]]:
    import argparse
    import asyncio

    from tools.replay_corpus import run

    args = argparse.Namespace(
        action="share",
        live=False,
        sequential=sequential,
        fresh_session=not sequential,
        threshold=0.55,
        json=True,
    )
    rows: list[dict[str, Any]] = []
    import contextlib
    import io

    buf = io.StringIO()
    with contextlib.redirect_stdout(buf):
        asyncio.run(run(args))
    rows = json.loads(buf.getvalue())
    return rows


def _stable(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return [{k: r[k] for k in _STABLE} for r in rows]


@pytest.mark.parametrize(
    ("sequential", "golden"),
    [(True, "golden_sequential.json"), (False, "golden_fresh.json")],
    ids=["sequential", "fresh-session"],
)
def test_replay_matches_golden(sequential: bool, golden: str):
    expected = _stable(json.loads((FIXTURES / golden).read_text(encoding="utf-8")))
    actual = _stable(_replay(sequential))
    assert actual == expected, (
        f"decision table drifted from {golden}; if intended, regenerate it "
        "(see this module's docstring) and review the diff"
    )


def test_fresh_session_catches_every_curated_trigger():
    """Under-triggering guard: all 8 authored trigger posts must fire."""
    rows = json.loads((FIXTURES / "golden_fresh.json").read_text(encoding="utf-8"))
    expected = [r["post"] for r in rows if r["expected"]]
    fired = [r["post"] for r in rows if r["outcome"] == "intercept"]
    assert len(expected) == 8
    assert fired == expected


def test_no_benign_post_is_ever_interrupted():
    """Over-triggering guard, the one that matters most for the product."""
    for golden in ("golden_fresh.json", "golden_sequential.json"):
        rows = json.loads((FIXTURES / golden).read_text(encoding="utf-8"))
        false_positives = [
            r["post"] for r in rows if r["outcome"] == "intercept" and not r["expected"]
        ]
        assert false_positives == [], f"{golden}: interrupted benign posts {false_positives}"


def test_cooldown_keeps_a_full_feed_browse_quiet():
    """Reading all 18 posts must not produce 8 interruptions."""
    rows = json.loads((FIXTURES / "golden_sequential.json").read_text(encoding="utf-8"))
    intercepts = sum(1 for r in rows if r["outcome"] == "intercept")
    assert intercepts <= 4, f"{intercepts} interruptions across one feed browse is nagging"


def test_challenge_always_matches_the_authored_binding():
    for golden in ("golden_fresh.json", "golden_sequential.json"):
        rows = json.loads((FIXTURES / golden).read_text(encoding="utf-8"))
        for r in rows:
            if r["outcome"] == "intercept":
                assert r["challenge"] == r["expectedChallenge"], r["post"]
