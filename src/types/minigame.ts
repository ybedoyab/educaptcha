import type { LocalizedText } from "./index";

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
  imageSrc: string;
  reactions: number;
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
  /** Optional archive result fields for investigation UI */
  thumbSrc?: string;
  date?: LocalizedText;
  location?: LocalizedText;
  medium?: LocalizedText;
  matchLevel?: LocalizedText;
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

export interface ContextMatchInteraction extends BaseInteraction {
  type: "context-match";
  claim: LocalizedText;
  imageSrc: string;
  imageAlt: LocalizedText;
  cards: ContextMatchCard[];
  revealClaimed: LocalizedText;
  revealOriginal: LocalizedText;
  conclusion?: LocalizedText;
  tools?: ContextMatchTool[];
  zoomTargets?: ContextMatchZoomTarget[];
  postBody?: LocalizedText;
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
  imageSrc: string;
  imageAlt: LocalizedText;
  hotspots: InspectionHotspot[];
  maxMarks: number;
  conclusions: {
    id: string;
    label: LocalizedText;
    correct: boolean;
  }[];
}

export interface ChartRepairInteraction extends BaseInteraction {
  type: "chart-repair";
  series: { id: string; label: LocalizedText; value: number }[];
  axisStart: number;
  axisEnd: number;
  targetStart: number;
  tolerance: number;
  successMessage: LocalizedText;
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
