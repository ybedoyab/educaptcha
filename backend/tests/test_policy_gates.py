"""Parity port of `src/tests/LearningTriggerEngine.test.ts`.

Same five cases, same names, so the two suites can be diffed side by side when
someone changes either engine.
"""

from __future__ import annotations

from typing import Any

from app.policy.affirmation import is_affirming_comment, is_source_seeking_comment
from app.policy.gates import post_llm_gates, pre_llm_gates
from tests.conftest import make_request

FLOOD = "p-flood-live"


def _share(corpus_by_id: dict[str, Any], **kw: Any) -> Any:
    return make_request(corpus_by_id[FLOOD], **kw)


def test_guided_activates_on_first_share(corpus_by_id, catalog, settings, session):
    """Mirrors: forceScenario activates on first guided share."""
    res = pre_llm_gates(
        _share(corpus_by_id, mode="guided"),
        session,
        catalog,
        settings,
        pretriage_benign=False,
    )
    assert res.decision is not None
    assert res.decision.outcome == "intercept"
    assert res.decision.challenge_id == "ic-match"
    assert res.decision.reason is not None
    assert "when and where" in res.decision.reason.en.lower()
    assert res.should_run_agents is False  # guided never waits on a model


def test_free_browse_respects_cooldown(corpus_by_id, catalog, settings, session):
    """Mirrors: free browse respects cooldown — 1st and 2nd continue, 3rd proceeds."""
    outcomes = []
    for _ in range(3):
        res = pre_llm_gates(
            _share(corpus_by_id), session, catalog, settings, pretriage_benign=False
        )
        outcomes.append((res.gate, res.should_run_agents))

    assert outcomes[0] == ("cooldown", False)
    assert outcomes[1] == ("cooldown", False)
    # Third qualifying action clears the gate and reaches the agents.
    assert outcomes[2] == (None, True)


def test_does_not_repeat_the_same_skill_immediately(corpus_by_id, catalog, settings, session):
    """Mirrors: does not repeat the same skill immediately."""
    session.actions_since_last_intervention = 3
    session.recent_skills = ["image-context"]

    res = pre_llm_gates(_share(corpus_by_id), session, catalog, settings, pretriage_benign=False)
    assert res.decision is not None
    assert res.decision.outcome == "continue"
    assert res.gate == "no-repeat-skill"


def test_source_seeking_comments_do_not_trigger_affirming_warning():
    """Mirrors: source-seeking comments do not trigger affirming warning."""
    assert is_source_seeking_comment("Does anyone have the original source?") is True
    assert is_affirming_comment("Does anyone have the original source?") is False
    assert is_affirming_comment("This needs verification.") is False
    assert is_affirming_comment("I found a 2019 archive photo.") is False


def test_affirming_comments_can_trigger(corpus_by_id, catalog, settings, session):
    """Mirrors: affirming comments can trigger."""
    assert is_affirming_comment("I saw this in several groups, so it must be true.") is True

    session.actions_since_last_intervention = 3
    res = pre_llm_gates(
        _share(corpus_by_id, action="comment", comment_text="It must be true"),
        session,
        catalog,
        settings,
        pretriage_benign=False,
    )
    assert res.decision is None  # passed every gate, goes to the agents
    assert res.should_run_agents is True


def test_non_affirming_comment_is_suppressed(corpus_by_id, catalog, settings, session):
    session.actions_since_last_intervention = 3
    res = pre_llm_gates(
        _share(corpus_by_id, action="comment", comment_text="Does anyone have the source?"),
        session,
        catalog,
        settings,
        pretriage_benign=False,
    )
    assert res.decision is not None
    assert res.decision.outcome == "continue"
    assert res.gate == "non-affirming-comment"


def test_verify_does_not_block_desired_behavior(corpus_by_id, catalog, settings, session):
    """Mirrors: verify does not block desired behavior."""
    session.actions_since_last_intervention = 10
    res = pre_llm_gates(
        _share(corpus_by_id, action="verify-link"),
        session,
        catalog,
        settings,
        pretriage_benign=False,
    )
    assert res.decision is not None
    assert res.decision.outcome == "verify-ack"
    assert res.decision.acknowledgement is not None
    assert "good instinct" in res.decision.acknowledgement.en.lower()
    # verify-link must not advance the cooldown counter.
    assert session.actions_since_last_intervention == 10


def test_save_advances_counter_but_never_intercepts(corpus_by_id, catalog, settings, session):
    res = pre_llm_gates(
        _share(corpus_by_id, action="save"), session, catalog, settings, pretriage_benign=False
    )
    assert res.decision is not None
    assert res.decision.outcome == "continue"
    assert session.actions_since_last_intervention == 1


def test_dry_run_never_mutates_session(corpus_by_id, catalog, settings, session):
    """Speculative prefetch must be side-effect free or it eats the cooldown."""
    for _ in range(5):
        pre_llm_gates(
            _share(corpus_by_id, dry_run=True),
            session,
            catalog,
            settings,
            pretriage_benign=False,
        )
    assert session.actions_since_last_intervention == 0
    assert session.recent_skills == []


class TestChallengeResolution:
    """The binding rules that a naive skill->challenge table would get wrong."""

    def test_post_binding_wins_over_skill_map(self, corpus_by_id, catalog, settings, session):
        # p-inside is emotional-pressure but binds to ep-transfer, not ep-spot.
        session.actions_since_last_intervention = 3
        res = post_llm_gates(
            make_request(corpus_by_id["p-inside"]),
            session,
            catalog,
            settings,
            risk_score=0.9,
            dominant_skill="emotional-pressure",
        )
        assert res.decision.challenge_id == "ep-transfer"

    def test_flood_today_binds_to_transfer(self, corpus_by_id, catalog, settings, session):
        res = post_llm_gates(
            make_request(corpus_by_id["p-flood-today"]),
            session,
            catalog,
            settings,
            risk_score=0.9,
            dominant_skill="image-context",
        )
        assert res.decision.challenge_id == "ic-transfer"

    def test_primary_post_carries_the_transfer_chain(
        self, corpus_by_id, catalog, settings, session
    ):
        res = post_llm_gates(
            make_request(corpus_by_id[FLOOD]),
            session,
            catalog,
            settings,
            risk_score=0.9,
            dominant_skill="image-context",
        )
        assert res.decision.challenge_id == "ic-match"
        assert res.decision.transfer_challenge_id == "ic-transfer"
        assert res.decision.transfer_post_id == "p-flood-today"

    def test_skill_without_a_minigame_reports_but_does_not_intervene(
        self, corpus_by_id, catalog, settings, session
    ):
        """`sources` is a declared skill with no challenge — report, don't wedge."""
        res = post_llm_gates(
            make_request(corpus_by_id["p-thread"]),
            session,
            catalog,
            settings,
            risk_score=0.9,
            dominant_skill="sources",
        )
        assert res.decision.outcome == "continue"
        assert res.decision.challenge_id is None
        assert res.gate == "no-challenge-for-skill"
        assert res.would_practice == "sources"

    def test_below_threshold_continues(self, corpus_by_id, catalog, settings, session):
        res = post_llm_gates(
            make_request(corpus_by_id[FLOOD]),
            session,
            catalog,
            settings,
            risk_score=0.4,
            dominant_skill="image-context",
        )
        assert res.decision.outcome == "continue"
        assert res.gate == "below-threshold"
