import { CheckCircle2, Lightbulb, XCircle } from "lucide-react";
import { useI18n } from "../../i18n/I18nContext";

interface MinigameFeedbackProps {
  correct: boolean;
  explanation: string;
  takeaway: string;
  metricLabel?: string;
  metricValue?: string;
  onContinue: () => void;
  compact?: boolean;
}

export function MinigameFeedback({
  correct,
  explanation,
  takeaway,
  metricLabel,
  metricValue,
  onContinue,
  compact,
}: MinigameFeedbackProps) {
  const { copy } = useI18n();

  if (compact) {
    return (
      <div className="animate-slide-up space-y-3" role="status" aria-live="polite">
        <p className="text-sm text-navy/70">
          {copy.experience.resultNextHint}
        </p>
        <button
          type="button"
          data-primary-cta="true"
          onClick={onContinue}
          className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-teal px-4 text-sm font-semibold text-white"
        >
          {copy.experience.continueToDecision}
        </button>
      </div>
    );
  }

  return (
    <div
      className="animate-slide-up rounded-xl border border-navy/10 bg-off-white p-4"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-2">
        {correct ? (
          <CheckCircle2 className="h-5 w-5 animate-check-pop text-teal" aria-hidden />
        ) : (
          <XCircle className="h-5 w-5 text-amber" aria-hidden />
        )}
        <p className="font-semibold text-navy">
          {correct ? copy.minigame.solved : copy.minigame.keepGoing}
        </p>
      </div>
      {metricLabel && metricValue && (
        <p className="mt-2 text-sm font-medium text-teal">
          {metricLabel}: {metricValue}
        </p>
      )}
      <p className="mt-2 text-sm leading-relaxed text-navy/75">{explanation}</p>
      <div className="mt-3 flex items-start gap-2 rounded-lg bg-sky/10 px-3 py-2.5">
        <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber" aria-hidden />
        <p className="text-sm font-medium text-navy">{takeaway}</p>
      </div>
      <button
        type="button"
        data-primary-cta="true"
        onClick={onContinue}
        className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-navy px-4 py-2.5 text-sm font-semibold text-white sm:w-auto"
      >
        {copy.minigame.continue}
      </button>
    </div>
  );
}
