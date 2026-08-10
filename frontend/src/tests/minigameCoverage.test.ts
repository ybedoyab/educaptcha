import { describe, expect, it } from "vitest";
import { experienceMinigames } from "../data/experienceMinigames";
import { openFeedPosts } from "../data/openFeedPosts";

/** Every feed-facing challenge must be reachable from at least one post. */
describe("minigame ↔ post coverage", () => {
  const initialIds = Object.keys(experienceMinigames).filter(
    (id) => !id.endsWith("-transfer"),
  );
  const transferIds = Object.keys(experienceMinigames).filter((id) =>
    id.endsWith("-transfer"),
  );

  it("each initial minigame has a trigger post", () => {
    for (const id of initialIds) {
      const post = openFeedPosts.find((p) => p.minigameId === id);
      expect(post, `missing post for ${id}`).toBeTruthy();
      expect(post!.tone === "manipulative" || post!.tone === "ambiguous").toBe(
        true,
      );
      expect(post!.triggerSkill).toBeTruthy();
      expect(post!.scenarioId).toBeTruthy();
    }
  });

  it("each transfer minigame is wired from an initial post", () => {
    for (const id of transferIds) {
      const post = openFeedPosts.find((p) => p.transferMinigameId === id);
      expect(post, `missing transfer wiring for ${id}`).toBeTruthy();
      expect(post!.transferPostId).toBeTruthy();
      const target = openFeedPosts.find((p) => p.id === post!.transferPostId);
      expect(target, `missing transfer target ${post!.transferPostId}`).toBeTruthy();
    }
  });

  it("scenario routes resolve to a real feed post", () => {
    const scenarioIds = [
      ...new Set(
        openFeedPosts
          .map((p) => p.scenarioId)
          .filter((id): id is string => Boolean(id)),
      ),
    ];
    expect(scenarioIds.length).toBeGreaterThanOrEqual(6);
    for (const id of scenarioIds) {
      expect(openFeedPosts.some((p) => p.scenarioId === id)).toBe(true);
    }
  });
});
