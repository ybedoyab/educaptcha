"""analysis_key must fingerprint every input that can change agent analysis."""

from __future__ import annotations

from app.cache.ttl_cache import analysis_key


def _base(**over: object) -> str:
    kw: dict[str, object] = {
        "post_id": "p-x",
        "body_en": "Hello",
        "body_es": "Hola",
        "category": "community",
        "tags": ["a", "b"],
        "author_handle": "@x",
        "reactions": 1,
        "comments": 2,
        "shares": 3,
        "age_minutes": 10,
        "asset_id": None,
        "media_kind": "text",
        "top_comments": ["c1"],
        "action": "share",
        "comment_text": None,
        "model": "fake",
        "prompt_version": 1,
        "weights_version": 1,
    }
    kw.update(over)
    return analysis_key(**kw)  # type: ignore[arg-type]


def test_identical_payload_same_key() -> None:
    assert _base() == _base()


def test_body_es_changes_key() -> None:
    assert _base(body_es="Hola") != _base(body_es="Hola!")


def test_shares_change_key() -> None:
    assert _base(shares=3) != _base(shares=99)


def test_age_minutes_changes_key() -> None:
    assert _base(age_minutes=10) != _base(age_minutes=60)


def test_top_comments_change_key() -> None:
    assert _base(top_comments=["c1"]) != _base(top_comments=["c1", "c2"])


def test_tags_change_key() -> None:
    assert _base(tags=["a", "b"]) != _base(tags=["a", "c"])


def test_tag_order_does_not_change_key() -> None:
    assert _base(tags=["b", "a"]) == _base(tags=["a", "b"])
