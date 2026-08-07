import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Comparison } from "../components/Comparison";
import { Footer } from "../components/Footer";
import { Hero } from "../components/Hero";
import { HowItWorks } from "../components/HowItWorks";
import { ImpactSection } from "../components/ImpactSection";
import { IntegrationDemo } from "../components/IntegrationDemo";
import { Navbar } from "../components/Navbar";
import { useDemoProgress } from "../hooks/useDemoProgress";
import { useLearningSession } from "../hooks/useLearningSession";
import { useI18n } from "../i18n/I18nContext";

export function LandingPage() {
  const { language } = useI18n();
  const progressApi = useDemoProgress();
  const learningApi = useLearningSession();

  const handleReset = () => {
    progressApi.reset();
    learningApi.resetLearning();
  };

  return (
    <div className="min-h-screen">
      <Navbar onReset={handleReset} />
      <main>
        <Hero />
        <HowItWorks />
        <Comparison />

        <section
          id="experience-preview"
          className="border-b border-navy/8 bg-gradient-to-b from-sky/5 to-off-white py-16"
          aria-labelledby="demo-preview-title"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="grid items-center gap-8 lg:grid-cols-2">
              <div>
                <h2
                  id="demo-preview-title"
                  className="font-display text-2xl font-bold text-navy sm:text-3xl"
                >
                  OpenFeed
                </h2>
                <p className="mt-3 max-w-lg text-navy/70">
                  {language === "es"
                    ? "Explora un feed social simulado a pantalla completa. Comparte, comenta y practica verificación en el momento."
                    : "Explore a full-screen simulated social feed. Share, comment, and practice verification in the moment."}
                </p>
                <Link
                  to="/demo"
                  className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-teal px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal/90"
                >
                  {language === "es"
                    ? "Abrir la demo interactiva"
                    : "Launch the interactive demo"}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>
              <div
                className="overflow-hidden rounded-2xl border border-navy/10 bg-white shadow-lg"
                aria-hidden
              >
                <div className="flex items-center gap-2 border-b border-navy/8 bg-navy/[0.03] px-3 py-2">
                  <span className="h-2 w-2 rounded-full bg-navy/20" />
                  <span className="h-2 w-2 rounded-full bg-navy/20" />
                  <span className="h-2 w-2 rounded-full bg-navy/20" />
                  <span className="ml-2 text-xs text-navy/45">openfeed.demo</span>
                </div>
                <div className="space-y-3 bg-off-white p-4">
                  <div className="h-16 rounded-xl bg-white shadow-sm" />
                  <div className="h-28 rounded-xl bg-white shadow-sm" />
                  <div className="h-20 rounded-xl bg-white/80 shadow-sm" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-navy/8 py-12">
          <div className="mx-auto flex max-w-6xl flex-wrap gap-3 px-4 sm:px-6">
            <Link
              to="/practice"
              className="inline-flex min-h-11 items-center rounded-xl border border-navy/15 bg-white px-4 text-sm font-semibold text-navy hover:bg-navy/5"
            >
              {language === "es" ? "Modo de práctica" : "Practice mode"}
            </Link>
            <Link
              to="/integration"
              className="inline-flex min-h-11 items-center rounded-xl border border-navy/15 bg-white px-4 text-sm font-semibold text-navy hover:bg-navy/5"
            >
              {language === "es" ? "Integración" : "Integration"}
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex min-h-11 items-center rounded-xl border border-navy/15 bg-white px-4 text-sm font-semibold text-navy hover:bg-navy/5"
            >
              {language === "es" ? "Resultados" : "Results"}
            </Link>
          </div>
        </section>

        <div id="integration">
          <IntegrationDemo />
        </div>
        <ImpactSection />
      </main>
      <Footer />
    </div>
  );
}
