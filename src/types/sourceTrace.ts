import type { LocalizedText } from "./index";

export type SourceTraceStatus =
  | "verified"
  | "unknown"
  | "archived"
  | "missing"
  | "conflicting";

export type SourceTraceKind =
  | "claim"
  | "social"
  | "repost"
  | "publisher"
  | "original"
  | "archive";

export interface SourceTraceStep {
  id: string;
  kind: SourceTraceKind;
  label: LocalizedText;
  value: LocalizedText;
  status?: SourceTraceStatus;
  detail?: LocalizedText;
}

/**
 * Decision returned by the external risk-analysis service in `backend/`.
 *
 * Enabled by setting `VITE_RISK_API_URL`; unset, all decisions come from
 * `LearningTriggerEngine` and nothing here is used. The wire response nests
 * this under `decision` alongside a `diagnostics` block — see
 * `src/lib/risk/riskResponse.ts`, which validates it before the flow reducer
 * ever sees it.
 *
 * Note `reason` is `LocalizedText`, not `string`: every user-facing string in
 * this app is bilingual and the dialog renders `reason[language]`.
 * `transferChallengeId` / `transferPostId` are required for the skill-transfer
 * stage to fire at all.
 */
export type RiskDecision = {
  shouldIntervene: boolean;
  outcome?: "continue" | "intercept" | "verify-ack";
  skill?: string;
  challengeId?: string;
  transferChallengeId?: string;
  transferPostId?: string;
  reason?: LocalizedText;
  acknowledgement?: LocalizedText;
};
