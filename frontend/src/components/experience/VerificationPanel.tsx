import { AlertTriangle, CheckCircle2 } from "lucide-react";
import type { Language } from "../../types";
import type { VerificationFact } from "../../types/learning";
import { useI18n } from "../../i18n/I18nContext";

interface VerificationPanelProps {
  facts: VerificationFact[];
  language: Language;
  onContinue: () => void;
}

export function VerificationPanel({
  facts,
  language,
  onContinue,
}: VerificationPanelProps) {
  const { copy } = useI18n();

  return (
    <div className="animate-slide-up rounded-2xl border border-teal/30 bg-white p-4 shadow-lg sm:p-5">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="h-5 w-5 animate-check-pop text-teal" aria-hidden />
        <h3 className="font-semibold text-navy">{copy.experience.verifiedMoment}</h3>
      </div>
      <ul className="mt-4 space-y-2">
        {facts.map((fact) => (
          <li
            key={fact.label.en}
            className="flex items-start gap-2 rounded-xl border border-amber/25 bg-amber/5 px-3 py-2.5"
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber" aria-hidden />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-navy/50">
                {fact.label[language]}
              </p>
              <p className="text-sm font-medium text-navy">{fact.value[language]}</p>
            </div>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={onContinue}
        className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-navy px-4 py-2.5 text-sm font-semibold text-white"
      >
        {copy.experience.continue}
      </button>
    </div>
  );
}
