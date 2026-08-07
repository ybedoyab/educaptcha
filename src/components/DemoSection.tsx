import { Award, Compass, RefreshCw } from "lucide-react";
import { challenges } from "../data/challenges";
import { useDemoProgress } from "../hooks/useDemoProgress";
import { useI18n } from "../i18n/I18nContext";
import type { SectionId } from "../types";
import type { ChallengeResult } from "../types/minigame";
import { MinigameRenderer } from "./minigames/MinigameRenderer";
import { ProgressIndicator } from "./ProgressIndicator";

interface DemoSectionProps {
  onNavigate: (id: SectionId) => void;
  progressApi: ReturnType<typeof useDemoProgress>;
}

const badgeLabels: Record<string, { en: string; es: string }> = {
  "signal-spotter": { en: "Signal spotter", es: "Detector de señales" },
  "source-checker": { en: "Source checker", es: "Verificador de fuentes" },
  "context-investigator": {
    en: "Context investigator",
    es: "Investigador de contexto",
  },
  "chart-reader": { en: "Chart reader", es: "Lector de gráficas" },
  "pressure-detector": {
    en: "Pressure detector",
    es: "Detector de presión",
  },
  "ai-skeptic": {
    en: "Responsible AI skeptic",
    es: "Escéptico responsable de IA",
  },
};

export function DemoSection({ onNavigate, progressApi }: DemoSectionProps) {
  const { language, copy } = useI18n();
  const {
    progress,
    currentIndex,
    current,
    total,
    markResult,
    markSkip,
    goNext,
    reset,
    finish,
  } = progressApi;

  const handleComplete = (result: ChallengeResult) => {
    if (!current) return;
    markResult(current.id, result, current.badge);
    if (currentIndex >= total - 1) finish();
    else goNext();
  };

  const handleSkip = () => {
    if (!current) return;
    markSkip(current.id);
    if (currentIndex >= total - 1) finish();
    else goNext();
  };

  const completedCount = progress.completedIds.length;

  return (
    <section
      id="demo"
      className="scroll-mt-20 border-b border-navy/8 bg-gradient-to-b from-off-white to-sky/10"
      aria-labelledby="demo-title"
    >
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h2
          id="demo-title"
          className="font-display text-2xl font-bold text-navy sm:text-3xl"
        >
          {copy.demo.title}
        </h2>
        <p className="mt-2 text-navy/65">{copy.demo.subtitle}</p>

        <div className="mt-6 rounded-2xl border border-teal/30 bg-gradient-to-br from-teal/10 to-sky/10 p-5 sm:p-6">
          <h3 className="font-display text-lg font-bold text-navy">
            {copy.demo.contextCardTitle}
          </h3>
          <p className="mt-2 text-sm text-navy/75">{copy.demo.contextCardText}</p>
          <button
            type="button"
            onClick={() => onNavigate("experience")}
            className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl bg-teal px-4 py-2.5 text-sm font-semibold text-white"
          >
            <Compass className="h-4 w-4" aria-hidden />
            {copy.demo.contextCardCta}
          </button>
        </div>

        <div className="mt-8">
          <ProgressIndicator
            current={Math.min(completedCount, total)}
            total={total}
            label={copy.demo.progress}
            ofLabel={copy.demo.of}
          />
        </div>

        {progress.finished ? (
          <div className="mt-6 animate-slide-up rounded-2xl border border-navy/10 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-teal/15 text-teal">
                <Award className="h-6 w-6" aria-hidden />
              </span>
              <h3 className="font-display text-xl font-bold text-navy">
                {copy.demo.summaryTitle}
              </h3>
            </div>

            <ul className="mt-6 space-y-2">
              {challenges.map((c) => {
                const result = progress.results[c.id];
                const metric = result?.signalsTotal
                  ? `${result.signalsFound ?? 0}/${result.signalsTotal}`
                  : result?.skipped
                    ? copy.demo.skipped
                    : result?.correct
                      ? copy.minigame.complete
                      : copy.minigame.partial;
                return (
                  <li
                    key={c.id}
                    className="flex items-center justify-between rounded-xl bg-off-white px-3 py-2.5 text-sm"
                  >
                    <span className="font-medium text-navy">
                      {c.skillMetric[language]}
                    </span>
                    <span className="font-semibold text-teal">{metric}</span>
                  </li>
                );
              })}
            </ul>

            <div className="mt-6">
              <p className="text-sm font-semibold text-navy">
                {copy.demo.badgesTitle}
              </p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {progress.badges.map((b) => (
                  <li
                    key={b}
                    className="rounded-full bg-sky/15 px-3 py-1 text-xs font-semibold text-navy"
                  >
                    {badgeLabels[b]?.[language] ?? b}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={reset}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-teal px-5 py-2.5 text-sm font-semibold text-white"
              >
                <RefreshCw className="h-4 w-4" aria-hidden />
                {copy.demo.retry}
              </button>
              <button
                type="button"
                onClick={() => onNavigate("experience")}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-navy/15 bg-white px-5 py-2.5 text-sm font-semibold text-navy"
              >
                {copy.demo.contextCardCta}
              </button>
              <button
                type="button"
                onClick={() => onNavigate("impact")}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-navy/15 bg-white px-5 py-2.5 text-sm font-semibold text-navy"
              >
                {copy.demo.viewImpact}
              </button>
            </div>
          </div>
        ) : (
          current && (
            <div className="mt-6">
              <MinigameRenderer
                challenge={current}
                onComplete={handleComplete}
                onSkip={handleSkip}
              />
            </div>
          )
        )}
      </div>
    </section>
  );
}
