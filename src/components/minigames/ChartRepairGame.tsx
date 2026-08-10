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
  const span = Math.max(maxVal - currentStart, 1);
  const bars = useMemo(() => {
    return interaction.series.map((s) => {
      const height = ((s.value - currentStart) / span) * 100;
      return { ...s, height: Math.max(4, Math.min(100, height)) };
    });
  }, [interaction.series, currentStart, span]);

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
        <div className="flex gap-2">
          <div className="relative h-40 w-8 shrink-0">
            {ticks.map((t, i) => (
              <span
                key={`${t}-${i}`}
                className="absolute right-0 translate-y-1/2 text-[0.65rem] leading-none text-navy/45"
                style={{ bottom: `${((t - currentStart) / span) * 100}%` }}
              >
                {t}
              </span>
            ))}
          </div>
          <div className="min-w-0 flex-1">
            {/* h-40 gives the cells a definite height so each bar's % resolves */}
            <div className="flex h-40 gap-6 border-b border-l border-navy/20 px-3">
              {bars.map((bar) => (
                <div key={bar.id} className="flex flex-1 items-end justify-center">
                  <div
                    className="w-full max-w-16 rounded-t-md bg-gradient-to-t from-teal to-sky transition-[height] duration-150"
                    style={{ height: `${bar.height}%` }}
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-6 px-3 pt-1">
              {bars.map((bar) => (
                <div
                  key={bar.id}
                  className="flex flex-1 flex-col items-center gap-0.5"
                >
                  <span className="text-xs text-navy/60">
                    {bar.label[language]}
                  </span>
                  <span className="text-[0.65rem] font-semibold text-navy">
                    {bar.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
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
