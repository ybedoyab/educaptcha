"""Record one real pass over the corpus into agents cassettes.

    uv run --project backend python backend/tools/record_cassettes.py

Only the parsed structured output is stored. Rerun after prompt changes.
"""

from __future__ import annotations

import asyncio
import json
import sys
from pathlib import Path
from typing import Any

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from educaptcha_agents import AgentSettings, analyze, route_agents  # noqa: E402
from educaptcha_agents.contracts import AgentOutput  # noqa: E402
from educaptcha_agents.model import get_model, set_factory  # noqa: E402
from educaptcha_agents.testing import _identify  # noqa: E402

from app.service import prepare_state  # noqa: E402
from app.settings import get_settings  # noqa: E402
from tools.replay_corpus import CORPUS, build_request  # noqa: E402

CASSETTES = Path(__file__).resolve().parents[2] / "agents" / "tests" / "fakes" / "cassettes"


class RecordingModel:
    def __init__(self, settings: AgentSettings) -> None:
        self._inner = get_model(settings, AgentOutput)
        self.saved = 0

    async def ainvoke(self, messages: Any, config: Any = None, **kw: Any) -> AgentOutput:
        agent, post_id = _identify(messages)
        result = await self._inner.ainvoke(messages, config, **kw)
        output = result if isinstance(result, AgentOutput) else AgentOutput.model_validate(result)

        target = CASSETTES / agent
        target.mkdir(parents=True, exist_ok=True)
        (target / f"{post_id}.json").write_text(
            json.dumps(output.model_dump(by_alias=True, mode="json"), indent=2) + "\n",
            encoding="utf-8",
        )
        self.saved += 1
        print(f"  {agent:6} {post_id:16} {len(output.signals)} signal(s)")
        return output


async def main() -> int:
    settings = get_settings()
    if not settings.google_api_key:
        print("needs GOOGLE_API_KEY in root .env", file=sys.stderr)
        return 2

    agent_settings = AgentSettings(
        model=settings.gemini_model,
        api_key=settings.google_api_key,
        thinking_level=settings.gemini_thinking_level,
        temperature=settings.gemini_temperature,
        timeout_ms=settings.llm_timeout_ms,
        llm_enabled=True,
    )
    recorder = RecordingModel(agent_settings)
    restore = set_factory(lambda _s, _t: recorder)
    corpus: list[dict[str, Any]] = json.loads(CORPUS.read_text(encoding="utf-8"))

    try:
        for post in corpus:
            req = build_request(post, "share", f"record-{post['id']}", dry_run=True)
            state = prepare_state(req, settings)
            graph_state = {
                "pretriage_benign": state["pretriage_benign"],
                "media": state["context"].media,  # type: ignore[attr-defined]
            }
            if route_agents(graph_state) == ["aggregate"]:  # type: ignore[arg-type]
                continue
            await analyze(state["context"], state["agent_settings"])  # type: ignore[arg-type]
    finally:
        restore()

    print(f"\n{recorder.saved} cassettes -> {CASSETTES}")
    return 0


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
