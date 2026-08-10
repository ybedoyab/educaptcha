import type { LocalizedText } from "./index";
import type { SourceTraceStep } from "./sourceTrace";

export type InteractionType =
  | "single-choice"
  | "spot-signals"
  | "drag-classify"
  | "sort-sequence"
  | "context-match"
  | "chart-repair"
  | "image-inspection";

export interface ChallengeResult {
  completed: boolean;
  correct: boolean;
  score: number;
  attempts: number;
  selectedIds: string[];
  durationMs: number;
  hintsUsed: number;
  signalsFound?: number;
  signalsTotal?: number;
  skipped?: boolean;
}

export interface BaseInteraction {
  type: InteractionType;
  instruction: LocalizedText;
  maxAttempts: number;
}

export interface SingleChoiceInteraction extends BaseInteraction {
  type: "single-choice";
  options: { id: string; label: LocalizedText }[];
  correctOptionId: string;
  /** Optional post claim / snippet shown above the question */
  claim?: LocalizedText;
  /** Clear question; falls back to instruction */
  prompt?: LocalizedText;
}

export interface SpotSignal {
  id: string;
  text: LocalizedText;
  label: LocalizedText;
}

export interface SpotSignalsInteraction extends BaseInteraction {
  type: "spot-signals";
  mediaTitle: LocalizedText;
  mediaOutlet: LocalizedText;
  mediaMeta: LocalizedText;
  headlineParts: {
    id: string;
    text: LocalizedText;
    isSignal: boolean;
  }[];
  signals: SpotSignal[];
  targetCount: number;
  /** @deprecated Prefer mediaAssetId */
  imageSrc?: string;
  mediaAssetId?: string;
  reactions: number;
  /** Caption / claim framing the pause */
  claim?: LocalizedText;
  conclusions?: {
    id: string;
    label: LocalizedText;
    correct: boolean;
  }[];
  conclusion?: LocalizedText;
}

export interface DragItem {
  id: string;
  label: LocalizedText;
  correctZoneId: string | null;
}

export interface DragZone {
  id: string;
  label: LocalizedText;
}

export interface DragClassifyInteraction extends BaseInteraction {
  type: "drag-classify";
  prompt: LocalizedText;
  items: DragItem[];
  zones: DragZone[];
  wrongHint: LocalizedText;
  rebuild?: {
    infoIds: string[];
    pressureIds: string[];
  };
}

export interface SortSequenceInteraction extends BaseInteraction {
  type: "sort-sequence";
  items: { id: string; label: LocalizedText }[];
  correctOrder: string[];
}

export interface ContextMatchCard {
  id: string;
  label: LocalizedText;
  detail: LocalizedText;
  correct: boolean;
  /** @deprecated Prefer mediaAssetId */
  thumbSrc?: string;
  mediaAssetId?: string;
  date?: LocalizedText;
  location?: LocalizedText;
  medium?: LocalizedText;
  /** Visual findings shown after selection — not a correctness hint */
  findings?: LocalizedText;
  /** Intentionally no image — show NoSourceMediaCard */
  noImage?: boolean;
}

export interface ContextMatchTool {
  id: "source" | "date-location" | "archive";
  label: LocalizedText;
  summary: LocalizedText;
}

export interface ContextMatchZoomTarget {
  id: string;
  label: LocalizedText;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface ContextMatchConclusion {
  id: string;
  label: LocalizedText;
  correct: boolean;
}

export interface ContextMatchInteraction extends BaseInteraction {
  type: "context-match";
  claim: LocalizedText;
  /** @deprecated Prefer mediaAssetId */
  imageSrc?: string;
  mediaAssetId?: string;
  imageAlt: LocalizedText;
  cards: ContextMatchCard[];
  revealClaimed: LocalizedText;
  revealOriginal: LocalizedText;
  conclusion?: LocalizedText;
  conclusions?: ContextMatchConclusion[];
  tools?: ContextMatchTool[];
  zoomTargets?: ContextMatchZoomTarget[];
  postBody?: LocalizedText;
  claimQuestion?: LocalizedText;
  /** Required for production/demo context-match challenges */
  sourceTrace?: SourceTraceStep[];
}

export interface InspectionHotspot {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  isWarning: boolean;
  label: LocalizedText;
}

export interface ImageInspectionInteraction extends BaseInteraction {
  type: "image-inspection";
  /** @deprecated Prefer mediaAssetId */
  imageSrc?: string;
  mediaAssetId?: string;
  imageAlt: LocalizedText;
  /** Caption / post claim shown on the pause step */
  claim?: LocalizedText;
  hotspots: InspectionHotspot[];
  maxMarks: number;
  conclusions: {
    id: string;
    label: LocalizedText;
    correct: boolean;
  }[];
  /** Short result line after a correct answer */
  conclusion?: LocalizedText;
}

export interface ChartRepairInteraction extends BaseInteraction {
  type: "chart-repair";
  series: { id: string; label: LocalizedText; value: number }[];
  axisStart: number;
  axisEnd: number;
  targetStart: number;
  tolerance: number;
  successMessage: LocalizedText;
  claim?: LocalizedText;
  conclusions?: {
    id: string;
    label: LocalizedText;
    correct: boolean;
  }[];
  conclusion?: LocalizedText;
}

export type ChallengeInteraction =
  | SingleChoiceInteraction
  | SpotSignalsInteraction
  | DragClassifyInteraction
  | SortSequenceInteraction
  | ContextMatchInteraction
  | ChartRepairInteraction
  | ImageInspectionInteraction;

export type MinigameBadgeId =
  | "source-checker"
  | "context-investigator"
  | "chart-reader"
  | "pressure-detector"
  | "ai-skeptic"
  | "signal-spotter";
