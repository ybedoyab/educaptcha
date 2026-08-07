"""Which specialists wake up, and that the fan-in never deadlocks."""

from __future__ import annotations

from typing import Any

import pytest

from app.graph.build import get_graph, route_agents
from app.schemas.signals import AgentOutput, AgentSignal
from tests.conftest import make_request
from tests.fakes.fake_llm import install_fake


@pytest.fixture
def fake_llm():
    model, restore = install_fake()
    yield model
    restore()


def _llm_settings() -> Any:
    """Settings that consider the model available, so the fake actually gets called."""
    from app.settings import Settings

    return Settings(env="test", allow_no_llm=False, google_api_key="fake-key-for-tests")


async def _run(post: dict[str, Any], **kw: Any) -> dict[str, Any]:
    from app.service import prepare_state

    state = prepare_state(make_request(post, **kw), _llm_settings())
    return await get_graph().ainvoke(state)


class TestRouting:
    """`route_agents` on already-resolved state — no graph, no model."""

    def _state(self, post: dict[str, Any], benign: bool = False) -> dict[str, Any]:
        from app.service import prepare_state

        state = prepare_state(make_request(post), _llm_settings())
        state["pretriage_benign"] = benign or state["pretriage_benign"]
        return state

    def test_text_only_post_wakes_only_the_text_agent(self, corpus_by_id):
        assert route_agents(self._state(corpus_by_id["p-inside"])) == ["text_agent"]

    def test_photo_post_wakes_text_and_image(self, corpus_by_id):
        assert set(route_agents(self._state(corpus_by_id["p-flood-live"]))) == {
            "text_agent",
            "image_agent",
        }

    def test_chart_post_wakes_text_and_chart_but_never_image(self, corpus_by_id):
        targets = set(route_agents(self._state(corpus_by_id["p-chart"])))
        assert targets == {"text_agent", "chart_agent"}
        assert "image_agent" not in targets

    def test_svg_photo_post_wakes_only_text(self, corpus_by_id):
        """p-alert-urgent is mediaKind=photo but its asset is an SVG banner.

        No raster means no vision call; the SVG's words ("ALERT", "SHARE NOW")
        reach the text agent instead.
        """
        assert route_agents(self._state(corpus_by_id["p-alert-urgent"])) == ["text_agent"]

    def test_non_analyzable_placeholder_is_triaged_benign(self, corpus_by_id):
        """p-library uses neutral-news-report.svg, a content-free brand placeholder.

        With no binding, no analyzable media, a short body and no trigger
        vocabulary, pre-triage settles it outright — so the corpus's most likely
        false positive ("Workshop this Saturday: how to evaluate online sources")
        never reaches a model at all.
        """
        state = self._state(corpus_by_id["p-library"])
        assert state["pretriage_benign"] is True
        assert route_agents(state) == ["aggregate"]

    def test_benign_pretriage_skips_every_agent(self, corpus_by_id):
        assert route_agents(self._state(corpus_by_id["p-garden"], benign=True)) == ["aggregate"]

    @pytest.mark.parametrize(
        "post_id",
        ["p-garden", "p-library", "p-flood-live", "p-chart", "p-alert-urgent", "p-vaccine"],
    )
    def test_never_all_three_agents(self, corpus_by_id, post_id):
        assert set(route_agents(self._state(corpus_by_id[post_id]))) != {
            "text_agent",
            "image_agent",
            "chart_agent",
        }


class TestGraphExecution:
    """End-to-end through the compiled graph with a fake model."""

    async def test_conditional_fan_in_does_not_deadlock(self, corpus_by_id, fake_llm):
        """Regression guard for the NamedBarrierValue trap.

        With `add_edge([text, image, chart], aggregate)` this hangs to the
        recursion limit, because image/chart never write on a text-only post.
        """
        out = await _run(corpus_by_id["p-inside"])
        assert "risk_score" in out
        assert set(out["agents_run"]) == {"heuristic", "text"}

    async def test_benign_post_reaches_aggregate_with_no_model_call(self, corpus_by_id, fake_llm):
        out = await _run(corpus_by_id["p-garden"])
        assert out["pretriage_benign"] is True
        assert out["risk_score"] == 0.0
        assert fake_llm.calls == []

    async def test_photo_post_runs_both_agents(self, corpus_by_id, fake_llm):
        out = await _run(corpus_by_id["p-flood-live"])
        assert set(out["agents_run"]) == {"heuristic", "text", "image"}
        assert {a for a, _ in fake_llm.calls} == {"text", "image"}

    async def test_signals_from_parallel_agents_merge(self, corpus_by_id):
        """The operator.add reducer must keep both agents' writes."""
        responses = {
            ("text", "p-flood-live"): AgentOutput(
                signals=[
                    AgentSignal(
                        id="claimed-time-place",
                        skill="image-context",
                        confidence=0.9,
                        evidence="LIVE from tonight",
                    )
                ]
            ),
            ("image", "p-flood-live"): AgentOutput(
                signals=[
                    AgentSignal(
                        id="scene-caption-mismatch",
                        skill="image-context",
                        confidence=0.9,
                        evidence="daylight, dry pavement",
                    )
                ]
            ),
        }
        model, restore = install_fake(responses)
        try:
            out = await _run(corpus_by_id["p-flood-live"])
        finally:
            restore()

        ids = {s.id for s in out["raw_signals"]}
        assert {"claimed-time-place", "scene-caption-mismatch"} <= ids
        assert out["dominant_skill"] == "image-context"
        assert out["risk_score"] > 0.55

    async def test_agent_failure_degrades_to_continue(self, corpus_by_id):
        """A broken agent must never be able to interrupt the user."""

        class Boom:
            async def ainvoke(self, *a: Any, **k: Any) -> Any:
                raise RuntimeError("upstream 503")

        from app.graph.llm import set_factory

        restore = set_factory(lambda _s, _t: Boom())
        try:
            out = await _run(corpus_by_id["p-flood-live"])
        finally:
            restore()

        # The pre-triage share-velocity heuristic still fires (p-flood-live is
        # spreading fast), and that is correct — but a capped 0.25 nudge must
        # never reach the 0.55 threshold on its own.
        assert out["risk_score"] < 0.55
        assert any("RuntimeError" in e for e in out["agent_errors"])
