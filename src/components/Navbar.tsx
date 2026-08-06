import { useEffect, useState } from "react";
import { Menu, RotateCcw, X } from "lucide-react";
import { Logo } from "./Logo";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useI18n } from "../i18n/I18nContext";
import type { SectionId } from "../types";

interface NavbarProps {
  active: SectionId;
  onNavigate: (id: SectionId) => void;
  onReset: () => void;
}

const links: {
  id: SectionId;
  labelKey: "home" | "experience" | "demo" | "integration" | "impact" | "results";
}[] = [
  { id: "home", labelKey: "home" },
  { id: "experience", labelKey: "experience" },
  { id: "demo", labelKey: "demo" },
  { id: "integration", labelKey: "integration" },
  { id: "impact", labelKey: "impact" },
  { id: "results", labelKey: "results" },
];

export function Navbar({ active, onNavigate, onReset }: NavbarProps) {
  const { copy } = useI18n();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const go = (id: SectionId) => {
    onNavigate(id);
    setOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-navy/8 bg-off-white/90 backdrop-blur-md">
      <nav
        className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6"
        aria-label="Main"
      >
        <button
          type="button"
          onClick={() => go("home")}
          className="rounded-lg focus-visible:outline-teal"
          aria-label="EduCAPTCHA home"
        >
          <Logo size="sm" showTagline={false} />
        </button>

        <ul className="hidden items-center gap-1 lg:flex">
          {links.map((link) => (
            <li key={link.id}>
              <button
                type="button"
                onClick={() => go(link.id)}
                aria-current={active === link.id ? "page" : undefined}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active === link.id
                    ? "bg-teal/10 text-teal"
                    : "text-navy/70 hover:bg-navy/5 hover:text-navy"
                }`}
              >
                {copy.nav[link.labelKey]}
              </button>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <LanguageSwitcher />
          </div>
          <button
            type="button"
            onClick={onReset}
            className="hidden items-center gap-1.5 rounded-lg border border-navy/10 bg-white px-2.5 py-1.5 text-sm font-medium text-navy/70 transition-colors hover:bg-navy/5 md:inline-flex"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden />
            {copy.nav.reset}
          </button>
          <button
            type="button"
            className="inline-flex rounded-lg border border-navy/10 bg-white p-2 text-navy lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? (
              <X className="h-5 w-5" aria-hidden />
            ) : (
              <Menu className="h-5 w-5" aria-hidden />
            )}
            <span className="sr-only">
              {open ? copy.nav.closeMenu : copy.nav.openMenu}
            </span>
          </button>
        </div>
      </nav>

      {open && (
        <div
          id="mobile-menu"
          className="border-t border-navy/8 bg-white px-4 py-4 lg:hidden animate-fade-in"
        >
          <ul className="flex flex-col gap-1">
            {links.map((link) => (
              <li key={link.id}>
                <button
                  type="button"
                  onClick={() => go(link.id)}
                  className={`w-full rounded-lg px-3 py-3 text-left text-base font-medium ${
                    active === link.id
                      ? "bg-teal/10 text-teal"
                      : "text-navy hover:bg-navy/5"
                  }`}
                >
                  {copy.nav[link.labelKey]}
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-navy/8 pt-4">
            <LanguageSwitcher />
            <button
              type="button"
              onClick={() => {
                onReset();
                setOpen(false);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-navy/10 px-3 py-2 text-sm font-medium text-navy/70"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden />
              {copy.nav.reset}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
