"""Text specialist."""

from __future__ import annotations

from typing import Any

from langchain_core.messages import HumanMessage, SystemMessage

from educaptcha_agents.nodes import load_prompt, post_context, run_agent


async def text_agent(state: dict[str, Any]) -> dict[str, Any]:
    ctx = state["context"]
    settings = state["settings"]
    messages = [
        SystemMessage(content=load_prompt("text_agent")),
        HumanMessage(content=post_context(ctx, state.get("media"))),
    ]
    return await run_agent("text", messages, settings)
