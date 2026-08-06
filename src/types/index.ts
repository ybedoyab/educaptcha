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

export interface ChallengeOption {
  id: string;
  label: LocalizedText;
}

export interface Challenge {
  id: string;
  category: ChallengeCategory;
  question: LocalizedText;
  options: ChallengeOption[];
  correctOptionId: string;
  explanation: LocalizedText;
  takeaway: LocalizedText;
  visual: ChallengeVisual;
}

export interface DemoProgress {
  completedIds: string[];
  correctIds: string[];
  skippedIds: string[];
  score: number;
  finished: boolean;
}

export type AnalyticsPeriod = "7d" | "30d" | "all";

export type SectionId =
  | "home"
  | "experience"
  | "demo"
  | "integration"
  | "impact"
  | "results";
