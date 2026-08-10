import { useCallback, useMemo } from "react";
import { useLocalStorage } from "./useLocalStorage";
import type {
  ExperienceHistory,
  ExperienceSkill,
  LearningSession,
} from "../types/learning";

const initialHistory: ExperienceHistory = {
  sessions: [],
  introSeen: false,
  lastScenarioId: null,
};

export function useLearningSession() {
  const [history, setHistory] = useLocalStorage<ExperienceHistory>(
    "educaptcha-learning",
    initialHistory,
  );

  const markIntroSeen = useCallback(() => {
    setHistory((prev) => ({ ...prev, introSeen: true }));
  }, [setHistory]);

  const recordSession = useCallback(
    (session: LearningSession) => {
      setHistory((prev) => ({
        ...prev,
        lastScenarioId: session.skill,
        sessions: [...prev.sessions.filter((s) => s.skill !== session.skill), session],
      }));
    },
    [setHistory],
  );

  const resetLearning = useCallback(() => {
    setHistory(initialHistory);
  }, [setHistory]);

  const latestSession = useMemo(
    () => history.sessions[history.sessions.length - 1] ?? null,
    [history.sessions],
  );

  const sessionFor = useCallback(
    (skill: ExperienceSkill) =>
      history.sessions.find((s) => s.skill === skill) ?? null,
    [history.sessions],
  );

  const skillsImproved = useMemo(
    () =>
      history.sessions.filter(
        (s) => s.transferCorrect && (!s.initialCorrect || s.transferCorrect),
      ).length,
    [history.sessions],
  );

  return {
    history,
    latestSession,
    sessionFor,
    markIntroSeen,
    recordSession,
    resetLearning,
    skillsImproved,
  };
}
