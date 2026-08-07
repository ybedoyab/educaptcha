import { ArrowDown, Archive, AlertTriangle, CheckCircle2, HelpCircle, XCircle } from "lucide-react";
import type { LocalizedText } from "../../types";
import { useI18n } from "../../i18n/I18nContext";

export type SourceTraceStatus =
  | "verified"
  | "unknown"
  | "archived"
  | "missing"
  | "conflicting";

export type SourceTraceStep = {
  id: string;
  kind: "claim" | "social" | "repost" | "publisher" | "original" | "archive";
  label: LocalizedText;
  value: LocalizedText;
  status?: SourceTraceStatus;
  detail?: LocalizedText;
};

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

/** Default source chain for the Lagos flood out-of-context scenario */
export const floodSourceTraceSteps: SourceTraceStep[] = [
  {
    id: "claim",
    kind: "claim",
    label: { en: "Claim", es: "Afirmación" },
    value: {
      en: "LIVE from tonight’s emergency.",
      es: "EN VIVO desde la emergencia de esta noche.",
    },
    status: "conflicting",
  },
  {
    id: "social",
    kind: "social",
    label: { en: "Social post", es: "Publicación social" },
    value: { en: "Breaking Frames", es: "Breaking Frames" },
    detail: {
      en: "Viral desk · high engagement",
      es: "Escritorio viral · alto engagement",
    },
    status: "unknown",
  },
  {
    id: "source",
    kind: "publisher",
    label: { en: "Source", es: "Fuente" },
    value: {
      en: "No original source provided",
      es: "Sin fuente original",
    },
    status: "missing",
  },
  {
    id: "archive",
    kind: "archive",
    label: { en: "Visual archive match", es: "Coincidencia de archivo" },
    value: { en: "Wikimedia Commons", es: "Wikimedia Commons" },
    status: "archived",
  },
  {
    id: "original",
    kind: "original",
    label: { en: "Original", es: "Original" },
    value: { en: "Lagos, Nigeria", es: "Lagos, Nigeria" },
    detail: { en: "June 24, 2019", es: "24 de junio de 2019" },
    status: "verified",
  },
];
