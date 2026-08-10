import { Languages, LogOut, TestTube2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useI18n } from "../../../i18n/I18nContext";
import type { Language } from "../../../types";
import { BOOKFACE_ROUTES } from "../bookface.constants";

const NEXT_LANGUAGE: Record<Language, Language> = {
  en: "es",
  es: "en",
};

const CONTROL_CLASS =
  "grid min-h-11 min-w-11 place-items-center rounded-full bg-bf-chip text-bf-text transition-colors hover:bg-bf-border";

export function BookfaceSessionControls() {
  const { language, setLanguage, copy } = useI18n();

  return (
    <div className="flex items-center gap-1.5">
      <Link
        to={BOOKFACE_ROUTES.testSession}
        className={CONTROL_CLASS}
        aria-label={copy.experience.testSession}
        title={copy.experience.testSession}
      >
        <TestTube2 className="h-5 w-5" aria-hidden="true" />
      </Link>
      <button
        type="button"
        onClick={() => setLanguage(NEXT_LANGUAGE[language])}
        className={CONTROL_CLASS}
        aria-label={copy.language.label}
        title={copy.language.label}
      >
        <Languages className="h-5 w-5" aria-hidden="true" />
      </button>
      <Link
        to={BOOKFACE_ROUTES.home}
        className={CONTROL_CLASS}
        aria-label={copy.experience.exitDemo}
        title={copy.experience.exitDemo}
      >
        <LogOut className="h-5 w-5" aria-hidden="true" />
      </Link>
    </div>
  );
}
