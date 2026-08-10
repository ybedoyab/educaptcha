"""Backend↔agents routing still matches corpus media resolution."""

from __future__ import annotations

from typing import Any

import pytest
from educaptcha_agents import route_agents

from app.service import prepare_state, to_agent_media
from app.settings import Settings
from tests.conftest import make_request


def _llm_settings() -> Settings:
    return Settings(env="test", allow_no_llm=False, google_api_key="fake-key-for-tests")


def _route_state(post: dict[str, Any], *, benign: bool | None = None) -> dict[str, Any]:
    state = prepare_state(make_request(post), _llm_settings())
    if benign is not None:
        state["pretriage_benign"] = benign
    return {
        "pretriage_benign": state["pretriage_benign"],
        "media": to_agent_media(state["media"]),  # type: ignore[arg-type]
    }


class TestCorpusRouting:
    def test_text_only_post_wakes_only_the_text_agent(self, corpus_by_id):
        assert route_agents(_route_state(corpus_by_id["p-inside"])) == ["text_agent"]

    def test_photo_post_wakes_text_and_image(self, corpus_by_id):
        assert set(route_agents(_route_state(corpus_by_id["p-flood-live"]))) == {
            "text_agent",
            "image_agent",
        }

    def test_chart_post_wakes_text_and_chart_but_never_image(self, corpus_by_id):
        targets = set(route_agents(_route_state(corpus_by_id["p-chart"])))
        assert targets == {"text_agent", "chart_agent"}
        assert "image_agent" not in targets

    def test_svg_photo_post_wakes_only_text(self, corpus_by_id):
        assert route_agents(_route_state(corpus_by_id["p-alert-urgent"])) == ["text_agent"]

    def test_non_analyzable_placeholder_is_triaged_benign(self, corpus_by_id):
        state = prepare_state(make_request(corpus_by_id["p-library"]), _llm_settings())
        assert state["pretriage_benign"] is True
        assert route_agents(_route_state(corpus_by_id["p-library"])) == ["aggregate"]

    def test_benign_pretriage_skips_every_agent(self, corpus_by_id):
        assert route_agents(_route_state(corpus_by_id["p-garden"], benign=True)) == ["aggregate"]

    @pytest.mark.parametrize(
        "post_id",
        ["p-garden", "p-library", "p-flood-live", "p-chart", "p-alert-urgent", "p-vaccine"],
    )
    def test_never_all_three_agents(self, corpus_by_id, post_id):
        assert set(route_agents(_route_state(corpus_by_id[post_id]))) != {
            "text_agent",
            "image_agent",
            "chart_agent",
        }
