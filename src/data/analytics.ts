import type { AnalyticsPeriod } from "../types";

export interface AnalyticsSnapshot {
  totalInteractions: number;
  completionRate: number;
  averageScore: number;
  mostDifficultCategory: string;
  skipRate: number;
  languageDistribution: { language: string; percent: number }[];
  categoryBars: { category: string; value: number }[];
  weeklyProgress: { label: string; value: number }[];
  correctDistribution: { label: string; value: number }[];
  difficultyBars: { category: string; value: number }[];
}

const snapshots: Record<AnalyticsPeriod, AnalyticsSnapshot> = {
  "7d": {
    totalInteractions: 1284,
    completionRate: 78,
    averageScore: 71,
    mostDifficultCategory: "misleading-stats",
    skipRate: 12,
    languageDistribution: [
      { language: "English", percent: 58 },
      { language: "Español", percent: 42 },
    ],
    categoryBars: [
      { category: "clickbait", value: 92 },
      { category: "sources", value: 81 },
      { category: "visual-context", value: 74 },
      { category: "ai-content", value: 68 },
      { category: "emotional-manipulation", value: 77 },
      { category: "misleading-stats", value: 61 },
    ],
    weeklyProgress: [
      { label: "Mon", value: 140 },
      { label: "Tue", value: 168 },
      { label: "Wed", value: 152 },
      { label: "Thu", value: 190 },
      { label: "Fri", value: 210 },
      { label: "Sat", value: 175 },
      { label: "Sun", value: 249 },
    ],
    correctDistribution: [
      { label: "correct", value: 71 },
      { label: "incorrect", value: 17 },
      { label: "skipped", value: 12 },
    ],
    difficultyBars: [
      { category: "misleading-stats", value: 39 },
      { category: "ai-content", value: 32 },
      { category: "visual-context", value: 26 },
      { category: "emotional-manipulation", value: 23 },
      { category: "sources", value: 19 },
      { category: "clickbait", value: 8 },
    ],
  },
  "30d": {
    totalInteractions: 5420,
    completionRate: 81,
    averageScore: 74,
    mostDifficultCategory: "ai-content",
    skipRate: 10,
    languageDistribution: [
      { language: "English", percent: 55 },
      { language: "Español", percent: 45 },
    ],
    categoryBars: [
      { category: "clickbait", value: 94 },
      { category: "sources", value: 84 },
      { category: "visual-context", value: 76 },
      { category: "ai-content", value: 65 },
      { category: "emotional-manipulation", value: 79 },
      { category: "misleading-stats", value: 67 },
    ],
    weeklyProgress: [
      { label: "W1", value: 980 },
      { label: "W2", value: 1120 },
      { label: "W3", value: 1340 },
      { label: "W4", value: 1980 },
    ],
    correctDistribution: [
      { label: "correct", value: 74 },
      { label: "incorrect", value: 16 },
      { label: "skipped", value: 10 },
    ],
    difficultyBars: [
      { category: "ai-content", value: 35 },
      { category: "misleading-stats", value: 33 },
      { category: "visual-context", value: 24 },
      { category: "emotional-manipulation", value: 21 },
      { category: "sources", value: 16 },
      { category: "clickbait", value: 6 },
    ],
  },
  all: {
    totalInteractions: 18450,
    completionRate: 83,
    averageScore: 76,
    mostDifficultCategory: "misleading-stats",
    skipRate: 9,
    languageDistribution: [
      { language: "English", percent: 52 },
      { language: "Español", percent: 48 },
    ],
    categoryBars: [
      { category: "clickbait", value: 95 },
      { category: "sources", value: 86 },
      { category: "visual-context", value: 78 },
      { category: "ai-content", value: 70 },
      { category: "emotional-manipulation", value: 82 },
      { category: "misleading-stats", value: 64 },
    ],
    weeklyProgress: [
      { label: "Jan", value: 2200 },
      { label: "Feb", value: 2600 },
      { label: "Mar", value: 3100 },
      { label: "Apr", value: 3550 },
      { label: "May", value: 4000 },
      { label: "Jun", value: 3000 },
    ],
    correctDistribution: [
      { label: "correct", value: 76 },
      { label: "incorrect", value: 15 },
      { label: "skipped", value: 9 },
    ],
    difficultyBars: [
      { category: "misleading-stats", value: 36 },
      { category: "ai-content", value: 30 },
      { category: "visual-context", value: 22 },
      { category: "emotional-manipulation", value: 18 },
      { category: "sources", value: 14 },
      { category: "clickbait", value: 5 },
    ],
  },
};

export function getAnalytics(period: AnalyticsPeriod): AnalyticsSnapshot {
  return snapshots[period];
}
