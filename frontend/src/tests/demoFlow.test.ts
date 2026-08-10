import { describe, expect, it } from "vitest";
import {
  demoFlowReducer,
  initialDemoFlowState,
  type PendingIntent,
} from "../lib/demoFlow";
import type { ChallengeResult } from "../types/minigame";

const intent: PendingIntent = {
  type: "share",
  postId: "p-flood-live",
  returnElementId: "share-p-flood-live",
};

const result: ChallengeResult = {
  completed: true,
  correct: true,
  score: 1,
  attempts: 1,
  selectedIds: ["2019", "wrong-context"],
  durationMs: 1200,
  hintsUsed: 0,
};

describe("demoFlowReducer", () => {
  it("does not execute intent before challenge completes", () => {
    const started = demoFlowReducer(initialDemoFlowState, {
      type: "START_CHALLENGE",
      intent,
      challengeId: "ic-match",
      transferChallengeId: "ic-transfer",
      skill: "image-context",
      reason: {
        en: "Before sharing this image, check when and where it was taken.",
        es: "Antes de compartir esta imagen, comprueba cuándo y dónde fue tomada.",
      },
    });
    expect(started.status).toBe("challenge-intro");
    if (started.status !== "challenge-intro") return;
    expect(started.intent).toEqual(intent);
  });

  it("completing initial challenge returns to context without opening transfer", () => {
    let state = demoFlowReducer(initialDemoFlowState, {
      type: "START_CHALLENGE",
      intent,
      challengeId: "ic-match",
      transferChallengeId: "ic-transfer",
      skill: "image-context",
      reason: { en: "r", es: "r" },
    });
    state = demoFlowReducer(state, { type: "BEGIN_ACTIVE" });
    state = demoFlowReducer(state, {
      type: "COMPLETE_INITIAL",
      result,
      transferPostId: "p-flood-today",
    });
    expect(state.status).toBe("return-to-context");
    if (state.status !== "return-to-context") return;
    expect(state.intent.type).toBe("share");
    expect(state.transferChallengeId).toBe("ic-transfer");
  });

  it("resolving intent can move to transfer-pending only after confirm path", () => {
    let state = demoFlowReducer(initialDemoFlowState, {
      type: "START_CHALLENGE",
      intent,
      challengeId: "ic-match",
      transferChallengeId: "ic-transfer",
      skill: "image-context",
      reason: { en: "r", es: "r" },
    });
    state = demoFlowReducer(state, { type: "BEGIN_ACTIVE" });
    state = demoFlowReducer(state, {
      type: "COMPLETE_INITIAL",
      result,
      transferPostId: "p-flood-today",
    });
    state = demoFlowReducer(state, {
      type: "RESOLVE_INTENT",
      transferPostId: "p-flood-today",
    });
    expect(state.status).toBe("transfer-pending");
    if (state.status !== "transfer-pending") return;
    expect(state.targetPostId).toBe("p-flood-today");
  });

  it("transfer starts only after START_TRANSFER", () => {
    let state = demoFlowReducer(initialDemoFlowState, {
      type: "START_CHALLENGE",
      intent,
      challengeId: "ic-match",
      transferChallengeId: "ic-transfer",
      skill: "image-context",
      reason: { en: "r", es: "r" },
    });
    state = demoFlowReducer(state, { type: "BEGIN_ACTIVE" });
    state = demoFlowReducer(state, {
      type: "COMPLETE_INITIAL",
      result,
      transferPostId: "p-flood-today",
    });
    state = demoFlowReducer(state, {
      type: "RESOLVE_INTENT",
      transferPostId: "p-flood-today",
    });
    expect(state.status).toBe("transfer-pending");
    state = demoFlowReducer(state, {
      type: "START_TRANSFER",
      intent: {
        type: "share",
        postId: "p-flood-today",
        returnElementId: "share-p-flood-today",
      },
      reason: { en: "Apply skill", es: "Aplica habilidad" },
    });
    expect(state.status).toBe("transfer-active");
  });

  it("preserves remote transferPostId through challenge phases", () => {
    let state = demoFlowReducer(initialDemoFlowState, {
      type: "START_CHALLENGE",
      intent,
      challengeId: "ic-match",
      transferChallengeId: "ic-transfer",
      transferPostId: "p-flood-today",
      skill: "image-context",
      reason: { en: "r", es: "r" },
    });
    expect(state.status).toBe("challenge-intro");
    if (state.status !== "challenge-intro") return;
    expect(state.transferPostId).toBe("p-flood-today");

    state = demoFlowReducer(state, { type: "BEGIN_ACTIVE" });
    expect(state.status).toBe("challenge-active");
    if (state.status !== "challenge-active") return;
    expect(state.transferPostId).toBe("p-flood-today");

    state = demoFlowReducer(state, { type: "COMPLETE_INITIAL", result });
    expect(state.status).toBe("return-to-context");
    if (state.status !== "return-to-context") return;
    expect(state.transferPostId).toBe("p-flood-today");

    state = demoFlowReducer(state, { type: "RESOLVE_INTENT" });
    expect(state.status).toBe("transfer-pending");
    if (state.status !== "transfer-pending") return;
    expect(state.targetPostId).toBe("p-flood-today");
  });

  it("prefers remote transferPostId over a different COMPLETE_INITIAL argument", () => {
    let state = demoFlowReducer(initialDemoFlowState, {
      type: "START_CHALLENGE",
      intent,
      challengeId: "ic-match",
      transferChallengeId: "ic-transfer",
      transferPostId: "p-wildfire",
      skill: "image-context",
      reason: { en: "r", es: "r" },
    });
    state = demoFlowReducer(state, { type: "BEGIN_ACTIVE" });
    state = demoFlowReducer(state, {
      type: "COMPLETE_INITIAL",
      result,
      transferPostId: "p-flood-today",
    });
    expect(state.status).toBe("return-to-context");
    if (state.status !== "return-to-context") return;
    expect(state.transferPostId).toBe("p-wildfire");
    state = demoFlowReducer(state, { type: "CANCEL_INTENT" });
    expect(state.status).toBe("transfer-pending");
    if (state.status !== "transfer-pending") return;
    expect(state.targetPostId).toBe("p-wildfire");
  });
});
