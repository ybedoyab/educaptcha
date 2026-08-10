import { Logo } from "./Logo";
import { useI18n } from "../i18n/I18nContext";

export function Footer() {
  const { copy } = useI18n();

  return (
    <footer className="border-t border-navy/8 bg-navy text-white">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-4 py-10 sm:flex-row sm:items-center sm:px-6">
        <div>
          <Logo size="sm" showTagline tagline={copy.brand.tagline} inverted />
          <p className="mt-3 text-sm text-white/70">{copy.footer.madeFor}</p>
        </div>
        <p className="max-w-sm text-sm text-white/60">{copy.footer.rights}</p>
      </div>
    </footer>
  );
}
