"""Guards against the backend and frontend disagreeing about challenge ids.

An unknown id is unrecoverable in the UI: `OpenFeedChallengeDialog` indexes
`experienceMinigames` unguarded, so the dialog never opens and the flow wedges
with no way out. There is a matching test on the frontend side
(`src/tests/backendCatalog.test.ts`) that runs inside the existing `npm test`.
"""

from __future__ import annotations

import json
import subprocess
from pathlib import Path
from typing import get_args

import pytest

from app.catalog.loader import get_catalog
from app.schemas.common import ChallengeId, SkillId

REPO_ROOT = Path(__file__).resolve().parents[2]
SRC_DATA = REPO_ROOT / "frontend" / "src" / "data"


def test_challenge_id_literal_matches_catalog():
    """The Python Literal is what makes an unknown id unserializable. Keep it honest."""
    assert set(get_args(ChallengeId)) == set(get_catalog().challenge_ids)


def test_every_mapped_challenge_exists():
    cat = get_catalog()
    known = set(cat.challenge_ids)
    for skill, pair in cat.skill_to_challenge.items():
        assert pair.initial in known, f"{skill}.initial"
        assert pair.transfer in known, f"{skill}.transfer"
    for post_id, b in cat.post_bindings.items():
        assert b.initial in known, f"{post_id}.initial"
        if b.transfer is not None:
            assert b.transfer in known, f"{post_id}.transfer"


def test_actionable_skills_are_a_subset_of_declared_skills():
    cat = get_catalog()
    assert set(cat.actionable_skills) <= set(cat.skills)
    assert set(cat.skills) == set(get_args(SkillId))


def test_declared_but_unbuilt_skills_resolve_to_nothing():
    """`ai-content` and `sources` exist in the union but have no minigame."""
    cat = get_catalog()
    unbuilt = set(cat.skills) - set(cat.actionable_skills)
    assert unbuilt == {"ai-content", "sources"}
    for skill in unbuilt:
        assert cat.resolve("post-with-no-binding", skill) is None  # type: ignore[arg-type]


def test_post_bindings_are_not_derivable_from_skill_alone():
    """Regression guard for the bug a naive skill->challenge table would introduce."""
    cat = get_catalog()
    assert cat.post_bindings["p-inside"].skill == "emotional-pressure"
    assert cat.post_bindings["p-inside"].initial == "ep-transfer"
    assert cat.skill_to_challenge["emotional-pressure"].initial == "ep-spot"

    assert cat.post_bindings["p-flood-today"].skill == "image-context"
    assert cat.post_bindings["p-flood-today"].initial == "ic-transfer"
    assert cat.skill_to_challenge["image-context"].initial == "ic-match"


def _node_supports_register_hooks() -> bool:
    """module.registerHooks landed in Node 22.15+; skip live import on older runtimes."""
    probe = subprocess.run(
        [
            "node",
            "--input-type=module",
            "-e",
            "import { registerHooks } from 'node:module'; console.log(typeof registerHooks)",
        ],
        capture_output=True,
        text=True,
        timeout=30,
    )
    return probe.returncode == 0 and "function" in (probe.stdout or "")


@pytest.mark.skipif(
    not SRC_DATA.exists(), reason="frontend sources absent (Docker/backend-only CI)"
)
@pytest.mark.skipif(
    not _node_supports_register_hooks(),
    reason="Node registerHooks unavailable (need Node >= 22.15 for live TS import)",
)
def test_catalog_matches_live_frontend_modules():
    """Re-evaluate the real TS and diff — catches a rename the moment it lands."""
    script = """
    import { registerHooks } from "node:module";
    registerHooks({ resolve(s, c, n) {
      if (s.startsWith(".") && !/\\.[cm]?[jt]sx?$/.test(s)) {
        try { return n(s + ".ts", c); } catch {}
      }
      return n(s, c);
    }});
    const { experienceMinigames } = await import("./frontend/src/data/experienceMinigames.ts");
    const { openFeedPosts } = await import("./frontend/src/data/openFeedPosts.ts");
    console.log(JSON.stringify({
      challengeIds: Object.keys(experienceMinigames).sort(),
      bindings: Object.fromEntries(openFeedPosts
        .filter(p => p.triggerSkill && p.minigameId)
        .map(p => [p.id, [p.triggerSkill, p.minigameId, p.transferMinigameId ?? null]])),
    }));
    """
    proc = subprocess.run(
        ["node", "--input-type=module", "-e", script],
        cwd=REPO_ROOT,
        capture_output=True,
        text=True,
        timeout=60,
    )
    assert proc.returncode == 0, proc.stderr
    live = json.loads(proc.stdout)
    cat = get_catalog()

    assert live["challengeIds"] == sorted(cat.challenge_ids), (
        "challenge ids drifted — rerun `node backend/tools/export_catalog.mjs`"
    )
    for post_id, (skill, initial, transfer) in live["bindings"].items():
        b = cat.post_bindings.get(post_id)
        assert b is not None, f"{post_id} missing from catalog post_bindings"
        assert [b.skill, b.initial, b.transfer] == [skill, initial, transfer], post_id
