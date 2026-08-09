import { useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  DemoSessionProvider,
  useDemoSession,
} from "../context/DemoSessionContext";
// The challenge overlay is EduCAPTCHA's own surface, not the network's, so both
// skins render the same one.
import { OpenFeedChallengeDialog } from "../components/openfeed/OpenFeedChallengeDialog";
import {
  OPEN_FEED_IDS,
  OPEN_FEED_TIMINGS,
} from "../components/openfeed/openFeed.constants";
import { BOOKFACE_MESSAGES } from "../components/bookface/bookface.constants";
import { BookfaceFeed } from "../components/bookface/organisms/BookfaceFeed";
import { BookfaceHeader } from "../components/bookface/organisms/BookfaceHeader";
import { BookfaceLeftRail } from "../components/bookface/organisms/BookfaceLeftRail";
import { BookfacePostDetail } from "../components/bookface/organisms/BookfacePostDetail";
import { BookfaceRightRail } from "../components/bookface/organisms/BookfaceRightRail";
import { useI18n } from "../i18n/I18nContext";

function DemoIntro() {
  const { introSeen, setIntroSeen } = useDemoSession();
  const { copy } = useI18n();

  if (introSeen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 p-3 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="bookface-intro-title"
    >
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-2xl">
        <h2
          id="bookface-intro-title"
          className="text-xl font-bold text-bf-text"
        >
          {copy.experience.bfIntroTitle}
        </h2>
        <div className="mt-5 flex justify-end">
          <button
            type="button"
            data-primary-cta="true"
            onClick={() => setIntroSeen(true)}
            className="inline-flex min-h-11 items-center rounded-lg bg-bf-blue px-5 text-[15px] font-semibold text-white hover:bg-bf-blue/90"
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
    const timer = window.setTimeout(() => {
      document
        .getElementById(OPEN_FEED_IDS.post(post.id))
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, OPEN_FEED_TIMINGS.scenarioScrollMs);
    return () => window.clearTimeout(timer);
  }, [scenarioId, launchScenario]);

  if (!scenarioGuide) return null;
  return (
    <div
      className="shrink-0 border-b border-bf-blue/25 bg-bf-blue/10 px-4 py-2 text-center text-[15px] font-semibold text-bf-text"
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
    const timer = window.setTimeout(
      () => setToast(null),
      OPEN_FEED_TIMINGS.toastMs,
    );
    return () => window.clearTimeout(timer);
  }, [toast, setToast]);

  if (!toast) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-1/2 z-[90] -translate-x-1/2 rounded-lg bg-bf-text px-5 py-3 text-[15px] font-semibold text-white shadow-xl"
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
    const timer = window.setTimeout(() => {
      document
        .getElementById(OPEN_FEED_IDS.post(id))
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, OPEN_FEED_TIMINGS.transferScrollMs);
    return () => window.clearTimeout(timer);
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

function BookfaceShell() {
  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-bf-bg text-bf-text">
      <BookfaceHeader />
      <ScenarioBootstrap />
      {/* Full width, not a centred container: the rails pin to the viewport
          edges and the feed column centres between them. */}
      <div className="flex min-h-0 w-full flex-1">
        <BookfaceLeftRail />
        <BookfaceFeed />
        <BookfaceRightRail />
      </div>
      <BookfacePostDetail />
      <OpenFeedChallengeDialog />
      <DemoIntro />
      <TransferHighlighter />
      <RiskCheckStatus />
      <Toast />
    </div>
  );
}

/**
 * Second demo surface: the same feed data and the same intercept pipeline as
 * `/demo`, wearing a Facebook-style layout instead of the X-style one. Proves
 * the EduCAPTCHA layer is host-agnostic.
 */
export function BookfaceDemoPage() {
  return (
    <DemoSessionProvider messages={BOOKFACE_MESSAGES}>
      <BookfaceShell />
    </DemoSessionProvider>
  );
}
