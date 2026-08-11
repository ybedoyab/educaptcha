import { useEffect, useRef, useState } from "react";
import type { Challenge } from "../../types";
import type { ChallengeResult } from "../../types/minigame";
import { useI18n } from "../../i18n/I18nContext";
import { MinigameFeedback } from "./MinigameFeedback";
import { MinigameShell } from "./MinigameShell";
import { SpotSignalsGame } from "./SpotSignalsGame";
import { DragClassifyGame } from "./DragClassifyGame";
import { ContextMatchGame } from "./ContextMatchGame";
import { ChartRepairGame } from "./ChartRepairGame";
import { ImageInspectionGame } from "./ImageInspectionGame";
import { SingleChoiceGame } from "./SingleChoiceGame";

export interface MinigameRendererProps {
  challenge: Challenge;
  onComplete: (result: ChallengeResult) => void;
  onSkip: () => void;
  stepLabel?: string;
  compact?: boolean;
  wide?: boolean;
  embedded?: boolean;
  onClose?: () => void;
  compactFeedback?: boolean;
  /** Why EduCAPTCHA opened — shown on the first pause step. */
  interceptReason?: string | null;
}

export function MinigameRenderer({
  challenge,
  onComplete,
  onSkip,
  stepLabel,
  compact,
  wide,
  embedded,
  onClose,
  compactFeedback,
  interceptReason,
}: MinigameRendererProps) {
  const { language, copy } = useI18n();
  const startedAt = useRef(Date.now());
  const [done, setDone] = useState<ChallengeResult | null>(null);
  const [hint, setHint] = useState<string | null>(null);

  useEffect(() => {
    startedAt.current = Date.now();
    setDone(null);
    setHint(null);
  }, [challenge.id]);

  const finish = (partial: Omit<ChallengeResult, "durationMs" | "completed">) => {
    const result: ChallengeResult = {
      ...partial,
      completed: true,
      durationMs: Date.now() - startedAt.current,
    };
    setDone(result);
  };

  const interaction = challenge.interaction;
  const categoryLabel =
    copy.categories[challenge.category as keyof typeof copy.categories];

  // These games surface `instruction` themselves (as the "why we paused"
  // callout, or as the question for single-choice), so the shell must not print
  // it a second time — embedded or not. `drag-classify` shows the post text
  // instead, so there the shell is the only place the instruction appears.
  const hideChromeInstruction =
    interaction.type === "context-match" ||
    interaction.type === "image-inspection" ||
    interaction.type === "spot-signals" ||
    interaction.type === "chart-repair" ||
    interaction.type === "single-choice";

  const mode = done ? "review" : "play";

  const game = (() => {
    switch (interaction.type) {
      case "spot-signals":
        return (
          <SpotSignalsGame
            interaction={interaction}
            language={language}
            revealed={Boolean(done)}
            onSolved={(r) => finish(r)}
            onHint={setHint}
            onSkip={onSkip}
            mode={mode}
            reviewResult={done}
            interceptReason={interceptReason}
          />
        );
      case "drag-classify":
        return (
          <DragClassifyGame
            interaction={interaction}
            language={language}
            onSolved={(r) => finish(r)}
            onHint={setHint}
            mode={mode}
          />
        );
      case "context-match":
        return (
          <ContextMatchGame
            interaction={interaction}
            language={language}
            onSolved={(r) => finish(r)}
            onHint={setHint}
            onSkip={onSkip}
            mode={mode}
            reviewResult={done}
            interceptReason={interceptReason}
          />
        );
      case "chart-repair":
        return (
          <ChartRepairGame
            interaction={interaction}
            language={language}
            lockedAt={done ? interaction.targetStart : undefined}
            onSolved={(r) => finish(r)}
            onHint={setHint}
            onSkip={onSkip}
            mode={mode}
            interceptReason={interceptReason}
          />
        );
      case "image-inspection":
        return (
          <ImageInspectionGame
            interaction={interaction}
            language={language}
            onSolved={(r) => finish(r)}
            onHint={setHint}
            onSkip={onSkip}
            mode={mode}
            reviewResult={done}
            interceptReason={interceptReason}
          />
        );
      case "single-choice":
        return (
          <SingleChoiceGame
            interaction={interaction}
            language={language}
            onSolved={(r) => finish(r)}
            onSkip={onSkip}
            mode={mode}
            reviewResult={done}
            interceptReason={interceptReason}
          />
        );
      default:
        return null;
    }
  })();

  return (
    <MinigameShell
      title={challenge.title[language]}
      instruction={
        hideChromeInstruction ? "" : interaction.instruction[language]
      }
      categoryLabel={categoryLabel}
      stepLabel={stepLabel}
      whyText={challenge.explanationWhy[language]}
      onSkip={onSkip}
      onClose={onClose}
      compact={compact}
      wide={wide}
      embedded={embedded}
      showWhy={Boolean(done) && !compactFeedback}
      layout="single"
      footer={
        done ? (
          <MinigameFeedback
            correct={done.correct}
            explanation={challenge.explanation[language]}
            takeaway={challenge.takeaway[language]}
            metricLabel={
              compactFeedback ? undefined : challenge.skillMetric[language]
            }
            metricValue={
              compactFeedback
                ? undefined
                : done.signalsTotal
                  ? `${done.signalsFound ?? 0}/${done.signalsTotal}`
                  : done.correct
                    ? copy.minigame.complete
                    : undefined
            }
            compact={compactFeedback}
            onContinue={() => onComplete(done)}
          />
        ) : hint ? (
          <p
            className="rounded-lg bg-amber/10 px-3 py-2 text-xs font-medium text-navy"
            role="status"
          >
            {hint}
          </p>
        ) : null
      }
    >
      {game}
    </MinigameShell>
  );
}
