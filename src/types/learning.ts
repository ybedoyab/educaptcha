import type { LocalizedText } from "./index";

export type ExperienceSkill =
  | "emotional-pressure"
  | "image-context";

export type ExperiencePhase =
  | "intro"
  | "browsing"
  | "challenge"
  | "feedback"
  | "apply-hint"
  | "transfer"
  | "verify-panel"
  | "transfer-retry"
  | "result";

export type LearningSession = {
  skill: ExperienceSkill;
  initialCorrect: boolean;
  transferCorrect: boolean;
  skipped: boolean;
  completedAt: string;
};

export type ExperienceHistory = {
  sessions: LearningSession[];
  introSeen: boolean;
  lastScenarioId: string | null;
};

export interface ScenarioOption {
  id: string;
  label: LocalizedText;
}

export interface FeedPostData {
  id: string;
  author: LocalizedText;
  handle: string;
  time: LocalizedText;
  body: LocalizedText;
  reactions: number;
  comments: number;
  shares: number;
  visual: "urgent-alert" | "subtle-warn" | "old-photo" | "reused-photo" | "neutral";
  triggerAction: "share";
  isTarget: boolean;
  isTransferTarget: boolean;
}

export interface VerificationFact {
  label: LocalizedText;
  value: LocalizedText;
  status: "warning" | "ok";
}

export interface ExperienceScenario {
  id: string;
  skill: ExperienceSkill;
  skillLabel: LocalizedText;
  title: LocalizedText;
  posts: FeedPostData[];
  challenge: {
    question: LocalizedText;
    options: ScenarioOption[];
    correctOptionId: string;
    explanationShort: LocalizedText;
    explanationLong: LocalizedText;
    takeaway: LocalizedText;
  };
  transfer: {
    verifyLabel: LocalizedText;
    shareLabel: LocalizedText;
    verifyFacts: VerificationFact[];
    shareCorrection: LocalizedText;
  };
  trends: LocalizedText[];
}
