import { useCallback, useMemo } from "react";
import { challenges, categorySkills } from "../data/challenges";
import type { DemoProgress, Language } from "../types";
import { useLocalStorage } from "./useLocalStorage";

const initialProgress: DemoProgress = {
  completedIds: [],
  correctIds: [],
  skippedIds: [],
  score: 0,
  finished: false,
};

export function useDemoProgress() {
  const [progress, setProgress] = useLocalStorage<DemoProgress>(
    "educaptcha-progress",
    initialProgress,
  );
  const [currentIndex, setCurrentIndex] = useLocalStorage<number>(
    "educaptcha-index",
    0,
  );

  const reset = useCallback(() => {
    setProgress(initialProgress);
    setCurrentIndex(0);
  }, [setProgress, setCurrentIndex]);

  const markAnswer = useCallback(
    (challengeId: string, correct: boolean) => {
      setProgress((prev) => {
        if (prev.completedIds.includes(challengeId)) return prev;
        return {
          ...prev,
          completedIds: [...prev.completedIds, challengeId],
          correctIds: correct
            ? [...prev.correctIds, challengeId]
            : prev.correctIds,
          score: correct ? prev.score + 1 : prev.score,
        };
      });
    },
    [setProgress],
  );

  const markSkip = useCallback(
    (challengeId: string) => {
      setProgress((prev) => {
        if (
          prev.completedIds.includes(challengeId) ||
          prev.skippedIds.includes(challengeId)
        ) {
          return prev;
        }
        return {
          ...prev,
          completedIds: [...prev.completedIds, challengeId],
          skippedIds: [...prev.skippedIds, challengeId],
        };
      });
    },
    [setProgress],
  );

  const goNext = useCallback(() => {
    setCurrentIndex((i) => {
      const next = i + 1;
      if (next >= challenges.length) {
        setProgress((prev) => ({ ...prev, finished: true }));
        return i;
      }
      return next;
    });
  }, [setCurrentIndex, setProgress]);

  const finish = useCallback(() => {
    setProgress((prev) => ({ ...prev, finished: true }));
  }, [setProgress]);

  const skills = useMemo(() => {
    const cats = new Set(
      progress.completedIds
        .map((id) => challenges.find((c) => c.id === id)?.category)
        .filter(Boolean),
    );
    return Array.from(cats);
  }, [progress.completedIds]);

  const skillLabels = useCallback(
    (lang: Language) =>
      skills.map((cat) => categorySkills[cat as keyof typeof categorySkills][lang]),
    [skills],
  );

  return {
    progress,
    currentIndex,
    setCurrentIndex,
    reset,
    markAnswer,
    markSkip,
    goNext,
    finish,
    skills,
    skillLabels,
    total: challenges.length,
    current: challenges[Math.min(currentIndex, challenges.length - 1)],
  };
}
