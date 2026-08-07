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
}

export function MinigameRenderer({
  challenge,
  onComplete,
  onSkip,
  stepLabel,
  compact,
  wide,
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

  const game = (() => {
    switch (interaction.type) {
      case "spot-signals":
        return (
          <SpotSignalsGame
            interaction={interaction}
            language={language}
            onSolved={(r) => finish(r)}
            onHint={setHint}
          />
        );
      case "drag-classify":
        return (
          <DragClassifyGame
            interaction={interaction}
            language={language}
            onSolved={(r) => finish(r)}
            onHint={setHint}
          />
        );
      case "context-match":
        return (
          <ContextMatchGame
            interaction={interaction}
            language={language}
            onSolved={(r) => finish(r)}
            onHint={setHint}
          />
        );
      case "chart-repair":
        return (
          <ChartRepairGame
            interaction={interaction}
            language={language}
            onSolved={(r) => finish(r)}
          />
        );
      case "image-inspection":
        return (
          <ImageInspectionGame
            interaction={interaction}
            language={language}
            onSolved={(r) => finish(r)}
            onHint={setHint}
          />
        );
      case "single-choice":
        return (
          <SingleChoiceGame
            interaction={interaction}
            language={language}
            onSolved={(r) => finish(r)}
          />
        );
      default:
        return null;
    }
  })();

  return (
    <MinigameShell
      title={challenge.title[language]}
      instruction={interaction.instruction[language]}
      categoryLabel={categoryLabel}
      stepLabel={stepLabel}
      whyText={challenge.explanationWhy[language]}
      onSkip={onSkip}
      compact={compact}
      wide={wide}
      footer={
        done ? (
          <MinigameFeedback
            correct={done.correct}
            explanation={challenge.explanation[language]}
            takeaway={challenge.takeaway[language]}
            metricLabel={challenge.skillMetric[language]}
            metricValue={
              done.signalsTotal
                ? `${done.signalsFound ?? 0}/${done.signalsTotal}`
                : done.correct
                  ? copy.minigame.complete
                  : undefined
            }
            onContinue={() => onComplete(done)}
          />
        ) : hint ? (
          <p className="rounded-lg bg-amber/10 px-3 py-2 text-xs font-medium text-navy" role="status">
            {hint}
          </p>
        ) : null
      }
    >
      {!done && game}
      {done && interaction.type === "spot-signals" && (
        <SpotSignalsGame
          interaction={interaction}
          language={language}
          revealed
          onSolved={() => undefined}
          onHint={() => undefined}
        />
      )}
      {done && interaction.type === "chart-repair" && (
        <ChartRepairGame
          interaction={interaction}
          language={language}
          lockedAt={0}
          onSolved={() => undefined}
        />
      )}
    </MinigameShell>
  );
}
