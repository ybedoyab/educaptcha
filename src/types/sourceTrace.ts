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

/** Optional shape for an external risk-analysis service (not implemented in this frontend). */
export type RiskDecision = {
  shouldIntervene: boolean;
  skill?: string;
  riskReason?: string;
  challengeId?: string;
};
