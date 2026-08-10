"""End-to-end through the real FastAPI app with a fake model."""

from __future__ import annotations

from typing import Any

import pytest
from educaptcha_agents.contracts import AgentOutput, AgentSignal
from fastapi.testclient import TestClient

from app.main import create_app
from tests.conftest import make_request
from tests.fakes.fake_llm import install_fake


@pytest.fixture
def client(monkeypatch: pytest.MonkeyPatch):
    monkeypatch.setenv("ENV", "test")
    monkeypatch.setenv("ALLOW_NO_LLM", "false")
    monkeypatch.setenv("GOOGLE_API_KEY", "fake-key-for-tests")
    monkeypatch.setenv("METRICS_SINK", "noop")
    monkeypatch.setenv("PREWARM_CACHE", "false")
    monkeypatch.setenv("LANGSMITH_TRACING", "false")

    from app.settings import get_settings

    get_settings.cache_clear()
    with TestClient(create_app()) as c:
        yield c
    get_settings.cache_clear()


@pytest.fixture
def fake_llm():
    model, restore = install_fake()
    yield model
    restore()


def _body(post: dict[str, Any], **kw: Any) -> dict[str, Any]:
    return make_request(post, **kw).model_dump(by_alias=True, mode="json")


def test_healthz(client):
    r = client.get("/healthz")
    assert r.status_code == 200
    assert r.json()["ok"] is True


def test_catalog_endpoint_exposes_the_id_set(client):
    ids = client.get("/catalog").json()["challengeIds"]
    assert len(ids) == 12
    assert "ic-match" in ids


def test_verify_link_is_never_intercepted(client, corpus_by_id, fake_llm):
    r = client.post("/risk/analyze", json=_body(corpus_by_id["p-flood-live"], action="verify-link"))
    assert r.status_code == 200
    body = r.json()
    assert body["decision"]["outcome"] == "verify-ack"
    assert body["decision"]["shouldIntervene"] is False
    assert body["decision"]["acknowledgement"]["es"]  # bilingual, always
    assert fake_llm.calls == []


def test_benign_post_is_decided_without_a_model_call(client, corpus_by_id, fake_llm):
    r = client.post("/risk/analyze", json=_body(corpus_by_id["p-garden"]))
    body = r.json()
    assert body["decision"]["outcome"] == "continue"
    assert body["diagnostics"]["gate"] in {"cooldown", "pretriage-benign"}
    assert fake_llm.calls == []


def test_response_is_camel_case_for_the_frontend(client, corpus_by_id, fake_llm):
    body = client.post("/risk/analyze", json=_body(corpus_by_id["p-garden"])).json()
    assert "shouldIntervene" in body["decision"]
    assert "riskScore" in body["diagnostics"]
    assert "actionsSinceLastIntervention" in body["session"]


def test_cooldown_then_intercept_across_requests(client, corpus_by_id):
    """Three shares in one session: the third clears the cooldown and interrupts."""
    responses = {
        ("text", "p-flood-live"): AgentOutput(
            signals=[
                AgentSignal(
                    id="claimed-time-place",
                    skill="image-context",
                    confidence=0.95,
                    evidence="LIVE from tonight's emergency response",
                )
            ]
        ),
        ("image", "p-flood-live"): AgentOutput(
            signals=[
                AgentSignal(
                    id="scene-caption-mismatch",
                    skill="image-context",
                    confidence=0.9,
                    evidence="daylight and dry pavement",
                )
            ]
        ),
    }
    _, restore = install_fake(responses)
    try:
        payload = _body(corpus_by_id["p-flood-live"])
        outcomes = [client.post("/risk/analyze", json=payload).json() for _ in range(3)]
    finally:
        restore()

    assert [o["decision"]["outcome"] for o in outcomes] == ["continue", "continue", "intercept"]
    assert outcomes[0]["diagnostics"]["gate"] == "cooldown"

    final = outcomes[2]["decision"]
    assert final["challengeId"] == "ic-match"
    assert final["transferChallengeId"] == "ic-transfer"
    assert final["transferPostId"] == "p-flood-today"
    assert final["skill"] == "image-context"
    assert final["reason"]["en"] and final["reason"]["es"]
    # Counter resets so the next action does not immediately interrupt again.
    assert outcomes[2]["session"]["actionsSinceLastIntervention"] == 0


def test_dry_run_warms_the_cache_without_advancing_the_session(client, corpus_by_id, fake_llm):
    payload = _body(corpus_by_id["p-flood-live"], dry_run=True)
    for _ in range(5):
        r = client.post("/risk/analyze", json=payload)
    assert r.json()["session"]["actionsSinceLastIntervention"] == 0
    # First call analysed, the rest were served from cache.
    assert r.json()["diagnostics"]["path"] == "cache"


def test_unknown_media_asset_degrades_to_text_only(client, corpus_by_id, fake_llm):
    payload = _body(corpus_by_id["p-flood-live"])
    payload["post"]["media"]["assetId"] = "an-asset-this-service-has-never-seen"
    r = client.post("/risk/analyze", json=payload)
    assert r.status_code == 200
    assert "image" not in r.json()["diagnostics"]["agentsRun"]


def test_extra_fields_are_rejected(client, corpus_by_id):
    """`tone` and `triggerSkill` are curated answers and must not be accepted."""
    payload = _body(corpus_by_id["p-flood-live"])
    payload["post"]["tone"] = "manipulative"
    assert client.post("/risk/analyze", json=payload).status_code == 422


def test_rate_limit_kicks_in(client, corpus_by_id, fake_llm):
    payload = _body(corpus_by_id["p-garden"], dry_run=True)
    codes = {client.post("/risk/analyze", json=payload).status_code for _ in range(40)}
    assert 429 in codes


def test_metrics_event_accepts_anonymous_payload(client):
    r = client.post(
        "/metrics/event",
        json={
            "event": "intervention_shown",
            "sessionId": "anon-0000-1111",
            "occurredAt": "2026-08-07T12:00:00Z",
            "locale": "en",
            "skill": "image-context",
            "challengeId": "ic-match",
            "riskScore": 0.82,
        },
    )
    assert r.status_code == 202


def test_metrics_event_cannot_carry_free_text(client):
    """The privacy guarantee is structural, not a policy document."""
    r = client.post(
        "/metrics/event",
        json={
            "event": "intervention_shown",
            "sessionId": "anon-0000-1111",
            "occurredAt": "2026-08-07T12:00:00Z",
            "commentBody": "something the user typed",
        },
    )
    assert r.status_code == 422
