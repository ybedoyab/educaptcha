import {
  FileText,
  HelpCircle,
  Search,
  Calendar,
  ExternalLink,
} from "lucide-react";
import type { SourceTraceStep } from "../../types/sourceTrace";
import { useI18n } from "../../i18n/I18nContext";

const kindIcon = {
  claim: FileText,
  social: HelpCircle,
  repost: HelpCircle,
  publisher: HelpCircle,
  archive: Search,
  original: Calendar,
} as const;

const kindTone = {
  claim: "text-teal",
  social: "text-amber",
  repost: "text-amber",
  publisher: "text-amber",
  archive: "text-teal",
  original: "text-teal",
} as const;

interface Props {
  steps: SourceTraceStep[];
  className?: string;
}

type DisplayRow =
  | { type: "step"; step: SourceTraceStep }
  | {
      type: "source-photo";
      archive: SourceTraceStep;
      original: SourceTraceStep;
    };

/** Merge consecutive archive + original into one evidence card. */
function coalesceSteps(steps: SourceTraceStep[]): DisplayRow[] {
  const rows: DisplayRow[] = [];
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i]!;
    const next = steps[i + 1];
    if (step.kind === "archive" && next?.kind === "original") {
      rows.push({ type: "source-photo", archive: step, original: next });
      i += 1;
      continue;
    }
    rows.push({ type: "step", step });
  }
  return rows;
}

/** Compact evidence list â€” verification pause, not an academic dossier. */
export function SourceTrace({ steps, className = "" }: Props) {
  const { language, copy } = useI18n();
  const openLabel = copy.experience.openSource;
  const rows = coalesceSteps(steps);

  return (
    <ul
      className={`space-y-2 ${className}`}
      aria-label={
        language === "es" ? "Evidencia de verificación" : "Verification evidence"
      }
    >
      {rows.map((row) => {
        if (row.type === "source-photo") {
          const { archive, original } = row;
          const href = archive.href ?? original.href;
          const place = original.detail
            ? `${original.value[language]} â€” ${original.detail[language]}`
            : original.value[language];
          const label =
            language === "es"
              ? "Fuente y foto originales"
              : "Original source & photo";

          return (
            <li
              key={`${archive.id}-${original.id}`}
              className="flex items-start gap-3 rounded-xl border border-teal/25 bg-teal/[0.03] px-3 py-3"
            >
              <Search className="mt-0.5 h-5 w-5 shrink-0 text-teal" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-navy">{label}</p>
                <p className="mt-0.5 text-sm leading-snug text-navy/70">
                  {archive.value[language]}
                </p>
                <p className="mt-1 flex items-start gap-1.5 text-sm leading-snug text-navy/70">
                  <Calendar
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal"
                    aria-hidden
                  />
                  <span>{place}</span>
                </p>
                {href ? (
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-teal/30 bg-white px-2.5 text-xs font-semibold text-teal hover:bg-teal/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
                  >
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                    {openLabel}
                  </a>
                ) : null}
              </div>
            </li>
          );
        }

        const { step } = row;
        const Icon = kindIcon[step.kind] ?? FileText;
        const tone = kindTone[step.kind] ?? "text-navy/60";
        const value =
          step.detail != null
            ? `${step.value[language]} â€” ${step.detail[language]}`
            : step.value[language];
        const hasLink = Boolean(step.href);
        const isSourceLink =
          hasLink && (step.kind === "archive" || step.kind === "original");

        return (
          <li
            key={step.id}
            className={`flex items-start gap-3 rounded-xl border border-navy/10 bg-white px-3 py-3 ${
              isSourceLink ? "border-teal/25 bg-teal/[0.03]" : ""
            }`}
          >
            <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${tone}`} aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-navy">{step.label[language]}</p>
              <p className="mt-0.5 text-sm leading-snug text-navy/70">{value}</p>
              {isSourceLink && step.href ? (
                <a
                  href={step.href}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-teal/30 bg-white px-2.5 text-xs font-semibold text-teal hover:bg-teal/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
                >
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                  {openLabel}
                </a>
              ) : null}
            </div>
            {hasLink && !isSourceLink && step.href ? (
              <a
                href={step.href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-lg text-navy/70 hover:bg-navy/5 hover:text-navy"
                aria-label={
                  language === "es"
                    ? "Abrir fuente original"
                    : "Open original source"
                }
              >
                <ExternalLink className="h-4 w-4" aria-hidden />
              </a>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
