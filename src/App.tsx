import { useCallback, useEffect, useState } from "react";
import { AnalyticsDashboard } from "./components/AnalyticsDashboard";
import { Comparison } from "./components/Comparison";
import { DemoSection } from "./components/DemoSection";
import { Footer } from "./components/Footer";
import { Hero } from "./components/Hero";
import { HowItWorks } from "./components/HowItWorks";
import { ImpactSection } from "./components/ImpactSection";
import { IntegrationDemo } from "./components/IntegrationDemo";
import { Navbar } from "./components/Navbar";
import { RealWorldExperience } from "./components/experience/RealWorldExperience";
import { useDemoProgress } from "./hooks/useDemoProgress";
import { useLearningSession } from "./hooks/useLearningSession";
import { I18nProvider, useI18n } from "./i18n/I18nContext";
import type { SectionId } from "./types";

const SECTION_IDS: SectionId[] = [
  "home",
  "experience",
  "demo",
  "integration",
  "impact",
  "results",
];

function AppShell() {
  const { language } = useI18n();
  const progressApi = useDemoProgress();
  const learningApi = useLearningSession();
  const [active, setActive] = useState<SectionId>("home");

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const navigate = useCallback((id: SectionId) => {
    setActive(id);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    } else if (id === "home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) {
          setActive(visible.target.id as SectionId);
        }
      },
      { rootMargin: "-20% 0px -55% 0px", threshold: [0.1, 0.3, 0.5] },
    );

    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleReset = () => {
    progressApi.reset();
    learningApi.resetLearning();
  };

  return (
    <div className="min-h-screen">
      <Navbar active={active} onNavigate={navigate} onReset={handleReset} />
      <main>
        <Hero onNavigate={navigate} />
        <HowItWorks />
        <Comparison />
        <RealWorldExperience onNavigate={navigate} learningApi={learningApi} />
        <DemoSection onNavigate={navigate} progressApi={progressApi} />
        <IntegrationDemo onNavigate={navigate} />
        <ImpactSection />
        <AnalyticsDashboard latestSession={learningApi.latestSession} />
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <AppShell />
    </I18nProvider>
  );
}
