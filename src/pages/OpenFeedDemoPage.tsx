import { useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  DemoSessionProvider,
  useDemoSession,
} from "../context/DemoSessionContext";
import { OpenFeedHeader } from "../components/openfeed/organisms/OpenFeedHeader";
import { OpenFeedSidebar } from "../components/openfeed/organisms/OpenFeedSidebar";
import { OpenFeedMobileNav } from "../components/openfeed/organisms/OpenFeedMobileNav";
import { OpenFeedFeed } from "../components/openfeed/organisms/OpenFeedFeed";
import { OpenFeedTrends } from "../components/openfeed/organisms/OpenFeedTrends";
import { OpenFeedPostDetail } from "../components/openfeed/organisms/OpenFeedPostDetail";
import { OpenFeedChallengeDialog } from "../components/openfeed/OpenFeedChallengeDialog";
import { useI18n } from "../i18n/I18nContext";
import {
  OPEN_FEED_IDS,
  OPEN_FEED_TIMINGS,
} from "../components/openfeed/openFeed.constants";

function DemoIntro() {
  const { introSeen, setIntroSeen } = useDemoSession();
  const { copy } = useI18n();

  if (introSeen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-social-text/45 p-3 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="intro-title"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <h2 id="intro-title" className="text-xl font-extrabold text-social-text">
          {copy.experience.introTitle}
        </h2>
        <div className="mt-5 flex justify-end">
          <button
            type="button"
            data-primary-cta="true"
            onClick={() => setIntroSeen(true)}
            className="inline-flex min-h-11 items-center rounded-full bg-social-blue px-5 text-sm font-bold text-white hover:bg-social-blue/90"
          >
            {copy.experience.startBrowsing}
          </button>
        </div>
      </div>
    </div>
  );
}

function ScenarioBootstrap() {
  const { scenarioId } = useParams();
  const { launchScenario, scenarioGuide } = useDemoSession();
  const { language } = useI18n();

  useEffect(() => {
    if (!scenarioId) return;
    const post = launchScenario(scenarioId);
    if (!post) return;
    const t = window.setTimeout(() => {
      document
        .getElementById(OPEN_FEED_IDS.post(post.id))
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, OPEN_FEED_TIMINGS.scenarioScrollMs);
    return () => window.clearTimeout(t);
  }, [scenarioId, launchScenario]);

  if (!scenarioGuide) return null;
  return (
    <div
      className="shrink-0 border-b border-social-blue/20 bg-social-blue/10 px-4 py-2 text-center text-sm font-bold text-social-text"
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
    const t = window.setTimeout(
      () => setToast(null),
      OPEN_FEED_TIMINGS.toastMs,
    );
    return () => window.clearTimeout(t);
  }, [toast, setToast]);
  if (!toast) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-20 left-1/2 z-[90] -translate-x-1/2 rounded-full bg-social-text px-5 py-3 text-sm font-bold text-white shadow-xl md:bottom-4"
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
        .getElementById(OPEN_FEED_IDS.post(id))
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, OPEN_FEED_TIMINGS.transferScrollMs);
    return () => window.clearTimeout(t);
  }, [flow]);
  return null;
}

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
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-white text-social-text">
      <OpenFeedHeader />
      <ScenarioBootstrap />
      <div className="mx-auto flex min-h-0 w-full max-w-[1265px] flex-1">
        <OpenFeedSidebar />
        <OpenFeedFeed />
        <OpenFeedTrends />
      </div>
      <OpenFeedMobileNav />
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
