import type { ReactNode } from "react";
import { HelpCircle, SkipForward, X } from "lucide-react";
import { Logo } from "../Logo";
import { useI18n } from "../../i18n/I18nContext";

interface MinigameShellProps {
  title: string;
  instruction: string;
  categoryLabel: string;
  stepLabel?: string;
  whyText: string;
  children: ReactNode;
  onSkip: () => void;
  onClose?: () => void;
  footer?: ReactNode;
  compact?: boolean;
  wide?: boolean;
  /** When true, parent dialog owns the header — no duplicate branding */
  embedded?: boolean;
  showWhy?: boolean;
  layout?: "single" | "investigate" | "feedback";
}

export function MinigameShell({
  title,
  instruction,
  categoryLabel,
  stepLabel,
  whyText,
  children,
  onSkip,
  onClose,
  footer,
  compact,
  wide,
  embedded,
  showWhy = false,
  layout = "single",
}: MinigameShellProps) {
  const { copy } = useI18n();

  const body = (
    <>
      {instruction ? (
        <p className="text-sm font-medium text-navy">{instruction}</p>
      ) : null}
      {children}
      {showWhy && (
        <details className="rounded-xl bg-off-white px-3 py-2">
          <summary className="flex cursor-pointer list-none items-center gap-2 text-xs font-semibold text-navy/60">
            <HelpCircle className="h-3.5 w-3.5 text-teal" aria-hidden />
            {copy.minigame.why}
          </summary>
          <p className="mt-2 text-xs leading-relaxed text-navy/70">{whyText}</p>
        </details>
      )}
      {footer}
    </>
  );

  if (embedded) {
    return <div className="space-y-3">{body}</div>;
  }

  return (
    <div
      className={`flex w-full flex-col overflow-hidden rounded-2xl border border-navy/10 bg-white shadow-lg ${
        wide ? "max-w-[960px]" : compact ? "max-w-md" : "max-w-2xl"
      }`}
    >
      <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-navy/8 bg-white px-4 py-3">
        <div className="min-w-0">
          <Logo size="sm" />
          <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-teal">
            {categoryLabel}
            {stepLabel ? ` · ${stepLabel}` : ""}
          </p>
          <h3 className="mt-1 truncate text-sm font-semibold text-navy sm:text-base">
            {title}
          </h3>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={onSkip}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-navy/15 px-3 text-sm font-medium text-navy/70"
          >
            <SkipForward className="h-4 w-4" aria-hidden />
            {copy.minigame.skip}
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-navy/15"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div
        className={`space-y-3 p-4 sm:p-5 ${
          layout === "investigate"
            ? "lg:grid lg:grid-cols-[55%_45%] lg:gap-5 lg:space-y-0"
            : layout === "feedback"
              ? "lg:grid lg:grid-cols-2 lg:gap-5 lg:space-y-0"
              : ""
        }`}
      >
        {body}
      </div>
    </div>
  );
}
