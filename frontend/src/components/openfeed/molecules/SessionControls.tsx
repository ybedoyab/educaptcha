import { Languages, LogOut, TestTube2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useI18n } from "../../../i18n/I18nContext";
import type { Language } from "../../../types";
import { OPEN_FEED_ROUTES } from "../openFeed.constants";

interface SessionControlsProps {
  compact?: boolean;
  showTestSession?: boolean;
}

const NEXT_LANGUAGE: Record<Language, Language> = {
  en: "es",
  es: "en",
};

export function SessionControls({
  compact = false,
  showTestSession = true,
}: SessionControlsProps) {
  const { language, setLanguage, copy } = useI18n();
  const labelClass = compact ? "sr-only xl:not-sr-only" : "sr-only";
  const controlClass =
    "inline-flex min-h-11 min-w-11 items-center justify-center gap-3 rounded-full px-3 text-sm text-social-muted transition-colors hover:bg-social-blue/10 hover:text-social-blue";

  return (
    <div className="flex items-center justify-end gap-1 lg:flex-col lg:items-stretch">
      {showTestSession ? (
        <Link to={OPEN_FEED_ROUTES.testSession} className={controlClass}>
          <TestTube2 className="h-5 w-5 shrink-0" aria-hidden="true" />
          <span className={labelClass}>{copy.experience.testSession}</span>
        </Link>
      ) : null}
      <button
        type="button"
        onClick={() => setLanguage(NEXT_LANGUAGE[language])}
        className={controlClass}
        aria-label={copy.language.label}
      >
        <Languages className="h-5 w-5 shrink-0" aria-hidden="true" />
        <span className={labelClass}>{copy.language.label}</span>
        <span className="text-[10px] font-bold uppercase" aria-hidden="true">
          {language}
        </span>
      </button>
      <Link
        to={OPEN_FEED_ROUTES.home}
        className={controlClass}
        aria-label={copy.experience.exitDemo}
      >
        <LogOut className="h-5 w-5 shrink-0" aria-hidden="true" />
        <span className={labelClass}>{copy.experience.exitDemo}</span>
      </Link>
    </div>
  );
}

