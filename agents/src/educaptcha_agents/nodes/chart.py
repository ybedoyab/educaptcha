"""Chart specialist."""

from __future__ import annotations

from typing import Any

from langchain_core.messages import HumanMessage, SystemMessage

from educaptcha_agents.nodes import load_prompt, run_agent


async def chart_agent(state: dict[str, Any]) -> dict[str, Any]:
    ctx = state["context"]
    settings = state["settings"]
    media = state.get("media")
    if media is None:
        return {"agents_run": ["chart"], "agent_errors": ["chart:no-media"]}

    header = f"Post id: {ctx.post_id}\n\nThe post's claim about this chart:\n{ctx.body_en}\n\n"

    content: Any
    if media.is_svg and media.svg_text:
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

    messages = [SystemMessage(content=load_prompt("chart_agent")), HumanMessage(content=content)]
    return await run_agent("chart", messages, settings)
