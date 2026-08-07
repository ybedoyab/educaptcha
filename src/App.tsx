import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { I18nProvider, useI18n } from "./i18n/I18nContext";
import { LandingPage } from "./pages/LandingPage";
import { OpenFeedDemoPage } from "./pages/OpenFeedDemoPage";
import { PracticePage } from "./pages/PracticePage";
import { DashboardPage } from "./pages/DashboardPage";
import { IntegrationPage } from "./pages/IntegrationPage";
import { TestSessionPage } from "./pages/TestSessionPage";

function LangSync() {
  const { language } = useI18n();
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);
  return null;
}

function AppRoutes() {
  return (
    <>
      <LangSync />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/demo" element={<OpenFeedDemoPage />} />
        <Route path="/demo/scenario/:scenarioId" element={<OpenFeedDemoPage />} />
        <Route path="/demo/test-session" element={<TestSessionPage />} />
        <Route path="/practice" element={<PracticePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/integration" element={<IntegrationPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </I18nProvider>
  );
}
