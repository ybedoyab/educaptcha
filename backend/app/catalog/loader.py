"""Loads and validates `catalog.json` at import time.

The process refuses to start on a malformed catalog: a bad challenge id reaching
the frontend is unrecoverable (`OpenFeedChallengeDialog` indexes the record
unguarded, so an unknown id means the dialog never opens and the flow wedges).
"""

from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel

from app.schemas.common import SkillId

CATALOG_PATH = Path(__file__).with_name("catalog.json")


class _Model(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, extra="forbid")


class ChallengePair(_Model):
    initial: str
    transfer: str | None = None
    transfer_post: str | None = None


class PostBinding(_Model):
    skill: SkillId
    initial: str
    transfer: str | None = None
    transfer_post: str | None = None


class MediaEntry(_Model):
    public_path: str
    type: str
    is_svg: bool
    has_raster: bool
    analyzable: bool


class Catalog(_Model):
    catalog_version: int
    generated_from: list[str]
    challenge_ids: list[str]
    skills: list[SkillId]
    actionable_skills: list[SkillId]
    skill_to_challenge: dict[str, ChallengePair]
    post_bindings: dict[str, PostBinding]
    media: dict[str, MediaEntry]

    def model_post_init(self, _ctx: object) -> None:
        known = set(self.challenge_ids)
        for skill, pair in self.skill_to_challenge.items():
            for cid in (pair.initial, pair.transfer):
                if cid is not None and cid not in known:
                    raise ValueError(f"skill_to_challenge[{skill}] -> unknown challenge {cid!r}")
        for post_id, b in self.post_bindings.items():
            for cid in (b.initial, b.transfer):
                if cid is not None and cid not in known:
                    raise ValueError(f"post_bindings[{post_id}] -> unknown challenge {cid!r}")

    def resolve(
        self, post_id: str, skill: SkillId | None
    ) -> tuple[str, str | None, str | None] | None:
        """Resolve a challenge, post binding first.

        Post bindings win because the mapping is not a function of skill alone:
        `p-inside` is `emotional-pressure` but binds to `ep-transfer`, and
        `p-flood-today` is `image-context` but binds to `ic-transfer`. Falling
        back to the skill map for those would send the wrong minigame.

        Returns (initial, transfer, transfer_post) or None when nothing maps —
        the `ai-content` / `sources` case, which must resolve to "continue".
        """
        binding = self.post_bindings.get(post_id)
        if binding is not None:
            return binding.initial, binding.transfer, binding.transfer_post
        if skill is not None:
            pair = self.skill_to_challenge.get(skill)
            if pair is not None:
                return pair.initial, pair.transfer, pair.transfer_post
        return None


@lru_cache
def get_catalog() -> Catalog:
    return Catalog.model_validate(json.loads(CATALOG_PATH.read_text(encoding="utf-8")))
