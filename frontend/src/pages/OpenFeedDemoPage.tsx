import {
  DemoSessionProvider,
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
  DemoIntro,
  RiskCheckStatus,
  ScenarioBootstrap,
  Toast,
  TransferHighlighter,
} from "../features/social-demo";

function OpenFeedShell() {
  const { copy } = useI18n();
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
      <DemoIntro title={copy.experience.introTitle} />
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
