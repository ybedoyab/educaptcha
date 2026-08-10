import { afterEach, describe, expect, it, vi } from "vitest";
import { openFeedPosts } from "../data/openFeedPosts";
import {
  prefetchRisk,
  resetPrefetchDedupe,
  resetRiskCircuit,
} from "../lib/risk/riskClient";

describe("prefetchRisk", () => {
  afterEach(() => {
    resetPrefetchDedupe();
    resetRiskCircuit();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("prefetches neutral + official + ambiguous + manipulative posts", () => {
    vi.stubEnv("VITE_RISK_API_URL", "http://127.0.0.1:4599");
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ decision: { outcome: "continue", shouldIntervene: false } }),
    });
    vi.stubGlobal("fetch", fetchMock);

    prefetchRisk(openFeedPosts, "en");

    const tones = new Set(openFeedPosts.map((p) => p.tone));
    expect(tones.has("neutral")).toBe(true);
    expect(tones.has("official")).toBe(true);
    expect(tones.has("ambiguous")).toBe(true);
    expect(tones.has("manipulative")).toBe(true);

    expect(fetchMock).toHaveBeenCalledTimes(openFeedPosts.length);
    const bodies = fetchMock.mock.calls.map((c) => JSON.parse(c[1].body as string));
    const ids = new Set(bodies.map((b) => b.post.id));
    expect(ids.size).toBe(openFeedPosts.length);
    for (const p of openFeedPosts) {
      expect(ids.has(p.id)).toBe(true);
    }
  });

  it("dedupes the same action+postId across remounts", () => {
    vi.stubEnv("VITE_RISK_API_URL", "http://127.0.0.1:4599");
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
    vi.stubGlobal("fetch", fetchMock);

    prefetchRisk(openFeedPosts, "en");
    prefetchRisk(openFeedPosts, "es");
    expect(fetchMock).toHaveBeenCalledTimes(openFeedPosts.length);
  });
});
