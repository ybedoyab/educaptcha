"""Which specialists wake up, and that the fan-in never deadlocks."""

from __future__ import annotations

import pytest

from educaptcha_agents.contracts import (
    AgentContext,
    AgentEngagement,
    AgentMedia,
    AgentSettings,
    AgentSignal,
)
from educaptcha_agents.graph import analyze, get_graph, route_agents
from educaptcha_agents.testing import install_fake


@pytest.fixture
def fake_llm():
    model, restore = install_fake()
    yield model
    restore()


def _settings() -> AgentSettings:
    return AgentSettings(
        model="fake",
        api_key="fake-key",
        thinking_level="minimal",
        temperature=0.0,
        timeout_ms=1800,
        llm_enabled=True,
    )


def _ctx(
    *,
    post_id: str = "p-x",
    media: AgentMedia | None = None,
    benign: bool = False,
    body: str = "hello",
) -> AgentContext:
    return AgentContext(
        post_id=post_id,
        body_en=body,
        body_es=body,
        category="community",
        tags=[],
        author_handle="@x",
        engagement=AgentEngagement(),
        action="share",
        media=media,
        pretriage_benign=benign,
    )


def _state(ctx: AgentContext) -> dict:
    return {
        "context": ctx,
        "settings": _settings(),
        "media": ctx.media,
        "pretriage_benign": ctx.pretriage_benign,
        "raw_signals": [],
        "agents_run": ["heuristic"],
        "agent_errors": [],
    }


class TestRouting:
    def test_text_only_post_wakes_only_the_text_agent(self):
        assert route_agents(_state(_ctx())) == ["text_agent"]

    def test_photo_post_wakes_text_and_image(self):
        media = AgentMedia(
            kind="photo",
            analyzable=True,
            has_raster=True,
            wants_image_agent=True,
            data_b64="abc",
            mime="image/webp",
        )
        assert set(route_agents(_state(_ctx(media=media)))) == {"text_agent", "image_agent"}

    def test_chart_post_wakes_text_and_chart_but_never_image(self):
        media = AgentMedia(
            kind="chart",
            analyzable=True,
            is_svg=True,
            wants_chart_agent=True,
            svg_text="<svg/>",
        )
        targets = set(route_agents(_state(_ctx(media=media))))
        assert targets == {"text_agent", "chart_agent"}
        assert "image_agent" not in targets

    def test_svg_photo_without_raster_wakes_only_text(self):
        media = AgentMedia(kind="photo", analyzable=True, is_svg=True, svg_text="<svg>ALERT</svg>")
        assert route_agents(_state(_ctx(media=media))) == ["text_agent"]

    def test_benign_pretriage_skips_every_agent(self):
        assert route_agents(_state(_ctx(benign=True))) == ["aggregate"]


class TestGraphExecution:
    async def test_conditional_fan_in_does_not_deadlock(self, fake_llm):
        media = AgentMedia(
            kind="photo",
            analyzable=True,
            has_raster=True,
            wants_image_agent=True,
            data_b64="abc",
            mime="image/webp",
        )
        out = await get_graph().ainvoke(_state(_ctx(post_id="p-flood-live", media=media)))
        assert "raw_signals" in out
        assert set(fake_llm.calls) <= {("text", "p-flood-live"), ("image", "p-flood-live")}

    async def test_analyze_returns_seed_plus_agent_signals(self, fake_llm):
        seed = AgentSignal(
            id="share-velocity",
            skill="emotional-pressure",
            confidence=1.0,
            evidence="fast shares",
        )
        ctx = _ctx(post_id="p-inside")
        ctx = AgentContext(
            post_id=ctx.post_id,
            body_en=ctx.body_en,
            body_es=ctx.body_es,
            category=ctx.category,
            tags=ctx.tags,
            author_handle=ctx.author_handle,
            engagement=ctx.engagement,
            action=ctx.action,
            media=None,
            seed_signals=[seed],
            pretriage_benign=False,
        )
        result = await analyze(ctx, _settings())
        assert any(s.id == "share-velocity" for s in result.signals)
        assert "heuristic" in result.agents_run
