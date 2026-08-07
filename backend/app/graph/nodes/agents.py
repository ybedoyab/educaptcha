"""The three specialist nodes.

Every node is exception-proof. A timeout, a 429, or a schema-validation failure
returns an `agent_errors` entry and no signals — degradation always falls toward
"continue", never toward interrupting the user on a technicality.
"""

from __future__ import annotations

import asyncio
import logging
from functools import lru_cache
from pathlib import Path
from typing import Any

from langchain_core.messages import HumanMessage, SystemMessage

from app.graph.llm import get_model
from app.graph.state import RiskState
from app.media.registry import ResolvedMedia
from app.schemas.risk import RiskAnalyzeRequest
from app.schemas.signals import AgentOutput
from app.settings import Settings, get_settings

log = logging.getLogger(__name__)
PROMPTS = Path(__file__).resolve().parents[1] / "prompts"

# Bump when any prompt file changes: hashed into the analysis cache key so a
# prompt edit invalidates cached verdicts instead of serving stale ones.
PROMPT_VERSION = 1


@lru_cache(maxsize=8)
def _prompt(name: str) -> str:
    return (PROMPTS / f"{name}.md").read_text(encoding="utf-8")


async def _run(agent: str, messages: list[Any], settings: Settings) -> dict[str, Any]:
    if not settings.llm_enabled:
        return {"agents_run": [agent], "agent_errors": [f"{agent}:llm-disabled"]}

    try:
        model = get_model(settings, AgentOutput)
        result = await asyncio.wait_for(
            model.ainvoke(messages), timeout=settings.llm_timeout_ms / 1000
        )
    except TimeoutError:
        log.warning("%s agent timed out after %sms", agent, settings.llm_timeout_ms)
        return {"agents_run": [agent], "agent_errors": [f"{agent}:timeout"]}
    except Exception as exc:  # noqa: BLE001 — never let an agent break the request
        log.warning("%s agent failed: %s", agent, exc)
        return {"agents_run": [agent], "agent_errors": [f"{agent}:{type(exc).__name__}"]}

    output = result if isinstance(result, AgentOutput) else AgentOutput.model_validate(result)
    return {"agents_run": [agent], "raw_signals": list(output.signals)}


def _post_context(req: RiskAnalyzeRequest, media: ResolvedMedia | None) -> str:
    e = req.post.engagement
    lines = [
        f"Post id: {req.post.id}",
        f"Author handle: {req.post.author.handle}",
        f"Category: {req.post.category or 'unknown'}",
        f"Media kind: {req.post.media.kind}",
        f"Age: {e.age_minutes if e.age_minutes is not None else 'unknown'} minutes",
        f"Engagement: {e.reactions} reactions, {e.comments} comments, {e.shares} shares",
        "",
        "Body (English):",
        req.post.body.en,
        "",
        "Body (Spanish):",
        req.post.body.es,
    ]
    if req.post.tags:
        lines += ["", f"Tags: {', '.join(req.post.tags)}"]
    if req.post.top_comments:
        lines += ["", "Top comments:", *(f"- {c}" for c in req.post.top_comments)]
    # A text-bearing SVG (the urgency banner) has no raster, so its words would
    # otherwise be invisible to every agent. Give them to the text agent.
    if media is not None and media.is_svg and media.svg_text and media.kind != "chart":
        lines += ["", "Attached graphic (SVG source):", media.svg_text]
    if req.action == "comment" and req.comment_text:
        lines += ["", "The user is about to post this comment:", req.comment_text]
    return "\n".join(lines)


def _settings_of(state: RiskState) -> Settings:
    return state.get("settings") or get_settings()


async def text_agent(state: RiskState) -> dict[str, Any]:
    req = state["req"]
    messages = [
        SystemMessage(content=_prompt("text_agent")),
        HumanMessage(content=_post_context(req, state.get("media"))),
    ]
    return await _run("text", messages, _settings_of(state))


async def image_agent(state: RiskState) -> dict[str, Any]:
    req = state["req"]
    media = state.get("media")
    if media is None or not media.has_raster:
        return {"agents_run": ["image"], "agent_errors": ["image:no-raster"]}

    caption = (
        f"Post id: {req.post.id}\n\n"
        "Caption (English):\n"
        f"{req.post.body.en}\n\n"
        "Caption (Spanish):\n"
        f"{req.post.body.es}\n\n"
        "Judge only whether what is visible is consistent with this caption."
    )
    messages = [
        SystemMessage(content=_prompt("image_agent")),
        HumanMessage(
            content=[
                {"type": "text", "text": caption},
                {
                    "type": "image_url",
                    "image_url": {"url": f"data:{media.mime};base64,{media.data_b64}"},
                },
            ]
        ),
    ]
    return await _run("image", messages, _settings_of(state))


async def chart_agent(state: RiskState) -> dict[str, Any]:
    req = state["req"]
    media = state.get("media")
    if media is None:
        return {"agents_run": ["chart"], "agent_errors": ["chart:no-media"]}

    header = f"Post id: {req.post.id}\n\nThe post's claim about this chart:\n{req.post.body.en}\n\n"

    content: Any
    if media.is_svg and media.svg_text:
        # Text mode: exact numbers, no image tokens.
        content = f"{header}Chart SVG source:\n{media.svg_text}"
    elif media.has_raster:
        content = [
            {"type": "text", "text": header},
            {
                "type": "image_url",
                "image_url": {"url": f"data:{media.mime};base64,{media.data_b64}"},
            },
        ]
    else:
        return {"agents_run": ["chart"], "agent_errors": ["chart:unreadable"]}

    messages = [SystemMessage(content=_prompt("chart_agent")), HumanMessage(content=content)]
    return await _run("chart", messages, _settings_of(state))
