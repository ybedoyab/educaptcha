/**
 * HTTP client for the external risk service.
 *
 * Never throws and never rejects: every failure path resolves to `null`,
 * meaning "no remote opinion", and the caller uses its already-computed local
 * decision. A verification pause must never be the thing that breaks the app.
 */
import { parseRiskResponse, type RemoteDecision } from "./riskResponse";
import type { OpenFeedPost } from "../../data/openFeedPosts";
import type { Language } from "../../types";

/**
 * The service base *origin*, not the full endpoint. Read inside a function, not
 * as a module constant, so tests can `vi.stubEnv` it.
 *
 * Note this value is inlined into the public bundle at build time, so it can
 * never hold a secret — the endpoint is intentionally credential-free.
 */
export function riskApiBase(): string | null {
  const raw = import.meta.env.VITE_RISK_API_URL?.trim();
  return raw ? raw.replace(/\/+$/, "") : null;
}

/**
 * A real analysis costs ~5s (network-bound, not thinking-bound), which is why
 * the feed prefetches with `dryRun` on mount. A click that still misses the
 * cache must fall back to local immediately rather than stall.
 */
const CLICK_TIMEOUT_MS = 1500;
const PREFETCH_TIMEOUT_MS = 12000;
const CIRCUIT_TRIP_AFTER = 2;

let consecutiveFailures = 0;

/** Dedupes prefetch across remounts / language switches / skin navigations. */
const prefetchedKeys = new Set<string>();

/** A dead backend must not add dead air to every click for the rest of the session. */
function circuitOpen(): boolean {
  return consecutiveFailures >= CIRCUIT_TRIP_AFTER;
}

export function resetRiskCircuit(): void {
  consecutiveFailures = 0;
}

/** Test helper — clear prefetch dedupe between cases. */
export function resetPrefetchDedupe(): void {
  prefetchedKeys.clear();
}

export type RiskAction = "share" | "comment" | "repost-image" | "save" | "verify-link";

/** Opaque per-browser id. Never a user identity; only groups one session's actions. */
export function riskSessionId(): string {
  const KEY = "educaptcha-risk-session";
  try {
    const existing = localStorage.getItem(KEY);
    if (existing) return existing;
    const fresh = `anon-${crypto.randomUUID()}`;
    localStorage.setItem(KEY, fresh);
    return fresh;
  } catch {
    // Storage unavailable (private mode / quota). Prefer a random ephemeral
    // id so concurrent tabs are not glued together by a shared constant.
    if (
      typeof crypto !== "undefined" &&
      typeof crypto.randomUUID === "function"
    ) {
      return `anon-ephemeral-${crypto.randomUUID()}`;
    }
    return "anon-ephemeral-000001";
  }
}

/** "18m" -> 18, "3h" -> 180, "2d" -> 2880. Drives the share-velocity heuristic. */
function ageMinutes(relative: string): number | null {
  const m = /^\s*(\d+)\s*([mhd])/i.exec(relative);
  if (!m) return null;
  const n = Number(m[1]);
  const unit = m[2].toLowerCase();
  return n * (unit === "m" ? 1 : unit === "h" ? 60 : 1440);
}

function buildPayload(
  post: OpenFeedPost,
  action: RiskAction,
  language: Language,
  commentText: string | undefined,
  dryRun: boolean,
) {
  return {
    action,
    locale: language,
    mode: "free-browse" as const,
    dryRun,
    commentText: action === "comment" ? commentText : undefined,
    post: {
      id: post.id,
      body: post.body,
      category: post.category,
      tags: post.tags,
      author: { handle: post.handle },
      engagement: {
        reactions: post.reactions,
        comments: post.comments,
        shares: post.shares,
        ageMinutes: ageMinutes(post.time.en),
      },
      media: { kind: post.mediaKind, assetId: post.mediaAssetId },
      topComments: post.seedComments.slice(0, 5).map((c) => c.body.en),
      // `tone`, `triggerSkill` and `minigameId` are deliberately NOT sent: they
      // are the demo's curated answers, and the service rejects them (422).
    },
    session: { id: riskSessionId() },
  };
}

async function post(base: string, path: string, body: unknown, timeoutMs: number) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(`${base}${path}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

export async function analyzeRisk(
  post_: OpenFeedPost,
  action: RiskAction,
  language: Language,
  commentText?: string,
): Promise<RemoteDecision | null> {
  const base = riskApiBase();
  if (!base || circuitOpen()) return null;

  try {
    const res = await post(
      base,
      "/risk/analyze",
      buildPayload(post_, action, language, commentText, false),
      CLICK_TIMEOUT_MS,
    );
    if (!res.ok) {
      consecutiveFailures += 1;
      return null;
    }
    const decision = parseRiskResponse(await res.json());
    // A malformed body is a backend bug, not a transport failure — don't trip
    // the breaker on it, or one bad field disables the service for the session.
    if (decision !== null) consecutiveFailures = 0;
    return decision;
  } catch {
    consecutiveFailures += 1;
    return null;
  }
}

/**
 * Speculative, fire-and-forget. `dryRun` means the service analyses and caches
 * the content without advancing the session's cooldown counters, so the real
 * click reads a warm cache instead of paying the full model round trip.
 *
 * Prefetch every post — curated demo labels (tone, triggerSkill, minigameId)
 * must not decide what reaches the backend. Deduped by action+postId so
 * remounts and language switches do not re-warm identical content analyses
 * (responses already carry bilingual copy).
 */
export function prefetchRisk(
  posts: OpenFeedPost[],
  language: Language,
  action: RiskAction = "share",
): void {
  const base = riskApiBase();
  if (!base || circuitOpen()) return;

  for (const p of posts) {
    const key = `${action}:${p.id}`;
    if (prefetchedKeys.has(key)) continue;
    prefetchedKeys.add(key);
    void post(
      base,
      "/risk/analyze",
      buildPayload(p, action, language, undefined, true),
      PREFETCH_TIMEOUT_MS,
    )
      .then((res) => {
        // !ok must not trip the interactive circuit — prefetch is speculative.
        // Drop the dedupe key so a later remount can retry.
        if (!res.ok) prefetchedKeys.delete(key);
      })
      .catch(() => {
        /* prefetch is best-effort; allow a later remount to retry this key */
        prefetchedKeys.delete(key);
      });
  }
}

/** Anonymous outcome. Fire-and-forget; `keepalive` survives a tab close. */
export function postOutcome(event: Record<string, unknown>): void {
  const base = riskApiBase();
  if (!base) return;
  void fetch(`${base}/metrics/event`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(event),
    keepalive: true,
  }).catch(() => {
    /* metrics must never affect the user's flow */
  });
}
