import type { OpenFeedPost } from "../data/openFeedPosts";
import type { LocalizedText } from "../types";

export type TriggerAction =
  | "share"
  | "comment"
  | "repost-image"
  | "save"
  | "verify-link";

export type TriggerDecision = {
  shouldTrigger: boolean;
  reason: LocalizedText;
  post: OpenFeedPost;
  minigameId: string;
  transferMinigameId?: string;
  scenarioId?: string;
  skill?: string;
};

type EngineState = {
  actionsSinceLast: number;
  lastSkill: string | null;
  savesWithoutSource: number;
};

const UNSOURCED_PATTERNS = [
  /must be true/i,
  /debe ser verdad/i,
  /everyone says/i,
  /todo el mundo dice/i,
  /i saw this in several/i,
  /lo vi en varios/i,
  /share before/i,
  /comparte antes/i,
];

export function createTriggerEngine(initial?: Partial<EngineState>) {
  const state: EngineState = {
    actionsSinceLast: initial?.actionsSinceLast ?? 0,
    lastSkill: initial?.lastSkill ?? null,
    savesWithoutSource: initial?.savesWithoutSource ?? 0,
  };

  const cooldownOk = () => state.actionsSinceLast >= 2;

  const decide = (
    action: TriggerAction,
    post: OpenFeedPost,
    commentText?: string,
  ): TriggerDecision | null => {
    state.actionsSinceLast += 1;

    if (!post.minigameId || !post.triggerSkill) {
      return null;
    }

    if (!cooldownOk()) {
      return null;
    }

    if (state.lastSkill === post.triggerSkill) {
      return null;
    }

    let should = false;
    let reason: LocalizedText = {
      en: "This action is a good moment to practice verification.",
      es: "Esta acción es un buen momento para practicar la verificación.",
    };

    if (action === "share" && post.tone === "manipulative") {
      should = true;
      reason = {
        en: "This post shows manipulative signals. A short check can help before sharing.",
        es: "Esta publicación muestra señales manipuladoras. Una breve revisión puede ayudar antes de compartir.",
      };
    }

    if (action === "comment" && commentText) {
      const unsourced = UNSOURCED_PATTERNS.some((p) => p.test(commentText));
      if (unsourced || post.tone !== "neutral") {
        should = true;
        reason = {
          en: "This statement still needs a source.",
          es: "Esta afirmación todavía necesita una fuente.",
        };
      }
    }

    if (action === "repost-image" && (post.tone === "manipulative" || post.tone === "ambiguous")) {
      should = true;
      reason = {
        en: "This image may be missing confirmed context.",
        es: "A esta imagen puede faltarle un contexto confirmado.",
      };
    }

    if (action === "save") {
      state.savesWithoutSource += 1;
      if (state.savesWithoutSource >= 3 && post.tone !== "neutral") {
        should = true;
        reason = {
          en: "You saved several posts without opening their sources.",
          es: "Guardaste varias publicaciones sin abrir sus fuentes.",
        };
        state.savesWithoutSource = 0;
      }
    }

    if (action === "verify-link") {
      should = true;
      reason = {
        en: "Simulated verification links are a good moment for a short practice.",
        es: "Los enlaces de verificación simulados son un buen momento para una práctica breve.",
      };
    }

    if (!should) return null;

    state.actionsSinceLast = 0;
    state.lastSkill = post.triggerSkill ?? null;

    return {
      shouldTrigger: true,
      reason,
      post,
      minigameId: post.minigameId,
      transferMinigameId: post.transferMinigameId,
      scenarioId: post.scenarioId,
      skill: post.triggerSkill,
    };
  };

  const markSkippedOrDone = (skill: string | null) => {
    state.lastSkill = skill;
    state.actionsSinceLast = 0;
  };

  const snapshot = () => ({ ...state });

  return { decide, markSkippedOrDone, snapshot };
}

export type LearningTriggerEngine = ReturnType<typeof createTriggerEngine>;
