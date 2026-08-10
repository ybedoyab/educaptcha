import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDemoSession } from "../demo-session";
import { useI18n } from "../../i18n/I18nContext";
import {
  OPEN_FEED_IDS,
  OPEN_FEED_TIMINGS,
} from "../../components/openfeed/openFeed.constants";

type ScenarioBootstrapProps = {
  className?: string;
};

export function ScenarioBootstrap({
  className = "shrink-0 border-b border-social-blue/20 bg-social-blue/10 px-4 py-2 text-center text-sm font-bold text-social-text",
}: ScenarioBootstrapProps) {
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
    <div className={className} role="status">
      {scenarioGuide[language]}
    </div>
  );
}
