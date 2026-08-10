import { afterEach, describe, expect, it, vi } from "vitest";
import { openFeedPosts } from "../data/openFeedPosts";
import {
  prefetchRisk,
  resetPrefetchDedupe,
  resetRiskCircuit,
  riskSessionId,
} from "../lib/risk/riskClient";

describe("prefetchRisk", () => {
  afterEach(() => {
    resetPrefetchDedupe();
    resetRiskCircuit();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  async function flushPrefetch(fetchMock: ReturnType<typeof vi.fn>, expectedCalls: number) {
    await vi.waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(expectedCalls);
    });
    await Promise.all(fetchMock.mock.results.map((r) => r.value));
    // Drain queue finally handlers that may re-open concurrency slots.
    await Promise.resolve();
    await Promise.resolve();
  }

  it("prefetches neutral + official + ambiguous + manipulative posts", async () => {
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

    await flushPrefetch(fetchMock, openFeedPosts.length);
    const bodies = fetchMock.mock.calls.map((c) => JSON.parse(c[1].body as string));
    const ids = new Set(bodies.map((b) => b.post.id));
    expect(ids.size).toBe(openFeedPosts.length);
    for (const p of openFeedPosts) {
      expect(ids.has(p.id)).toBe(true);
    }
  });

  it("dedupes the same action+postId across remounts", async () => {
    vi.stubEnv("VITE_RISK_API_URL", "http://127.0.0.1:4599");
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
    vi.stubGlobal("fetch", fetchMock);

    prefetchRisk(openFeedPosts, "en");
    prefetchRisk(openFeedPosts, "es");
    await flushPrefetch(fetchMock, openFeedPosts.length);
  });

  it("retries after a !ok prefetch and does not trip the interactive circuit", async () => {
    vi.stubEnv("VITE_RISK_API_URL", "http://127.0.0.1:4599");
    const sample = openFeedPosts.slice(0, 1);
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 500, json: async () => ({}) })
      .mockResolvedValue({ ok: true, json: async () => ({}) });
    vi.stubGlobal("fetch", fetchMock);

    prefetchRisk(sample, "en");
    await flushPrefetch(fetchMock, 1);

    prefetchRisk(sample, "en");
    await flushPrefetch(fetchMock, 2);

    // Interactive analyze must still be allowed (circuit not bumped by prefetch).
    const { analyzeRisk } = await import("../lib/risk/riskClient");
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        decision: { outcome: "continue", shouldIntervene: false },
      }),
    });
    const decision = await analyzeRisk(sample[0]!, "share", "en");
    expect(decision).toEqual({ type: "continue" });
  });

  it("retries after a 200 with agent_errors (cache was not warmed)", async () => {
    vi.stubEnv("VITE_RISK_API_URL", "http://127.0.0.1:4599");
    const sample = openFeedPosts.slice(0, 1);
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          diagnostics: { agentErrors: ["graph:deadline"] },
        }),
      })
      .mockResolvedValue({ ok: true, json: async () => ({}) });
    vi.stubGlobal("fetch", fetchMock);

    prefetchRisk(sample, "en");
    await flushPrefetch(fetchMock, 1);

    prefetchRisk(sample, "en");
    await flushPrefetch(fetchMock, 2);
  });

  it("keeps the dedupe key after a successful 200 prefetch", async () => {
    vi.stubEnv("VITE_RISK_API_URL", "http://127.0.0.1:4599");
    const sample = openFeedPosts.slice(0, 2);
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
    vi.stubGlobal("fetch", fetchMock);

    prefetchRisk(sample, "en");
    await flushPrefetch(fetchMock, 2);

    prefetchRisk(sample, "en");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("starts at most two prefetches concurrently", async () => {
    vi.stubEnv("VITE_RISK_API_URL", "http://127.0.0.1:4599");
    let inFlight = 0;
    let maxInFlight = 0;
    const fetchMock = vi.fn().mockImplementation(() => {
      inFlight += 1;
      maxInFlight = Math.max(maxInFlight, inFlight);
      return new Promise((resolve) => {
        setTimeout(() => {
          inFlight -= 1;
          resolve({ ok: true, json: async () => ({}) });
        }, 20);
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    prefetchRisk(openFeedPosts.slice(0, 5), "en");
    await flushPrefetch(fetchMock, 5);
    expect(maxInFlight).toBeLessThanOrEqual(2);
  });
});

describe("riskSessionId", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    try {
      localStorage.removeItem("educaptcha-risk-session");
    } catch {
      /* ignore */
    }
  });

  it("falls back to anon-ephemeral-${uuid} when localStorage throws", () => {
    const uuid = "11111111-2222-4333-8444-555555555555";
    vi.stubGlobal("crypto", { randomUUID: () => uuid });
    vi.stubGlobal("localStorage", {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
    });

    expect(riskSessionId()).toBe(`anon-ephemeral-${uuid}`);
  });

  it("uses the deterministic extreme fallback only when crypto is unavailable", () => {
    vi.stubGlobal("crypto", undefined);
    vi.stubGlobal("localStorage", {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
    });

    expect(riskSessionId()).toBe("anon-ephemeral-000001");
  });
});
