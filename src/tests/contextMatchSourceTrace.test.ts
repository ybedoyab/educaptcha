import { describe, expect, it } from "vitest";
import { challenges } from "../data/challenges";
import { experienceMinigames } from "../data/experienceMinigames";
import { mediaAssets } from "../data/mediaAssets";
import type { Challenge } from "../types";
import type { ContextMatchInteraction } from "../types/minigame";

function allChallenges(): Challenge[] {
  return [...Object.values(experienceMinigames), ...challenges];
}

function contextMatchChallenges(): {
  id: string;
  interaction: ContextMatchInteraction;
}[] {
  return allChallenges()
    .filter((c) => c.interaction.type === "context-match")
    .map((c) => ({
      id: c.id,
      interaction: c.interaction as ContextMatchInteraction,
    }));
}

function flattenTraceText(interaction: ContextMatchInteraction): string {
  const parts: string[] = [];
  for (const step of interaction.sourceTrace ?? []) {
    parts.push(step.label.en, step.label.es, step.value.en, step.value.es);
    if (step.detail) parts.push(step.detail.en, step.detail.es);
  }
  return parts.join(" ").toLowerCase();
}

describe("context-match sourceTrace integrity", () => {
  const list = contextMatchChallenges();

  it("finds every context-match challenge", () => {
    expect(list.map((c) => c.id).sort()).toEqual(
      ["ic-match", "ic-transfer", "pr-match", "visual-1", "wf-match"].sort(),
    );
  });

  it.each(list)(
    "$id has valid media, claim, alts, conclusions, and sourceTrace",
    ({ interaction }) => {
      expect(interaction.sourceTrace).toBeDefined();
      expect(interaction.sourceTrace!.length).toBeGreaterThan(0);
      expect(interaction.claim.en.length).toBeGreaterThan(0);
      expect(interaction.claim.es.length).toBeGreaterThan(0);
      expect(interaction.imageAlt.en.length).toBeGreaterThan(0);
      expect(interaction.imageAlt.es.length).toBeGreaterThan(0);
      expect(interaction.mediaAssetId).toBeTruthy();
      expect(mediaAssets[interaction.mediaAssetId!]).toBeTruthy();
      expect(mediaAssets[interaction.mediaAssetId!].publicPath).toMatch(
        /^\/demo-assets\//,
      );
      expect(interaction.conclusions?.some((c) => c.correct)).toBe(true);

      for (const step of interaction.sourceTrace!) {
        expect(step.label.en).toBeTruthy();
        expect(step.label.es).toBeTruthy();
        expect(step.value.en).toBeTruthy();
        expect(step.value.es).toBeTruthy();
      }
    },
  );

  it("ic-match / visual-1 show Lagos 2019", () => {
    for (const id of ["ic-match", "visual-1"]) {
      const item = list.find((c) => c.id === id)!;
      const text = flattenTraceText(item.interaction);
      expect(text).toMatch(/lagos/);
      expect(text).toMatch(/2019/);
    }
  });

  it("ic-transfer shows West Columbia 2015 and never Lagos", () => {
    const item = list.find((c) => c.id === "ic-transfer")!;
    const text = flattenTraceText(item.interaction);
    expect(text).toMatch(/west columbia/);
    expect(text).toMatch(/2015/);
    expect(text).not.toMatch(/lagos/);
    expect(text).not.toMatch(/nigeria/);
  });

  it("wf-match shows Washington D.C. metadata and never Lagos", () => {
    const item = list.find((c) => c.id === "wf-match")!;
    const text = flattenTraceText(item.interaction);
    expect(text).toMatch(/washington/);
    expect(text).toMatch(/2023|wikimedia/);
    expect(text).not.toMatch(/lagos/);
  });

  it("pr-match shows protest archive metadata and never Lagos", () => {
    const item = list.find((c) => c.id === "pr-match")!;
    const text = flattenTraceText(item.interaction);
    expect(text).toMatch(/protest|protesta/);
    expect(text).toMatch(/2024|wikimedia/);
    expect(text).not.toMatch(/lagos/);
  });
});
