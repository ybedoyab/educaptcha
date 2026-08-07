/**
 * Demo/local risk engine.
 * Replaceable by an external risk-analysis service.
 *
 * External services can map onto RiskDecision from ../types/sourceTrace
 * without changing OpenFeed UI components.
 */
import type { OpenFeedPost } from "../data/openFeedPosts";
import type { LocalizedText } from "../types";
import type { RiskDecision } from "../types/sourceTrace";
import type { PendingIntent } from "./demoFlow";

export type { RiskDecision };

export type TriggerAction =
  | "share"
  | "comment"
  | "repost-image"
  | "save"
  | "verify-link";

export type ActionDecision =
  | { type: "continue" }
  | {
      type: "intercept";
      challengeId: string;
      transferChallengeId?: string;
      skill?: string;
      reason: LocalizedText;
      intent: PendingIntent;
      transferPostId?: string;
    }
  | {
      type: "verify-ack";
      message: LocalizedText;
    };

type EngineState = {
  actionsSinceLast: number;
  lastSkill: string | null;
};

const AFFIRMING_PATTERNS = [
  /must be true/i,
  /debe ser verdad/i,
  /everyone says/i,
  /todo el mundo dice/i,
  /i saw this in several/i,
  /lo vi en varios/i,
  /share before/i,
  /comparte antes/i,
  /officials are hiding/i,
  /las autoridades lo ocultan/i,
  /prove[sd]?\b/i,
  /prueba\b/i,
  /undeniable/i,
  /innegable/i,
];

const SOURCE_SEEKING_PATTERNS = [
  /source\??/i,
  /fuente\??/i,
  /needs? verification/i,
  /necesita verificaci[oó]n/i,
  /2019/,
  /archive/i,
  /archivo/i,
  /where (was|is) this/i,
  /cu[aá]ndo/,
  /d[oó]nde/,
];

export function isSourceSeekingComment(text: string): boolean {
  return SOURCE_SEEKING_PATTERNS.some((p) => p.test(text));
}

export function isAffirmingComment(text: string): boolean {
  if (isSourceSeekingComment(text)) return false;
  return AFFIRMING_PATTERNS.some((p) => p.test(text));
}

function reasonFor(
  action: TriggerAction,
  post: OpenFeedPost,
  commentText?: string,
): LocalizedText {
  if (action === "share") {
    if (
      post.triggerSkill === "image-context" ||
      post.triggerSkill === "wildfire-context" ||
      post.triggerSkill === "protest-context"
    ) {
      return {
        en: "Before sharing this image, check when and where it was taken.",
        es: "Antes de compartir esta imagen, comprueba cuándo y dónde fue tomada.",
      };
    }
    if (post.triggerSkill === "emotional-pressure") {
      return {
        en: "This post uses urgency before offering a verifiable source.",
        es: "Esta publicación usa urgencia antes de ofrecer una fuente verificable.",
      };
    }
    if (post.triggerSkill === "misleading-chart") {
      return {
        en: "Before sharing this chart, check where the vertical axis starts.",
        es: "Antes de compartir esta gráfica, revisa dónde empieza el eje vertical.",
      };
    }
    if (post.triggerSkill === "vaccine-claim") {
      return {
        en: "Before sharing, separate what the photo shows from what the caption claims.",
        es: "Antes de compartir, separa lo que muestra la foto de lo que afirma el pie.",
      };
    }
  }

  if (action === "comment" && commentText) {
    return {
      en: "Your draft repeats the claim without identifying its source.",
      es: "Tu borrador repite la afirmación sin identificar su fuente.",
    };
  }

  if (action === "repost-image") {
    return {
      en: "This image may be authentic but missing its original context.",
      es: "Esta imagen puede ser auténtica, pero carecer de su contexto original.",
    };
  }

  return {
    en: "A short verification check can help before you continue.",
    es: "Una breve revisión de verificación puede ayudar antes de continuar.",
  };
}

export function createTriggerEngine(initial?: Partial<EngineState>) {
  const state: EngineState = {
    actionsSinceLast: initial?.actionsSinceLast ?? 0,
    lastSkill: initial?.lastSkill ?? null,
  };

  const decideFreeBrowse = (
    action: TriggerAction,
    post: OpenFeedPost,
    intent: PendingIntent,
    commentText?: string,
  ): ActionDecision => {
    // Verify is the desired behavior — never intercept with a challenge
    if (action === "verify-link") {
      return {
        type: "verify-ack",
        message: {
          en: "Good instinct — open a source and compare details.",
          es: "Buen instinto — abre una fuente y compara los detalles.",
        },
      };
    }

    // Save is not a primary pitch trigger
    if (action === "save") {
      state.actionsSinceLast += 1;
      return { type: "continue" };
    }

    state.actionsSinceLast += 1;

    if (!post.minigameId || !post.triggerSkill) {
      return { type: "continue" };
    }

    // Cooldown: at most one intervention every 2–3 actions
    if (state.actionsSinceLast < 3) {
      return { type: "continue" };
    }

    if (state.lastSkill === post.triggerSkill) {
      return { type: "continue" };
    }

    let should = false;

    if (action === "share" && post.triggerSkill) {
      should =
        post.tone === "manipulative" ||
        post.tone === "ambiguous" ||
        Boolean(post.triggerSkill);
      // Only intercept manipulative/ambiguous with a defined skill
      should = post.tone === "manipulative" || post.tone === "ambiguous";
    }

    if (action === "comment" && commentText) {
      should = isAffirmingComment(commentText) && Boolean(post.triggerSkill);
    }

    if (action === "repost-image") {
      should =
        (post.tone === "manipulative" || post.tone === "ambiguous") &&
        Boolean(post.mediaAssetId || post.imageSrc);
    }

    if (!should) return { type: "continue" };

    state.actionsSinceLast = 0;
    state.lastSkill = post.triggerSkill ?? null;

    return {
      type: "intercept",
      challengeId: post.minigameId!,
      transferChallengeId: post.transferMinigameId,
      skill: post.triggerSkill,
      reason: reasonFor(action, post, commentText),
      intent,
      transferPostId: post.transferPostId,
    };
  };

  /** Guided scenario: first indicated action always activates, no cooldown. */
  const forceScenario = (
    post: OpenFeedPost,
    intent: PendingIntent,
  ): ActionDecision => {
    if (!post.minigameId) return { type: "continue" };
    state.actionsSinceLast = 0;
    state.lastSkill = post.triggerSkill ?? null;
    return {
      type: "intercept",
      challengeId: post.minigameId,
      transferChallengeId: post.transferMinigameId,
      skill: post.triggerSkill,
      reason: reasonFor(intent.type === "comment" ? "comment" : intent.type, post),
      intent,
      transferPostId: post.transferPostId,
    };
  };

  const markDone = (skill: string | null) => {
    state.lastSkill = skill;
    state.actionsSinceLast = 0;
  };

  const snapshot = () => ({ ...state });

  return { decideFreeBrowse, forceScenario, markDone, snapshot };
}

export type LearningTriggerEngine = ReturnType<typeof createTriggerEngine>;
