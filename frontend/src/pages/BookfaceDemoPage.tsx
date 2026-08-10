import {
  DemoSessionProvider,
} from "../context/DemoSessionContext";
// The challenge overlay is EduCAPTCHA's own surface, not the network's, so both
// skins render the same one.
import { OpenFeedChallengeDialog } from "../components/openfeed/OpenFeedChallengeDialog";
import { BOOKFACE_MESSAGES } from "../components/bookface/bookface.constants";
import { BookfaceFeed } from "../components/bookface/organisms/BookfaceFeed";
import { BookfaceHeader } from "../components/bookface/organisms/BookfaceHeader";
import { BookfaceLeftRail } from "../components/bookface/organisms/BookfaceLeftRail";
import { BookfacePostDetail } from "../components/bookface/organisms/BookfacePostDetail";
import { BookfaceRightRail } from "../components/bookface/organisms/BookfaceRightRail";
import { useI18n } from "../i18n/I18nContext";
import {
  DemoIntro,
  RiskCheckStatus,
  ScenarioBootstrap,
  Toast,
  TransferHighlighter,
} from "../features/social-demo";

function BookfaceShell() {
  const { copy } = useI18n();
  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-bf-bg text-bf-text">
      <BookfaceHeader />
      <ScenarioBootstrap className="shrink-0 border-b border-bf-blue/25 bg-bf-blue/10 px-4 py-2 text-center text-[15px] font-semibold text-bf-text" />
      {/* Full width, not a centred container: the rails pin to the viewport
          edges and the feed column centres between them. */}
      <div className="flex min-h-0 w-full flex-1">
        <BookfaceLeftRail />
        <BookfaceFeed />
        <BookfaceRightRail />
      </div>
      <BookfacePostDetail />
      <OpenFeedChallengeDialog />
      <DemoIntro
        title={copy.experience.bfIntroTitle}
        titleId="bookface-intro-title"
        className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 p-3 sm:items-center"
        panelClassName="w-full max-w-md rounded-lg bg-white p-6 shadow-2xl"
        titleClassName="text-xl font-bold text-bf-text"
        buttonClassName="inline-flex min-h-11 items-center rounded-lg bg-bf-blue px-5 text-[15px] font-semibold text-white hover:bg-bf-blue/90"
      />
      <TransferHighlighter />
      <RiskCheckStatus />
      <Toast className="fixed bottom-4 left-1/2 z-[90] -translate-x-1/2 rounded-lg bg-bf-text px-5 py-3 text-[15px] font-semibold text-white shadow-xl" />
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
