import { describe, expect, it } from "vitest";
import { openFeedPosts } from "../data/openFeedPosts";
import { buildVerificationTrace } from "../lib/postVerificationTrace";

describe("buildVerificationTrace", () => {
  it("exposes Commons link + 2019 date for the flood out-of-context post", () => {
    const flood = openFeedPosts.find((p) => p.id === "p-flood-live")!;
    const steps = buildVerificationTrace(flood, "misleading");
    const hrefs = steps.map((s) => s.href).filter(Boolean);
    expect(hrefs.some((h) => h?.includes("wikimedia.org"))).toBe(true);
    const blob = JSON.stringify(steps);
    expect(blob).toMatch(/2019/);
    expect(blob).toMatch(/Lagos|tonight|EN VIVO/i);
  });

  it("builds a concrete trail for a cleared garden post", () => {
    const garden = openFeedPosts.find((p) => p.id === "p-garden")!;
    const steps = buildVerificationTrace(garden, "ai-cleared");
    expect(steps.length).toBeGreaterThanOrEqual(3);
    expect(steps.some((s) => s.kind === "claim")).toBe(true);
  });
});
