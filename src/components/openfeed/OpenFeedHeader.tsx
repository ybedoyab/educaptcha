import { Link } from "react-router-dom";
import { LogOut } from "lucide-react";
import { Logo } from "../Logo";
import { LanguageSwitcher } from "../LanguageSwitcher";
import { useI18n } from "../../i18n/I18nContext";

export function OpenFeedHeader() {
  const { copy, language } = useI18n();

  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-navy/10 bg-white/95 px-3 backdrop-blur sm:px-4">
      <div className="flex min-w-0 items-center gap-3">
        <p className="truncate font-display text-lg font-bold tracking-tight text-navy">
          {copy.experience.feedName}
        </p>
        <span className="hidden text-xs text-navy/40 sm:inline" aria-hidden>
          ·
        </span>
        <span className="hidden opacity-70 sm:inline">
          <Logo size="sm" showTagline={false} />
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Link
          to="/demo/test-session"
          className="hidden min-h-11 items-center rounded-xl px-2 text-xs font-semibold text-navy/55 hover:text-navy sm:inline-flex"
        >
          {language === "es" ? "Sesión de prueba" : "Test session"}
        </Link>
        <LanguageSwitcher />
        <Link
          to="/"
          className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-navy/15 bg-off-white px-3 text-sm font-semibold text-navy transition hover:bg-navy/5"
        >
          <LogOut className="h-4 w-4" aria-hidden />
          {language === "es" ? "Salir de la demo" : "Exit demo"}
        </Link>
      </div>
    </header>
  );
}
