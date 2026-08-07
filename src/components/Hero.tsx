import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Logo } from "./Logo";
import { useI18n } from "../i18n/I18nContext";

export function Hero() {
  const { copy, language } = useI18n();

  return (
    <section
      id="home"
      className="relative overflow-hidden border-b border-navy/8"
      aria-labelledby="hero-title"
    >
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 70% 20%, rgba(56,189,248,0.18), transparent), radial-gradient(ellipse 50% 40% at 10% 80%, rgba(14,165,164,0.12), transparent), linear-gradient(180deg, #F8FAFC 0%, #EEF6FB 100%)",
        }}
      />
      <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-20">
        <div className="animate-slide-up">
          <Logo size="lg" showTagline tagline={copy.brand.tagline} />
          <h1
            id="hero-title"
            className="mt-6 font-display text-3xl font-bold tracking-tight text-navy sm:text-4xl lg:text-[2.75rem] lg:leading-tight"
          >
            {copy.hero.title}
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-navy/70 sm:text-lg">
            {copy.hero.subtitle}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/demo"
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-teal px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal/90"
            >
              {language === "es"
                ? "Abrir la demo interactiva"
                : "Launch the interactive demo"}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              to="/practice"
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-navy/15 bg-white px-5 py-2.5 text-sm font-semibold text-navy transition hover:bg-navy/5"
            >
              {copy.hero.ctaDemo}
            </Link>
            <Link
              to="/integration"
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-navy/15 bg-white px-5 py-2.5 text-sm font-semibold text-navy transition hover:bg-navy/5"
            >
              {copy.hero.ctaIntegration}
            </Link>
          </div>
          <p className="mt-6 flex items-start gap-2 text-sm text-navy/60">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-teal" aria-hidden />
            {copy.hero.disclaimer}
          </p>
        </div>

        <div className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <div className="overflow-hidden rounded-2xl border border-navy/10 bg-white shadow-[0_20px_50px_-24px_rgba(15,23,42,0.35)]">
            <div className="flex items-center gap-2 border-b border-navy/8 bg-navy/[0.03] px-3 py-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-navy/20" aria-hidden />
              <span className="h-2.5 w-2.5 rounded-full bg-navy/20" aria-hidden />
              <span className="h-2.5 w-2.5 rounded-full bg-navy/20" aria-hidden />
              <span className="ml-2 truncate text-xs text-navy/50">
                {copy.hero.browserTitle}
              </span>
            </div>
            <div className="bg-gradient-to-b from-sky/10 to-off-white p-4 sm:p-6">
              <div className="rounded-xl border border-navy/10 bg-white p-4 shadow-sm">
                <p className="text-sm font-semibold text-navy">
                  {copy.hero.mockPrompt}
                </p>
                <ul className="mt-3 space-y-2">
                  <li className="rounded-lg border border-amber/40 bg-amber/5 px-3 py-2 text-sm text-navy">
                    {copy.hero.mockOptionA}
                  </li>
                  <li className="rounded-lg border border-navy/10 px-3 py-2 text-sm text-navy/70">
                    {copy.hero.mockOptionB}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
