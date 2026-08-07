import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { DemoSessionProvider, useDemoSession } from "../context/DemoSessionContext";
import { OpenFeedHeader } from "../components/openfeed/OpenFeedHeader";
import { OpenFeedSidebar } from "../components/openfeed/OpenFeedSidebar";
import { OpenFeedFeed } from "../components/openfeed/OpenFeedFeed";
import { OpenFeedTrends } from "../components/openfeed/OpenFeedTrends";
import { OpenFeedPostDetail } from "../components/openfeed/OpenFeedPostDetail";
import { OpenFeedChallengeDialog } from "../components/openfeed/OpenFeedChallengeDialog";
import { openFeedPosts } from "../data/openFeedPosts";
import { useI18n } from "../i18n/I18nContext";

function ScenarioBootstrap() {
  const { scenarioId } = useParams();
  const { tryAction, setToast } = useDemoSession();
  const { language } = useI18n();

  useEffect(() => {
    if (!scenarioId) return;
    const post = openFeedPosts.find((p) => p.scenarioId === scenarioId);
    if (!post) {
      setToast(
        language === "es"
          ? "Escenario no encontrado — mostrando el feed completo."
          : "Scenario not found — showing the full feed.",
      );
      return;
    }
    const el = document.getElementById(`post-${post.id}`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    // Soft-highlight: trigger via verify-link once user is ready is better;
    // auto-open after a short delay for deep links.
    const t = window.setTimeout(() => {
      tryAction("verify-link", post, `share-${post.id}`);
    }, 600);
    return () => window.clearTimeout(t);
  }, [scenarioId, tryAction, setToast, language]);

  return null;
}

function Toast() {
  const { toast, setToast } = useDemoSession();
  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(t);
  }, [toast, setToast]);
  if (!toast) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-1/2 z-[90] -translate-x-1/2 rounded-xl bg-navy px-4 py-2 text-sm font-medium text-white shadow-lg"
    >
      {toast}
    </div>
  );
}

function OpenFeedShell() {
  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-off-white">
      <OpenFeedHeader />
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <OpenFeedSidebar />
        <OpenFeedFeed />
        <OpenFeedTrends />
      </div>
      <OpenFeedPostDetail />
      <OpenFeedChallengeDialog />
      <ScenarioBootstrap />
      <Toast />
    </div>
  );
}

export function OpenFeedDemoPage() {
  return (
    <DemoSessionProvider>
      <OpenFeedShell />
    </DemoSessionProvider>
  );
}
