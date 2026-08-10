/**
 * Catalog parity, frontend side.
 *
 * This is the guard that matters most, because it runs inside the `npm run test`
 * that CI already executes — so renaming a minigame breaks the build on push
 * rather than at runtime, where an unknown id silently wedges the dialog.
 *
 * Backend counterpart: `backend/tests/test_catalog_parity.py`.
 * Regenerate the catalog with `node backend/tools/export_catalog.mjs`.
 */
import { describe, expect, it } from "vitest";
import catalog from "../../../backend/app/catalog/catalog.json";
import { experienceMinigames } from "../data/experienceMinigames";
import { openFeedPosts } from "../data/openFeedPosts";

describe("backend catalog parity", () => {
  it("every challenge the backend can return exists in the frontend", () => {
    const frontend = new Set(Object.keys(experienceMinigames));
    const missing = catalog.challengeIds.filter((id) => !frontend.has(id));
    expect(missing, "rerun `node backend/tools/export_catalog.mjs`").toEqual([]);
  });

  it("the id sets match exactly in both directions", () => {
    expect([...catalog.challengeIds].sort()).toEqual(
      Object.keys(experienceMinigames).sort(),
    );
  });

  it("every post binding points at a real post and a real challenge", () => {
    const postIds = new Set(openFeedPosts.map((p) => p.id));
    for (const [postId, binding] of Object.entries(catalog.postBindings)) {
      expect(postIds.has(postId), `${postId} is not a real post`).toBe(true);
      expect(experienceMinigames[binding.initial], `${postId}.initial`).toBeDefined();
      if (binding.transfer) {
        expect(experienceMinigames[binding.transfer], `${postId}.transfer`).toBeDefined();
      }
      if (binding.transferPost) {
        expect(postIds.has(binding.transferPost), `${postId}.transferPost`).toBe(true);
      }
    }
  });

  it("bindings mirror what the posts actually declare", () => {
    for (const post of openFeedPosts) {
      if (!post.triggerSkill || !post.minigameId) continue;
      const binding = catalog.postBindings[post.id as keyof typeof catalog.postBindings];
      expect(binding, `${post.id} missing from catalog`).toBeDefined();
      expect(binding.skill).toBe(post.triggerSkill);
      expect(binding.initial).toBe(post.minigameId);
      expect(binding.transfer ?? undefined).toBe(post.transferMinigameId);
    }
  });

  it("records that two posts bind to a challenge their skill would not pick", () => {
    // Regression guard: a skill->challenge table alone sends ep-spot/ic-match
    // for these, which is the wrong minigame.
    expect(catalog.postBindings["p-inside"].initial).toBe("ep-transfer");
    expect(catalog.skillToChallenge["emotional-pressure"].initial).toBe("ep-spot");
    expect(catalog.postBindings["p-flood-today"].initial).toBe("ic-transfer");
    expect(catalog.skillToChallenge["image-context"].initial).toBe("ic-match");
  });
});
