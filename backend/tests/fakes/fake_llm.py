"""Deterministic stand-in for Gemini.

Returns *real* `AgentOutput` instances rather than MagicMocks, so a schema change
breaks the tests loudly instead of silently passing.
"""

from __future__ import annotations

import json
import re
from collections.abc import Sequence
from pathlib import Path
from typing import Any

from app.graph.llm import set_factory
from app.schemas.signals import AgentOutput
from app.settings import Settings

CASSETTES = Path(__file__).parent / "cassettes"

_AGENT_MARKERS = {
    "text": "You analyse social media posts",
    "image": "You inspect a photograph",
    "chart": "You inspect a chart",
}


def _identify(messages: Sequence[Any]) -> tuple[str, str]:
    """Recover (agent, post_id) from the outgoing messages."""
    system = str(getattr(messages[0], "content", ""))
    agent = next((a for a, marker in _AGENT_MARKERS.items() if marker in system), "text")

    blob = ""
    for m in messages[1:]:
        c = getattr(m, "content", "")
        if isinstance(c, str):
            blob += c
        elif isinstance(c, list):
            blob += " ".join(p.get("text", "") for p in c if isinstance(p, dict))
    match = re.search(r"Post id:\s*(\S+)", blob)
    return agent, (match.group(1) if match else "unknown")


class FakeStructuredModel:
    def __init__(self, responses: dict[tuple[str, str], AgentOutput], *, strict: bool) -> None:
        self._responses = responses
        self._strict = strict
        self.calls: list[tuple[str, str]] = []

    async def ainvoke(self, messages: Any, config: Any = None, **kwargs: Any) -> AgentOutput:
        key = _identify(messages)
        self.calls.append(key)
        if key in self._responses:
            return self._responses[key]
        if self._strict:
            raise AssertionError(f"no cassette for {key}")
        return AgentOutput(signals=[], no_signal_reason="no cassette")


def install_fake(
    responses: dict[tuple[str, str], AgentOutput] | None = None, *, strict: bool = False
) -> tuple[FakeStructuredModel, Any]:
    """Swap the model factory. Returns (model, restore_callable)."""
    model = FakeStructuredModel(responses or {}, strict=strict)

    def factory(_settings: Settings, _schema: type) -> FakeStructuredModel:
        return model

    return model, set_factory(factory)


def load_cassettes() -> dict[tuple[str, str], AgentOutput]:
    """Read recorded real responses from `cassettes/{agent}/{post_id}.json`."""
    out: dict[tuple[str, str], AgentOutput] = {}
    if not CASSETTES.exists():
        return out
    for agent_dir in CASSETTES.iterdir():
        if not agent_dir.is_dir():
            continue
        for f in agent_dir.glob("*.json"):
            out[(agent_dir.name, f.stem)] = AgentOutput.model_validate(
                json.loads(f.read_text(encoding="utf-8"))
            )
    return out
