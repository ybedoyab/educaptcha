import { useCallback, useMemo } from "react";
import { challenges, categorySkills } from "../data/challenges";
import type { DemoProgress, Language } from "../types";
import type { ChallengeResult, MinigameBadgeId } from "../types/minigame";
import { useLocalStorage } from "./useLocalStorage";

const initialProgress: DemoProgress = {
  completedIds: [],
  correctIds: [],
  skippedIds: [],
  score: 0,
  finished: false,
  results: {},
  badges: [],
};

function migrateProgress(raw: DemoProgress): DemoProgress {
  return {
    ...initialProgress,
    ...raw,
    results: raw.results ?? {},
    badges: raw.badges ?? [],
  };
}

export function useDemoProgress() {
  const [progress, setProgress] = useLocalStorage<DemoProgress>(
    "educaptcha-progress-v2",
    initialProgress,
  );
  const [currentIndex, setCurrentIndex] = useLocalStorage<number>(
    "educaptcha-index-v2",
    0,
  );

  const safeProgress = migrateProgress(progress);

  const reset = useCallback(() => {
    setProgress(initialProgress);
    setCurrentIndex(0);
  }, [setProgress, setCurrentIndex]);

  const markResult = useCallback(
    (challengeId: string, result: ChallengeResult, badge: MinigameBadgeId) => {
      setProgress((prev) => {
        const base = migrateProgress(prev);
        if (base.completedIds.includes(challengeId)) return base;
        return {
          ...base,
          completedIds: [...base.completedIds, challengeId],
          correctIds: result.correct
            ? [...base.correctIds, challengeId]
            : base.correctIds,
          skippedIds: result.skipped
            ? [...base.skippedIds, challengeId]
            : base.skippedIds,
          score: result.correct ? base.score + 1 : base.score,
          results: { ...base.results, [challengeId]: result },
          badges: base.badges.includes(badge)
            ? base.badges
            : [...base.badges, badge],
        };
      });
    },
    [setProgress],
  );

  const markSkip = useCallback(
    (challengeId: string) => {
      setProgress((prev) => {
        const base = migrateProgress(prev);
        if (base.completedIds.includes(challengeId)) return base;
        return {
          ...base,
          completedIds: [...base.completedIds, challengeId],
          skippedIds: [...base.skippedIds, challengeId],
          results: {
            ...base.results,
            [challengeId]: {
              completed: true,
              correct: false,
              score: 0,
              attempts: 0,
              selectedIds: [],
              durationMs: 0,
              hintsUsed: 0,
              skipped: true,
            },
          },
        };
      });
    },
    [setProgress],
  );

  const goNext = useCallback(() => {
    setCurrentIndex((i) => {
      const next = i + 1;
      if (next >= challenges.length) {
        setProgress((prev) => ({ ...migrateProgress(prev), finished: true }));
        return i;
      }
      return next;
    });
  }, [setCurrentIndex, setProgress]);

  const finish = useCallback(() => {
    setProgress((prev) => ({ ...migrateProgress(prev), finished: true }));
  }, [setProgress]);

  const skills = useMemo(() => {
    const cats = new Set(
      safeProgress.completedIds
        .map((id) => challenges.find((c) => c.id === id)?.category)
        .filter(Boolean),
    );
    return Array.from(cats);
  }, [safeProgress.completedIds]);

  const skillLabels = useCallback(
    (lang: Language) =>
      skills.map(
        (cat) => categorySkills[cat as keyof typeof categorySkills][lang],
      ),
    [skills],
  );

  return {
    progress: safeProgress,
    currentIndex,
    setCurrentIndex,
    reset,
    markResult,
    markSkip,
    goNext,
    finish,
    skills,
    skillLabels,
    total: challenges.length,
    current: challenges[Math.min(currentIndex, challenges.length - 1)],
  };
}
