import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { createElement } from "react";
import type { Language } from "../types";
import { translations, type UiCopy } from "./translations";
import { useLocalStorage } from "../hooks/useLocalStorage";

interface I18nContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  copy: UiCopy;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useLocalStorage<Language>(
    "educaptcha-language",
    "en",
  );

  const setLang = useCallback(
    (lang: Language) => {
      setLanguage(lang);
      document.documentElement.lang = lang;
    },
    [setLanguage],
  );

  const value = useMemo(
    () => ({
      language,
      setLanguage: setLang,
      copy: translations[language] as UiCopy,
    }),
    [language, setLang],
  );

  return createElement(I18nContext.Provider, { value }, children);
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return ctx;
}
