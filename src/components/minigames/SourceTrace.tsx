import { ArrowDown, Archive, AlertTriangle, CheckCircle2, HelpCircle, XCircle } from "lucide-react";
import type { SourceTraceStep } from "../../types/sourceTrace";
import { useI18n } from "../../i18n/I18nContext";

const statusIcon = {
  verified: CheckCircle2,
  unknown: HelpCircle,
  archived: Archive,
  missing: XCircle,
  conflicting: AlertTriangle,
} as const;

const statusClass = {
  verified: "border-teal/30 bg-teal/10 text-teal",
  unknown: "border-amber/30 bg-amber/10 text-amber",
  archived: "border-sky/30 bg-sky/10 text-sky",
  missing: "border-amber/40 bg-amber/15 text-amber",
  conflicting: "border-amber/40 bg-amber/15 text-amber",
} as const;

interface Props {
  steps: SourceTraceStep[];
  className?: string;
}

/** Presentation-only source chain. Scenario content lives in data files. */
export function SourceTrace({ steps, className = "" }: Props) {
  const { language } = useI18n();

  return (
    <ol
      className={`space-y-0 ${className}`}
      aria-label={language === "es" ? "Rastro de fuente" : "Source trace"}
    >
      {steps.map((step, index) => {
        const Icon = step.status ? statusIcon[step.status] : null;
        return (
          <li key={step.id} className="relative">
            <div
              className={`rounded-xl border px-3 py-3 ${
                step.status
                  ? statusClass[step.status]
                  : "border-navy/10 bg-white text-navy"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wide opacity-70">
                    {step.label[language]}
                  </p>
                  <p className="mt-1 text-sm font-semibold leading-snug">
                    {step.value[language]}
                  </p>
                  {step.detail && (
                    <p className="mt-1 text-xs opacity-80">
                      {step.detail[language]}
                    </p>
                  )}
                </div>
                {Icon && <Icon className="h-4 w-4 shrink-0" aria-hidden />}
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className="flex justify-center py-1" aria-hidden>
                <ArrowDown className="h-4 w-4 text-navy/30" />
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
