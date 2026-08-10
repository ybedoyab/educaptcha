"""Image specialist."""

from __future__ import annotations

from typing import Any

from langchain_core.messages import HumanMessage, SystemMessage

from educaptcha_agents.nodes import load_prompt, run_agent


async def image_agent(state: dict[str, Any]) -> dict[str, Any]:
    ctx = state["context"]
    settings = state["settings"]
    media = state.get("media")
    if media is None or not media.has_raster:
        return {"agents_run": ["image"], "agent_errors": ["image:no-raster"]}

    caption = (
        f"Post id: {ctx.post_id}\n\n"
        "Caption (English):\n"
        f"{ctx.body_en}\n\n"
        "Caption (Spanish):\n"
        f"{ctx.body_es}\n\n"
        "Judge only whether what is visible is consistent with this caption."
    )
    messages = [
        SystemMessage(content=load_prompt("image_agent")),
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
    return await run_agent("image", messages, settings)
