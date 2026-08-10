import { useMemo, useState } from "react";
import type { Language } from "../../types";
import type { ChallengeResult, SpotSignalsInteraction } from "../../types/minigame";
import { useI18n } from "../../i18n/I18nContext";
import { MinigameProgress } from "./MinigameProgress";
import { DemoPhoto } from "./DemoPhoto";

interface Props {
  interaction: SpotSignalsInteraction;
  language: Language;
  onSolved: (result: Omit<ChallengeResult, "durationMs" | "completed">) => void;
  onHint: (hint: string | null) => void;
  revealed?: boolean;
}

export function SpotSignalsGame({
  interaction,
  language,
  onSolved,
  onHint,
  revealed,
}: Props) {
  const { copy } = useI18n();
  const [selected, setSelected] = useState<string[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [finished, setFinished] = useState(Boolean(revealed));
  const signalIds = useMemo(
    () => interaction.signals.map((s) => s.id),
    [interaction.signals],
  );

  const evaluate = (next: string[], nextAttempts: number) => {
    const correct = signalIds.every((s) => next.includes(s));
    if (correct || nextAttempts >= interaction.maxAttempts) {
      setFinished(true);
      onHint(null);
      onSolved({
        correct,
        score: correct ? 1 : 0,
        attempts: nextAttempts,
        selectedIds: correct ? next : signalIds,
        hintsUsed: nextAttempts > 1 ? 1 : 0,
        signalsFound: correct
          ? interaction.targetCount
          : next.filter((id) => signalIds.includes(id)).length,
        signalsTotal: interaction.targetCount,
      });
      if (!correct) setSelected(signalIds);
      return;
    }
    onHint(copy.minigame.hintSpot);
    setSelected([]);
  };

  const toggle = (id: string, isSignal: boolean) => {
    if (revealed || finished || !isSignal) return;
    setSelected((prev) => {
      let next: string[];
      if (prev.includes(id)) next = prev.filter((x) => x !== id);
      else if (prev.length >= interaction.targetCount) next = prev;
      else next = [...prev, id];

      if (next.length === interaction.targetCount) {
        const nextAttempts = attempts + 1;
        setAttempts(nextAttempts);
        queueMicrotask(() => evaluate(next, nextAttempts));
      }
      return next;
    });
  };

  const showLabels = revealed || finished;

  return (
    <div className="space-y-3">
      <MinigameProgress
        current={Math.min(selected.length, interaction.targetCount)}
        total={interaction.targetCount}
        label={copy.minigame.signalsProgress}
      />
      <article className="overflow-hidden rounded-xl border border-navy/10 bg-off-white">
        <DemoPhoto
          assetId={interaction.mediaAssetId}
          src={interaction.imageSrc}
          alt={interaction.mediaTitle[language]}
          eager
        />
        <div className="space-y-2 p-3 sm:p-4">
          <p className="text-xs font-semibold text-teal">
            {interaction.mediaTitle[language]}
          </p>
          <p className="text-[0.7rem] text-navy/50">
            {interaction.mediaMeta[language]}
          </p>
          <p className="text-base font-bold leading-snug text-navy sm:text-lg">
            {interaction.headlineParts.map((part) => {
              const active = selected.includes(part.id) || showLabels;
              return (
                <button
                  key={part.id}
                  type="button"
                  disabled={!part.isSignal || finished || Boolean(revealed)}
                  onClick={() => toggle(part.id, part.isSignal)}
                  className={`mx-0.5 inline rounded px-1 py-0.5 transition ${
                    part.isSignal
                      ? active
                        ? "bg-amber/30 text-navy ring-2 ring-amber"
                        : "bg-sky/15 text-navy hover:bg-teal/20"
                      : "cursor-default"
                  }`}
                  aria-pressed={
                    part.isSignal ? selected.includes(part.id) : undefined
                  }
                >
                  {part.text[language]}
                </button>
              );
            })}
          </p>
          {showLabels && (
            <ul className="flex flex-wrap gap-2 pt-1">
              {interaction.signals.map((s) => (
                <li
                  key={s.id}
                  className="rounded-full bg-amber/15 px-2.5 py-1 text-xs font-semibold text-navy"
                >
                  {s.label[language]}
                </li>
              ))}
            </ul>
          )}
        </div>
      </article>
    </div>
  );
}
