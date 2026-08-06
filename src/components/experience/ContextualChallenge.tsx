import { useEffect, useId, useRef, useState } from "react";
import { Lightbulb, SkipForward, X } from "lucide-react";
import { Logo } from "../Logo";
import { ChallengeOption } from "../ChallengeOption";
import { useI18n } from "../../i18n/I18nContext";
import type { ExperienceScenario } from "../../types/learning";

interface ContextualChallengeProps {
  scenario: ExperienceScenario;
  step: number;
  totalSteps: number;
  detailed: boolean;
  onAnswer: (correct: boolean) => void;
  onSkip: () => void;
  onContinue: () => void;
  phase: "challenge" | "feedback";
  answeredCorrect: boolean | null;
}

export function ContextualChallenge({
  scenario,
  step,
  totalSteps,
  detailed,
  onAnswer,
  onSkip,
  onContinue,
  phase,
  answeredCorrect,
}: ContextualChallengeProps) {
  const { language, copy } = useI18n();
  const [selected, setSelected] = useState<string | null>(null);
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  const explanation = detailed
    ? scenario.challenge.explanationLong[language]
    : scenario.challenge.explanationShort[language];

  const stepLabel = copy.experience.stepOf
    .replace("{current}", String(step))
    .replace("{total}", String(totalSteps));

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-navy/55 p-0 sm:items-center sm:p-4"
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="animate-slide-up flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
      >
        <div className="flex items-start justify-between gap-3 border-b border-navy/8 px-4 py-3">
          <div>
            <Logo size="sm" />
            <p id={titleId} className="mt-2 text-xs font-semibold uppercase tracking-wide text-teal">
              {copy.experience.learningCheck}
            </p>
            <p className="text-xs text-navy/50">{stepLabel}</p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onSkip}
            className="rounded-lg p-2 text-navy/50 hover:bg-navy/5"
            aria-label={copy.experience.skip}
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <div className="overflow-y-auto p-4 sm:p-5">
          <h3 className="text-base font-semibold text-navy">
            {scenario.challenge.question[language]}
          </h3>

          <div
            role="radiogroup"
            aria-label={scenario.challenge.question[language]}
            className="mt-4 space-y-2"
          >
            {scenario.challenge.options.map((opt, i) => (
              <ChallengeOption
                key={opt.id}
                id={opt.id}
                label={opt.label[language]}
                selected={selected === opt.id}
                revealed={phase === "feedback"}
                isCorrect={opt.id === scenario.challenge.correctOptionId}
                disabled={phase === "feedback"}
                onSelect={setSelected}
                index={i}
              />
            ))}
          </div>

          {phase === "challenge" && (
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                disabled={!selected}
                onClick={() => {
                  if (!selected) return;
                  onAnswer(selected === scenario.challenge.correctOptionId);
                }}
                className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl bg-navy px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40 sm:flex-none"
              >
                {copy.experience.check}
              </button>
              <button
                type="button"
                onClick={onSkip}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-navy/15 px-4 py-2.5 text-sm font-medium text-navy/70"
              >
                <SkipForward className="h-4 w-4" aria-hidden />
                {copy.experience.skip}
              </button>
            </div>
          )}

          {phase === "feedback" && (
            <div className="mt-5 animate-slide-up rounded-xl border border-navy/10 bg-off-white p-4">
              <p className="text-sm leading-relaxed text-navy/80">{explanation}</p>
              <div className="mt-3 flex items-start gap-2 rounded-lg bg-sky/10 px-3 py-2.5">
                <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber" aria-hidden />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-navy/50">
                    {copy.experience.takeaway}
                  </p>
                  <p className="text-sm font-medium text-navy">
                    {scenario.challenge.takeaway[language]}
                  </p>
                </div>
              </div>
              {answeredCorrect !== null && (
                <p className="sr-only">
                  {answeredCorrect ? copy.demo.correct : copy.demo.incorrect}
                </p>
              )}
              <button
                type="button"
                onClick={onContinue}
                className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-teal px-4 py-2.5 text-sm font-semibold text-white sm:w-auto"
              >
                {copy.experience.continue}
              </button>
            </div>
          )}

          <p className="mt-4 text-xs text-navy/45">{copy.experience.a11yNote}</p>
        </div>
      </div>
    </div>
  );
}
