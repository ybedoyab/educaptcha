import { useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  DemoSessionProvider,
  useDemoSession,
} from "../context/DemoSessionContext";
import { OpenFeedHeader } from "../components/openfeed/OpenFeedHeader";
import { OpenFeedSidebar } from "../components/openfeed/OpenFeedSidebar";
import { OpenFeedFeed } from "../components/openfeed/OpenFeedFeed";
import { OpenFeedTrends } from "../components/openfeed/OpenFeedTrends";
import { OpenFeedPostDetail } from "../components/openfeed/OpenFeedPostDetail";
import { OpenFeedChallengeDialog } from "../components/openfeed/OpenFeedChallengeDialog";
import { useI18n } from "../i18n/I18nContext";

function DemoIntro() {
  const { introSeen, setIntroSeen } = useDemoSession();
  const { language } = useI18n();

  if (introSeen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-navy/50 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="intro-title"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
        <h2 id="intro-title" className="text-lg font-semibold text-navy">
          {language === "es"
            ? "Estás en un feed social simulado. Intenta compartir la publicación resaltada."
            : "You’re on a simulated social feed. Try sharing the highlighted post."}
        </h2>
        <div className="mt-5 flex justify-end">
          <button
            type="button"
            data-primary-cta="true"
            onClick={() => setIntroSeen(true)}
            className="inline-flex min-h-11 items-center rounded-xl bg-navy px-4 text-sm font-semibold text-white"
          >
            {language === "es" ? "Empezar" : "Start"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ScenarioBootstrap() {
  const { scenarioId } = useParams();
  const { launchScenario, setToast, scenarioGuide } = useDemoSession();
  const { language } = useI18n();

  useEffect(() => {
    if (!scenarioId) return;
    const post = launchScenario(scenarioId);
    if (!post) {
      setToast(
        language === "es"
          ? "Escenario no encontrado — mostrando el feed completo."
          : "Scenario not found — showing the full feed.",
      );
      return;
    }
    const t = window.setTimeout(() => {
      document
        .getElementById(`post-${post.id}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 120);
    return () => window.clearTimeout(t);
  }, [scenarioId, launchScenario, setToast, language]);

  if (!scenarioGuide) return null;
  return (
    <div
      className="shrink-0 border-b border-teal/20 bg-teal/10 px-4 py-2 text-center text-sm font-medium text-navy"
      role="status"
    >
      {scenarioGuide[language]}
    </div>
  );
}

function Toast() {
  const { toast, setToast } = useDemoSession();
  const { language } = useI18n();
  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(t);
  }, [toast, setToast]);
  if (!toast) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-1/2 z-[90] -translate-x-1/2 rounded-xl bg-navy px-4 py-2 text-sm font-medium text-white shadow-lg"
    >
      {toast[language]}
    </div>
  );
}

function TransferHighlighter() {
  const { flow } = useDemoSession();
  useEffect(() => {
    if (flow.status !== "transfer-pending") return;
    const id = flow.targetPostId;
    if (!id) return;
    const t = window.setTimeout(() => {
      document
        .getElementById(`post-${id}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 200);
    return () => window.clearTimeout(t);
  }, [flow]);
  return null;
}

/**
 * Screen-reader announcement while an external risk check is in flight.
 *
 * Separate from `Toast` on purpose: Toast auto-clears after 3200ms and would
 * collide with the "Shared (simulated)" message. Renders nothing visually and
 * adds no overlay, so it changes neither layout nor the axe surface.
 */
function RiskCheckStatus() {
  const { pendingActionKey } = useDemoSession();
  const { copy } = useI18n();
  return (
    <p className="sr-only" role="status">
      {pendingActionKey ? copy.experience.checking : ""}
    </p>
  );
}

function OpenFeedShell() {
  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-off-white">
      <OpenFeedHeader />
      <ScenarioBootstrap />
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <OpenFeedSidebar />
        <OpenFeedFeed />
        <OpenFeedTrends />
      </div>
      <OpenFeedPostDetail />
      <OpenFeedChallengeDialog />
      <DemoIntro />
      <TransferHighlighter />
      <RiskCheckStatus />
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
