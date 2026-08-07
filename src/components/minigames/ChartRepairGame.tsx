import { useMemo, useState } from "react";
import type { Language } from "../../types";
import type {
  ChallengeResult,
  ChartRepairInteraction,
} from "../../types/minigame";
import { useI18n } from "../../i18n/I18nContext";

interface Props {
  interaction: ChartRepairInteraction;
  language: Language;
  onSolved: (result: Omit<ChallengeResult, "durationMs" | "completed">) => void;
  lockedAt?: number;
}

export function ChartRepairGame({
  interaction,
  language,
  onSolved,
  lockedAt,
}: Props) {
  const { copy } = useI18n();
  const [axisStart, setAxisStart] = useState(interaction.axisStart);
  const [solved, setSolved] = useState(lockedAt !== undefined);
  const currentStart = lockedAt !== undefined ? lockedAt : axisStart;

  const maxVal = interaction.axisEnd;
  const bars = useMemo(() => {
    return interaction.series.map((s) => {
      const span = Math.max(maxVal - currentStart, 1);
      const height = ((s.value - currentStart) / span) * 100;
      return { ...s, height: Math.max(4, Math.min(100, height)) };
    });
  }, [interaction.series, currentStart, maxVal]);

  const ticks = [currentStart, Math.round((currentStart + maxVal) / 2), maxVal];

  const tryComplete = (value: number) => {
    if (solved) return;
    if (Math.abs(value - interaction.targetStart) <= interaction.tolerance) {
      setAxisStart(interaction.targetStart);
      setSolved(true);
      onSolved({
        correct: true,
        score: 1,
        attempts: 1,
        selectedIds: ["axis-0"],
        hintsUsed: 0,
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-navy/10 bg-off-white p-4">
        <div className="mb-2 flex justify-between text-xs text-navy/50">
          <span>{copy.minigame.before}</span>
          <span>{copy.minigame.after}</span>
        </div>
        <div className="relative flex h-48 items-end gap-6 border-b border-l border-navy/20 pl-8">
          <div className="absolute left-0 top-0 flex h-full flex-col justify-between py-1 text-[0.65rem] text-navy/45">
            {ticks
              .slice()
              .reverse()
              .map((t) => (
                <span key={t}>{t}</span>
              ))}
          </div>
          {bars.map((bar) => (
            <div key={bar.id} className="flex flex-1 flex-col items-center gap-1">
              <div
                className="w-full max-w-16 rounded-t-md bg-gradient-to-t from-teal to-sky transition-all duration-150"
                style={{ height: `${bar.height}%` }}
              />
              <span className="text-xs text-navy/60">{bar.label[language]}</span>
              <span className="text-[0.65rem] font-semibold text-navy">
                {bar.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {lockedAt === undefined && (
        <label className="block">
          <span className="text-xs font-semibold text-navy/60">
            {copy.minigame.axisStart}: {Math.round(axisStart)}
          </span>
          <input
            type="range"
            min={0}
            max={interaction.axisStart}
            step={1}
            value={axisStart}
            onChange={(e) => {
              const v = Number(e.target.value);
              setAxisStart(v);
              tryComplete(v);
            }}
            className="mt-2 w-full accent-teal"
            aria-valuemin={0}
            aria-valuemax={interaction.axisStart}
            aria-valuenow={axisStart}
          />
        </label>
      )}

      {solved && (
        <p className="animate-check-pop rounded-xl bg-teal/10 px-3 py-2 text-sm font-medium text-navy">
          {interaction.successMessage[language]}
        </p>
      )}
    </div>
  );
}
