import { ArrowRight, ShieldCheck } from "lucide-react";
import { Logo } from "./Logo";
import { useI18n } from "../i18n/I18nContext";
import type { SectionId } from "../types";

interface HeroProps {
  onNavigate: (id: SectionId) => void;
}

export function Hero({ onNavigate }: HeroProps) {
  const { copy } = useI18n();

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
            <button
              type="button"
              onClick={() => onNavigate("experience")}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-teal px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal/90"
            >
              {copy.hero.ctaExperience}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => onNavigate("demo")}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-navy/15 bg-white px-5 py-2.5 text-sm font-semibold text-navy transition hover:bg-navy/5"
            >
              {copy.hero.ctaDemo}
            </button>
            <button
              type="button"
              onClick={() => onNavigate("integration")}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-navy/15 bg-white px-5 py-2.5 text-sm font-semibold text-navy transition hover:bg-navy/5"
            >
              {copy.hero.ctaIntegration}
            </button>
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
                <Logo size="sm" />
                <p className="mt-3 text-sm font-semibold text-navy">
                  {copy.hero.mockPrompt}
                </p>
                <div className="mt-3 space-y-2">
                  <div className="rounded-lg border-2 border-teal bg-teal/5 px-3 py-2.5 text-sm text-navy">
                    {copy.hero.mockOptionA}
                  </div>
                  <div className="rounded-lg border border-navy/10 px-3 py-2.5 text-sm text-navy/80">
                    {copy.hero.mockOptionB}
                  </div>
                </div>
                <div className="mt-3 flex justify-end">
                  <span className="rounded-lg bg-navy px-3 py-1.5 text-xs font-semibold text-white">
                    {copy.demo.check}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
