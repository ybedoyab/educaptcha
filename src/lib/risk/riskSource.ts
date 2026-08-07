/**
 * Chooses between the local engine and the external service.
 *
 * Two decisions worth knowing about:
 *
 * 1. **Local-first, not remote-with-fallback.** The local decision is computed
 *    unconditionally, even when the service is configured. `decideFreeBrowse`
 *    owns the cooldown mutation (`actionsSinceLast`, `lastSkill`), so calling it
 *    only on failure would freeze the counter and make every eventual fallback
 *    return "continue". This way engine state is identical in both
 *    configurations and `LearningTriggerEngine` needs no changes at all.
 *
 * 2. **A union return, not `async`.** An `async` function always resolves on a
 *    microtask even when its body is synchronous. With the service unconfigured
 *    the app must behave exactly as it does today, so the local path stays
 *    genuinely synchronous.
 */
import type { ActionDecision } from "../LearningTriggerEngine";
import type { PendingIntent } from "../demoFlow";
import type { RemoteDecision } from "./riskResponse";

export type MaybeAsync<T> = T | Promise<T>;

export const isPromise = <T,>(v: MaybeAsync<T>): v is Promise<T> =>
  typeof (v as Promise<T> | undefined)?.then === "function";

const FALLBACK_REASON = {
  en: "A short verification check can help before you continue.",
  es: "Una breve revisión de verificación puede ayudar antes de continuar.",
};

/**
 * Fold a validated remote decision into the shape the flow reducer consumes,
 * using the local decision to fill anything the service left out.
 */
export function mergeRemoteDecision(
  remote: RemoteDecision | null,
  local: ActionDecision,
  intent: PendingIntent,
): ActionDecision {
  if (remote === null) return local;

  if (remote.type === "continue") return { type: "continue" };

  if (remote.type === "verify-ack") {
    return { type: "verify-ack", message: remote.message };
  }

  return {
    type: "intercept",
    challengeId: remote.challengeId,
    transferChallengeId: remote.transferChallengeId,
    transferPostId: remote.transferPostId,
    skill: remote.skill,
    // Prefer the service's bilingual copy; fall back to whatever the local
    // engine would have said, and only then to generic copy.
    reason:
      remote.reason ??
      (local.type === "intercept" ? local.reason : undefined) ??
      FALLBACK_REASON,
    intent,
  };
}
