import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, Volume2 } from "lucide-react";
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
          <p className="mt-3 text-sm font-semibold text-teal">{copy.hero.flowLabel}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/demo"
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-teal px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal/90"
            >
              {copy.hero.ctaY}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              to="/demo/bookface"
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-navy/15 bg-white px-5 py-2.5 text-sm font-semibold text-navy transition hover:bg-navy/5"
            >
              {copy.hero.ctaBookface}
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-transparent px-5 py-2.5 text-sm font-semibold text-navy/70 underline-offset-4 hover:underline"
            >
              {copy.hero.ctaDemo}
            </a>
          </div>
          <p className="mt-6 flex items-start gap-2 text-sm text-navy/60">
            <Volume2 className="mt-0.5 h-4 w-4 shrink-0 text-teal" aria-hidden />
            {copy.hero.inclusiveNote}
          </p>
          <p className="mt-3 flex items-start gap-2 text-sm text-navy/55">
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
                <p className="text-[11px] font-semibold uppercase tracking-wide text-navy/45">
                  EduCAPTCHA
                </p>
                <p className="mt-2 text-base font-bold text-navy">
                  {copy.hero.mockPrompt}
                </p>
                <p className="mt-1 text-sm text-navy/65">{copy.hero.mockOptionA}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="inline-flex min-h-10 items-center rounded-xl bg-teal px-4 text-sm font-semibold text-white">
                    {language === "es" ? "Revisar foto" : "Check photo"}
                  </span>
                  <span className="inline-flex min-h-10 items-center rounded-xl border border-navy/15 px-4 text-sm font-semibold text-navy">
                    {language === "es" ? "Compartir igual" : "Share anyway"}
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
