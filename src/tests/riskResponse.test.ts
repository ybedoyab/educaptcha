import { describe, expect, it } from "vitest";
import { parseRiskResponse } from "../lib/risk/riskResponse";

const intercept = (overrides: Record<string, unknown> = {}) => ({
  decision: {
    outcome: "intercept",
    shouldIntervene: true,
    skill: "image-context",
    challengeId: "ic-match",
    transferChallengeId: "ic-transfer",
    transferPostId: "p-flood-today",
    reason: { en: "Check when and where.", es: "Comprueba cuándo y dónde." },
    ...overrides,
  },
  diagnostics: { riskScore: 0.82 },
});

describe("parseRiskResponse", () => {
  it("accepts a well-formed intercept", () => {
    const d = parseRiskResponse(intercept());
    expect(d).toMatchObject({
      type: "intercept",
      challengeId: "ic-match",
      transferChallengeId: "ic-transfer",
      transferPostId: "p-flood-today",
      skill: "image-context",
      riskScore: 0.82,
    });
  });

  it("accepts continue", () => {
    expect(
      parseRiskResponse({ decision: { outcome: "continue", shouldIntervene: false } }),
    ).toEqual({ type: "continue" });
  });

  it("accepts verify-ack with its bilingual message", () => {
    const d = parseRiskResponse({
      decision: {
        outcome: "verify-ack",
        shouldIntervene: false,
        acknowledgement: { en: "Good instinct", es: "Buen instinto" },
      },
    });
    expect(d).toEqual({
      type: "verify-ack",
      message: { en: "Good instinct", es: "Buen instinto" },
    });
  });

  describe("the anti-wedge rules", () => {
    it("rejects the whole response when challengeId is unknown", () => {
      // An unknown id makes OpenFeedChallengeDialog silently never open, which
      // parks the flow in challenge-active with no way out. Falling back to the
      // local decision is always better.
      expect(parseRiskResponse(intercept({ challengeId: "nope" }))).toBeNull();
    });

    it("rejects when challengeId is missing entirely", () => {
      expect(parseRiskResponse(intercept({ challengeId: undefined }))).toBeNull();
    });

    it("drops an unknown transferPostId but keeps the intercept", () => {
      // A bad transfer target parks transfer-pending forever, because
      // maybeStartTransfer can never match an empty targetPostId.
      const d = parseRiskResponse(intercept({ transferPostId: "p-does-not-exist" }));
      expect(d).toMatchObject({ type: "intercept", challengeId: "ic-match" });
      expect((d as Record<string, unknown>).transferPostId).toBeUndefined();
    });

    it("drops an unknown transferChallengeId but keeps the intercept", () => {
      const d = parseRiskResponse(intercept({ transferChallengeId: "bogus" }));
      expect(d).toMatchObject({ type: "intercept" });
      expect((d as Record<string, unknown>).transferChallengeId).toBeUndefined();
    });
  });

  describe("reason handling", () => {
    it("backfills a missing locale rather than rendering blank", () => {
      const d = parseRiskResponse(intercept({ reason: { en: "Only English" } }));
      expect((d as { reason: { en: string; es: string } }).reason).toEqual({
        en: "Only English",
        es: "Only English",
      });
    });

    it("omits the reason entirely when neither locale is usable", () => {
      const d = parseRiskResponse(intercept({ reason: { en: "  ", es: "" } }));
      expect((d as Record<string, unknown>).reason).toBeUndefined();
    });

    it("omits the reason when it is a bare string", () => {
      // The stale documented contract had `riskReason?: string`; the dialog
      // renders reason[language], so a string would blank the header.
      const d = parseRiskResponse(intercept({ reason: "just a string" }));
      expect((d as Record<string, unknown>).reason).toBeUndefined();
    });
  });

  describe("hostile and malformed input", () => {
    it.each([null, undefined, 42, "text", [], true])("rejects %s", (raw) => {
      expect(parseRiskResponse(raw)).toBeNull();
    });

    it("rejects when neither outcome nor shouldIntervene is usable", () => {
      expect(parseRiskResponse({ decision: { skill: "image-context" } })).toBeNull();
    });

    it("drops a non-string skill", () => {
      const d = parseRiskResponse(intercept({ skill: { evil: true } }));
      expect((d as Record<string, unknown>).skill).toBeUndefined();
    });

    it("drops an absurdly long skill that would wreck the dialog header", () => {
      const d = parseRiskResponse(intercept({ skill: "x".repeat(5000) }));
      expect((d as Record<string, unknown>).skill).toBeUndefined();
    });

    it("clamps an out-of-range riskScore", () => {
      const d = parseRiskResponse({ ...intercept(), diagnostics: { riskScore: 42 } });
      expect((d as { riskScore: number }).riskScore).toBe(1);
    });

    it("drops a non-finite riskScore", () => {
      const d = parseRiskResponse({ ...intercept(), diagnostics: { riskScore: NaN } });
      expect((d as Record<string, unknown>).riskScore).toBeUndefined();
    });
  });

  it("accepts a flat body matching the documented RiskDecision shape", () => {
    expect(
      parseRiskResponse({ shouldIntervene: true, challengeId: "ep-spot" }),
    ).toMatchObject({ type: "intercept", challengeId: "ep-spot" });
  });
});
