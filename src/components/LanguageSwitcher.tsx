import { useI18n } from "../i18n/I18nContext";
import type { Language } from "../types";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
  const { language, setLanguage, copy } = useI18n();

  return (
    <div
      className="inline-flex items-center gap-1.5 rounded-lg border border-navy/10 bg-white px-2 py-1"
      role="group"
      aria-label={copy.language.label}
    >
      <Globe className="h-4 w-4 text-teal" aria-hidden />
      {(["en", "es"] as Language[]).map((lang) => (
        <button
          key={lang}
          type="button"
          onClick={() => setLanguage(lang)}
          aria-pressed={language === lang}
          className={`rounded-md px-2.5 py-1 text-sm font-medium transition-colors ${
            language === lang
              ? "bg-navy text-white"
              : "text-navy/70 hover:bg-navy/5"
          }`}
        >
          {lang === "en" ? copy.language.en : copy.language.es}
        </button>
      ))}
    </div>
  );
}
