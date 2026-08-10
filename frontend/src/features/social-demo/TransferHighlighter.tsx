import { useEffect } from "react";
import { useDemoSession } from "../demo-session";
import {
  OPEN_FEED_IDS,
  OPEN_FEED_TIMINGS,
} from "../../components/openfeed/openFeed.constants";

export function TransferHighlighter() {
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
