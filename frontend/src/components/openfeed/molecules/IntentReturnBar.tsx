import type { PendingIntent } from "../../../lib/demoFlow";
import { useDemoSession } from "../../../context/DemoSessionContext";
import { useI18n } from "../../../i18n/I18nContext";

interface ReturnActionsProps {
  intent: PendingIntent;
}

function CommentReturnActions({ intent }: ReturnActionsProps) {
  const { resolvePendingIntent } = useDemoSession();
  const { copy } = useI18n();
  if (intent.type !== "comment") return null;

  return (
    <div className="mt-3 rounded-2xl border border-amber/30 bg-amber/10 p-3" role="region">
      <p className="text-sm font-bold text-social-text">
        {copy.experience.returnCommentTitle}
      </p>
      <p className="mt-1 text-sm text-social-muted">“{intent.body}”</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          data-primary-cta="true"
          onClick={() => resolvePendingIntent("edit")}
          className="min-h-11 rounded-full bg-social-blue px-4 text-sm font-bold text-white hover:bg-social-blue/90"
        >
          {copy.experience.editComment}
        </button>
        <button
          type="button"
          onClick={() => resolvePendingIntent("confirm")}
          className="min-h-11 rounded-full border border-social-border bg-white px-4 text-sm font-bold text-social-text hover:bg-social-surface"
        >
          {copy.experience.publishAnyway}
        </button>
      </div>
    </div>
  );
}

function RepostReturnActions({ intent }: ReturnActionsProps) {
  const { resolvePendingIntent } = useDemoSession();
  const { copy } = useI18n();
  const isRepost = intent.type === "share" || intent.type === "repost-image";
  if (!isRepost) return null;

  return (
    <div className="mt-3 rounded-2xl border border-social-blue/25 bg-social-blue/5 p-3" role="region">
      <p className="text-sm font-bold text-social-text">
        {copy.experience.returnShareTitle}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          data-primary-cta="true"
          onClick={() => resolvePendingIntent("open-source")}
          className="min-h-11 rounded-full bg-social-blue px-4 text-sm font-bold text-white hover:bg-social-blue/90"
        >
          {copy.experience.cancelCheckSource}
        </button>
        <button
          type="button"
          onClick={() => resolvePendingIntent("confirm")}
          className="min-h-11 rounded-full border border-social-border bg-white px-4 text-sm font-bold text-social-text hover:bg-social-surface"
        >
          {copy.experience.shareAnyway}
        </button>
      </div>
    </div>
  );
}

export function IntentReturnBar() {
  const { flow } = useDemoSession();
  if (flow.status !== "return-to-context") return null;

  return flow.intent.type === "comment" ? (
    <CommentReturnActions intent={flow.intent} />
  ) : (
    <RepostReturnActions intent={flow.intent} />
  );
}
