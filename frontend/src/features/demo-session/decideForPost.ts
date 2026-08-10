import type { Dispatch, MutableRefObject, SetStateAction } from "react";
import type { OpenFeedPost } from "../../data/openFeedPosts";
import type { DemoFlowState, PendingIntent } from "../../lib/demoFlow";
import type {
  ActionDecision,
  createTriggerEngine,
} from "../../lib/LearningTriggerEngine";
import { analyzeRisk, riskApiBase } from "../../lib/risk/riskClient";
import {
  mergeRemoteDecision,
  type MaybeAsync,
} from "../../lib/risk/riskSource";
import type { Language } from "../../types";
import {
  OPEN_FEED_IDS,
  OPEN_FEED_TIMINGS,
} from "../../components/openfeed/openFeed.constants";

type TriggerEngine = ReturnType<typeof createTriggerEngine>;

export type DecideForPostDeps = {
  isGuidedAction: (post: OpenFeedPost) => boolean;
  language: Language;
  engineRef: MutableRefObject<TriggerEngine>;
  flowRef: MutableRefObject<DemoFlowState>;
  requestSeqRef: MutableRefObject<number>;
  inFlightPromisesRef: MutableRefObject<Map<string, Promise<ActionDecision>>>;
  mountedRef: MutableRefObject<boolean>;
  setLockedActionKey: Dispatch<SetStateAction<string | null>>;
  setPendingActionKey: Dispatch<SetStateAction<string | null>>;
  setRiskInteractionLocked: Dispatch<SetStateAction<boolean>>;
};

/**
 * True when a different action/post already has an interactive analyze in
 * flight. Same-key duplicates reuse the existing promise instead.
 */
export function isRiskInteractionBlocked(
  inFlight: Map<string, Promise<ActionDecision>>,
  flightKey: string,
): boolean {
  return inFlight.size > 0 && !inFlight.has(flightKey);
}

/**
 * The single point where a decision is made.
 *
 * Returns synchronously (exactly today's behaviour) unless the external
 * service is configured, in which case it returns a promise that resolves to
 * the remote decision — or to the local one if the service is slow, down, or
 * returns something that fails validation.
 *
 * While any interactive analyze is in flight, a different action/post is
 * blocked at the request* layer (no local continue). Same-key clicks reuse
 * the in-flight promise.
 */
export function createDecideForPost(deps: DecideForPostDeps) {
  const {
    isGuidedAction,
    language,
    engineRef,
    flowRef,
    requestSeqRef,
    inFlightPromisesRef,
    mountedRef,
    setLockedActionKey,
    setPendingActionKey,
    setRiskInteractionLocked,
  } = deps;

  return (
    action: "share" | "comment" | "repost-image",
    post: OpenFeedPost,
    intent: PendingIntent,
    commentText?: string,
  ): MaybeAsync<ActionDecision> => {
    // Guided scenarios stay local, always. They are the scripted pitch: they
    // must be deterministic, survive dead conference wifi, and they
    // deliberately bypass the cooldown, which a remote service has no basis
    // to reproduce.
    if (isGuidedAction(post)) {
      return engineRef.current.forceScenario(post, intent);
    }

    // Computed unconditionally — this call owns the cooldown mutation, so
    // skipping it on the remote path would freeze the counter.
    const local = engineRef.current.decideFreeBrowse(
      action,
      post,
      intent,
      commentText,
    );

    if (!riskApiBase()) return local;

    const flightKey = OPEN_FEED_IDS.pendingAction(action, post.id);
    const existing = inFlightPromisesRef.current.get(flightKey);
    if (existing) return existing;

    const seq = ++requestSeqRef.current;
    // Lock immediately — spinner waits for the grace period to avoid flicker.
    setRiskInteractionLocked(true);
    setLockedActionKey(flightKey);
    const graceTimer = setTimeout(() => {
      if (requestSeqRef.current === seq && mountedRef.current) {
        setPendingActionKey(flightKey);
      }
    }, OPEN_FEED_TIMINGS.pendingActionGraceMs);

    const promise = analyzeRisk(post, action, language, commentText)
      .then((remote) => {
        // Discard a late answer if the user has moved on, or if a challenge
        // is already open — otherwise a slow response stomps it.
        const status = flowRef.current.status;
        const stale =
          seq !== requestSeqRef.current ||
          status === "challenge-intro" ||
          status === "challenge-active" ||
          status === "challenge-feedback" ||
          status === "transfer-active";
        if (stale) return local;
        return mergeRemoteDecision(remote, local, intent);
      })
      .catch(() => local)
      .finally(() => {
        clearTimeout(graceTimer);
        inFlightPromisesRef.current.delete(flightKey);
        if (mountedRef.current) {
          setLockedActionKey((k) => (k === flightKey ? null : k));
          setPendingActionKey((k) => (k === flightKey ? null : k));
          if (inFlightPromisesRef.current.size === 0) {
            setRiskInteractionLocked(false);
          }
        }
      });

    inFlightPromisesRef.current.set(flightKey, promise);
    return promise;
  };
}
