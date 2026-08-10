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
    if (post.triggerSkill === "wildfire-context") {
      return {
        en: "AI found a place mismatch risk: the caption says one city, but visual cues may point elsewhere. Complete this check before sharing.",
        es: "La IA encontró riesgo de lugar incorrecto: el texto nombra una ciudad, pero las señales visuales pueden apuntar a otra. Completa esta verificación antes de compartir.",
      };
    }
    if (
      post.triggerSkill === "image-context" ||
      post.triggerSkill === "protest-context"
    ) {
      return {
        en: "AI found this photo may be archived and reused — not a live image from today. Check the original date and place.",
        es: "La IA encontró que esta foto puede ser de archivo y reutilizada — no una imagen en vivo de hoy. Revisa la fecha y el lugar originales.",
      };
    }
    if (post.triggerSkill === "emotional-pressure") {
      return {
        en: "AI found urgency language before any verifiable source. Pause and check what is actually proven.",
        es: "La IA encontró lenguaje de urgencia antes de una fuente verificable. Pausa y revisa qué está realmente comprobado.",
      };
    }
    if (post.triggerSkill === "misleading-chart") {
      return {
        en: "AI found a chart scaling risk — the axis may exaggerate the change. Check where the vertical axis starts.",
        es: "La IA encontró riesgo en la escala de la gráfica — el eje puede exagerar el cambio. Revisa dónde empieza el eje vertical.",
      };
    }
    if (post.triggerSkill === "vaccine-claim") {
      return {
        en: "AI found that the photo may not prove the caption’s claim. Separate what the image shows from what the text asserts.",
        es: "La IA encontró que la foto puede no probar lo que afirma el pie. Separa lo que muestra la imagen de lo que dice el texto.",
      };
    }
  }

  if (action === "comment" && commentText) {
    return {
      en: "AI found your draft repeats the claim without a source. Edit or verify before posting.",
      es: "La IA encontró que tu borrador repite la afirmación sin fuente. Edita o verifica antes de publicar.",
    };
  }

  if (action === "repost-image") {
    return {
      en: "AI found this image may be authentic but missing its original context. Complete the check before resharing.",
      es: "La IA encontró que esta imagen puede ser auténtica, pero sin su contexto original. Completa la verificación antes de volver a compartir.",
    };
  }

  return {
    en: "AI flagged a verification risk on this post. Complete this short check before you continue.",
    es: "La IA marcó un riesgo de verificación en este post. Completa este chequeo breve antes de continuar.",
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
          en: "Good instinct — verify the original source before sharing.",
          es: "Buen instinto — verifica la fuente original antes de compartir.",
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

    // Cooldown only after an intervention already happened — the first risky
    // share/repost must open EduCAPTCHA so "Shared" never means "unchecked".
    if (state.lastSkill !== null && state.actionsSinceLast < 3) {
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
