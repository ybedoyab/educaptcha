"""Shared agent runner helpers."""

from __future__ import annotations

import asyncio
import logging
from functools import lru_cache
from pathlib import Path
from typing import Any

from educaptcha_agents.contracts import AgentContext, AgentMedia, AgentOutput, AgentSettings
from educaptcha_agents.model import get_model

log = logging.getLogger(__name__)
PROMPTS = Path(__file__).resolve().parents[1] / "prompts"

# Bump when any prompt file changes: hashed into the analysis cache key.
PROMPT_VERSION = 1


@lru_cache(maxsize=8)
def load_prompt(name: str) -> str:
    return (PROMPTS / f"{name}.md").read_text(encoding="utf-8")


async def run_agent(agent: str, messages: list[Any], settings: AgentSettings) -> dict[str, Any]:
    if not settings.llm_enabled:
        return {"agents_run": [agent], "agent_errors": [f"{agent}:llm-disabled"]}

    try:
        model = get_model(settings, AgentOutput)
        result = await asyncio.wait_for(model.ainvoke(messages), timeout=settings.timeout_ms / 1000)
    except TimeoutError:
        log.warning("%s agent timed out after %sms", agent, settings.timeout_ms)
        return {"agents_run": [agent], "agent_errors": [f"{agent}:timeout"]}
    except Exception as exc:  # noqa: BLE001
        log.warning("%s agent failed: %s", agent, exc)
        return {"agents_run": [agent], "agent_errors": [f"{agent}:{type(exc).__name__}"]}

    output = (
        result
        if isinstance(result, AgentOutput)
        else AgentOutput.model_validate(
            result.model_dump() if hasattr(result, "model_dump") else result
        )
    )
    return {"agents_run": [agent], "raw_signals": list(output.signals)}


def post_context(ctx: AgentContext, media: AgentMedia | None) -> str:
    e = ctx.engagement
    lines = [
        f"Post id: {ctx.post_id}",
        f"Author handle: {ctx.author_handle}",
        f"Category: {ctx.category or 'unknown'}",
        f"Media kind: {media.kind if media else 'text'}",
        f"Age: {e.age_minutes if e.age_minutes is not None else 'unknown'} minutes",
        f"Engagement: {e.reactions} reactions, {e.comments} comments, {e.shares} shares",
        "",
        "Body (English):",
        ctx.body_en,
        "",
        "Body (Spanish):",
        ctx.body_es,
    ]
    if ctx.tags:
        lines += ["", f"Tags: {', '.join(ctx.tags)}"]
    if ctx.top_comments:
        lines += ["", "Top comments:", *(f"- {c}" for c in ctx.top_comments)]
    if media is not None and media.is_svg and media.svg_text and media.kind != "chart":
        lines += ["", "Attached graphic (SVG source):", media.svg_text]
    if ctx.action == "comment" and ctx.comment_text:
        lines += ["", "The user is about to post this comment:", ctx.comment_text]
    return "\n".join(lines)
