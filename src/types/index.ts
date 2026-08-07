export type Language = "en" | "es";

export type ChallengeCategory =
  | "clickbait"
  | "sources"
  | "visual-context"
  | "ai-content"
  | "emotional-manipulation"
  | "misleading-stats";

export type ChallengeVisual =
  | "none"
  | "social-posts"
  | "ai-grid"
  | "emotion-cards"
  | "truncated-chart";

export interface LocalizedText {
  en: string;
  es: string;
}

/** @deprecated Prefer interaction.options on single-choice */
export interface ChallengeOption {
  id: string;
  label: LocalizedText;
}

export type {
  ChallengeInteraction,
  ChallengeResult,
  MinigameBadgeId,
  InteractionType,
} from "./minigame";

import type {
  ChallengeInteraction,
  ChallengeResult,
  MinigameBadgeId,
} from "./minigame";

export interface Challenge {
  id: string;
  category: ChallengeCategory;
  title: LocalizedText;
  interaction: ChallengeInteraction;
  explanation: LocalizedText;
  explanationWhy: LocalizedText;
  takeaway: LocalizedText;
  badge: MinigameBadgeId;
  skillMetric: LocalizedText;
  question?: LocalizedText;
  options?: ChallengeOption[];
  correctOptionId?: string;
  visual?: ChallengeVisual;
}

export interface DemoProgress {
  completedIds: string[];
  correctIds: string[];
  skippedIds: string[];
  score: number;
  finished: boolean;
  results: Record<string, ChallengeResult>;
  badges: MinigameBadgeId[];
}

export type AnalyticsPeriod = "7d" | "30d" | "all";

export type SectionId =
  | "home"
  | "experience"
  | "demo"
  | "integration"
  | "impact"
  | "results";
