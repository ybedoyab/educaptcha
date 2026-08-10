/**
 * Validates a `/risk/analyze` response before it is allowed anywhere near the
 * flow reducer.
 *
 * This is the anti-wedge layer, and it is not defensive programming for its own
 * sake. `experienceMinigames` is typed `Record<string, Challenge>` and
 * `noUncheckedIndexedAccess` is off, so `experienceMinigames["nope"]`
 * type-checks as non-nullable while being `undefined` at runtime.
 * `OpenFeedChallengeDialog` then never calls `showModal()`, and the flow parks
 * in `challenge-active` with no escape — skip lives *inside* the dialog that
 * never opened.
 *
 * Severity is asymmetric on purpose:
 *   - bad `challengeId`         -> reject the whole response (would wedge)
 *   - bad `transferPostId`      -> drop the field (would park `transfer-pending`)
 *   - bad `transferChallengeId` -> drop the field (merely ends the flow early)
 */
import { experienceMinigames } from "../../data/experienceMinigames";
import { openFeedPosts } from "../../data/openFeedPosts";
import type { LocalizedText } from "../../types";

export type RemoteDecision =
  | { type: "continue" }
  | { type: "verify-ack"; message: LocalizedText }
  | {
      type: "intercept";
      challengeId: string;
      transferChallengeId?: string;
      transferPostId?: string;
      skill?: string;
      reason?: LocalizedText;
      riskScore?: number;
    };

const MAX_SKILL_LEN = 64;

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

/** Derived from the real record — a second hardcoded list would drift. */
const isKnownChallenge = (id: unknown): id is string =>
  typeof id === "string" && Object.hasOwn(experienceMinigames, id);

const isKnownPost = (id: unknown): id is string =>
  typeof id === "string" && openFeedPosts.some((p) => p.id === id);

/** Both locales required; one present is backfilled, neither is dropped. */
function readLocalized(value: unknown): LocalizedText | undefined {
  if (!isRecord(value)) return undefined;
  const en = typeof value.en === "string" ? value.en.trim() : "";
  const es = typeof value.es === "string" ? value.es.trim() : "";
  if (!en && !es) return undefined;
  return { en: en || es, es: es || en };
}

function readSkill(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  // Not allowlisted: `skill` is only interpolated into copy and recorded in the
  // outcome, so pinning it to a closed set would make the backend's taxonomy a
  // breaking coupling. Length is capped because it renders in a dialog header.
  if (!trimmed || trimmed.length > MAX_SKILL_LEN) return undefined;
  return trimmed;
}

function readScore(value: unknown): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value)) return undefined;
  return Math.min(Math.max(value, 0), 1);
}

/**
 * @returns a decision, or `null` meaning "no usable remote opinion" — the
 * caller then falls back to the local engine.
 */
export function parseRiskResponse(raw: unknown): RemoteDecision | null {
  if (!isRecord(raw)) return null;

  const decision = isRecord(raw.decision) ? raw.decision : raw;
  const outcome = decision.outcome;
  const shouldIntervene = decision.shouldIntervene;

  if (outcome === "verify-ack") {
    const message = readLocalized(decision.acknowledgement);
    return message ? { type: "verify-ack", message } : { type: "continue" };
  }

  // Accept either the explicit `outcome` or the documented `shouldIntervene`.
  const intercepting =
    outcome === "intercept" || (outcome === undefined && shouldIntervene === true);

  if (!intercepting) {
    if (outcome === "continue" || shouldIntervene === false) return { type: "continue" };
    return null; // neither field usable — treat as no opinion
  }

  if (!isKnownChallenge(decision.challengeId)) return null;

  const diagnostics = isRecord(raw.diagnostics) ? raw.diagnostics : {};

  return {
    type: "intercept",
    challengeId: decision.challengeId,
    transferChallengeId: isKnownChallenge(decision.transferChallengeId)
      ? decision.transferChallengeId
      : undefined,
    transferPostId: isKnownPost(decision.transferPostId)
      ? decision.transferPostId
      : undefined,
    skill: readSkill(decision.skill),
    reason: readLocalized(decision.reason),
    riskScore: readScore(diagnostics.riskScore ?? decision.riskScore),
  };
}
