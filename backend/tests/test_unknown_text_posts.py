"""Unknown text-only posts must not be discarded before agents/pretriage."""

from __future__ import annotations

from app.policy.gates import post_llm_gates, pre_llm_gates
from tests.conftest import make_request


def test_unknown_text_post_is_not_discarded_by_no_challenge_gate(catalog, settings, session):
    """Unbound text-only posts must reach agents after cooldown."""
    session.actions_since_last_intervention = 3
    urgent = {
        "id": "p-unknown-urgent",
        "body": {
            "en": "URGENT: They are hiding this. Share it NOW before they delete it.",
            "es": "URGENTE: Lo estan ocultando. Comparte YA antes de que lo borren.",
        },
        "handle": "@anon.host",
        "category": "community",
        "tags": ["alert"],
        "mediaKind": "text",
        "mediaAssetId": None,
        "reactions": 10,
        "comments": 1,
        "shares": 50,
        "time": {"en": "2m", "es": "2 min"},
        "topComments": [],
    }
    res = pre_llm_gates(
        make_request(urgent),
        session,
        catalog,
        settings,
        pretriage_benign=False,
    )
    assert res.decision is None
    assert res.should_run_agents is True
    assert res.gate is None


def test_unknown_benign_text_short_circuits_via_pretriage(catalog, settings, session):
    session.actions_since_last_intervention = 3
    benign = {
        "id": "p-unknown-garden",
        "body": {
            "en": "Community garden opens Saturday at 9.",
            "es": "El jardin comunitario abre el sabado a las 9.",
        },
        "handle": "@neighbor",
        "category": "community",
        "tags": ["garden"],
        "mediaKind": "text",
        "mediaAssetId": None,
        "reactions": 3,
        "comments": 0,
        "shares": 0,
        "time": {"en": "1h", "es": "1 h"},
        "topComments": [],
    }
    res = pre_llm_gates(
        make_request(benign),
        session,
        catalog,
        settings,
        pretriage_benign=True,
    )
    assert res.decision is not None
    assert res.decision.outcome == "continue"
    assert res.gate == "pretriage-benign"
    assert res.should_run_agents is False


def test_unknown_text_resolves_via_skill_fallback(catalog, settings, session):
    """After agents pick emotional-pressure, catalog falls back to ep-spot."""
    urgent = {
        "id": "p-unknown-urgent-2",
        "body": {
            "en": "URGENT: They are hiding this. Share it NOW before they delete it.",
            "es": "URGENTE: Lo estan ocultando. Comparte YA.",
        },
        "handle": "@anon.host",
        "category": "community",
        "tags": [],
        "mediaKind": "text",
        "mediaAssetId": None,
        "reactions": 1,
        "comments": 0,
        "shares": 20,
        "time": {"en": "1m", "es": "1 min"},
        "topComments": [],
    }
    final = post_llm_gates(
        make_request(urgent),
        session,
        catalog,
        settings,
        risk_score=0.9,
        dominant_skill="emotional-pressure",
    )
    assert final.decision.outcome == "intercept"
    assert final.decision.challenge_id == "ep-spot"
