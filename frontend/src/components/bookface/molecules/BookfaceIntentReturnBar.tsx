import type { PendingIntent } from "../../../lib/demoFlow";
import { useDemoSession } from "../../../context/DemoSessionContext";
import { useI18n } from "../../../i18n/I18nContext";
import {
  misleadingShareDetail,
  misleadingShareTitle,
} from "../../../lib/misleadingShareCopy";
import { Share2, TriangleAlert, X } from "lucide-react";

const PRIMARY_CLASS =
  "inline-flex min-h-11 items-center gap-2 rounded-lg bg-bf-blue px-4 text-[15px] font-semibold text-white transition-colors hover:bg-bf-blue/90";
const SECONDARY_CLASS =
  "inline-flex min-h-11 items-center gap-2 rounded-lg bg-bf-chip px-4 text-[15px] font-semibold text-bf-text transition-colors hover:bg-bf-border";

interface ReturnActionsProps {
  intent: PendingIntent;
}

function CommentReturnActions({ intent }: ReturnActionsProps) {
  const { resolvePendingIntent } = useDemoSession();
  const { copy } = useI18n();
  if (intent.type !== "comment") return null;

  return (
    <div className="mx-4 mb-3 rounded-lg border border-amber/40 bg-amber/10 p-3" role="region">
      <p className="text-[15px] font-semibold text-bf-text">
        {copy.experience.bfReturnCommentTitle}
      </p>
      <p className="mt-1 text-[15px] text-bf-muted">“{intent.body}”</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          data-primary-cta="true"
          onClick={() => resolvePendingIntent("edit")}
          className={PRIMARY_CLASS}
        >
          {copy.experience.bfEditComment}
        </button>
        <button
          type="button"
          onClick={() => resolvePendingIntent("confirm")}
          className={SECONDARY_CLASS}
        >
          {copy.experience.bfCommentAnyway}
        </button>
      </div>
    </div>
  );
}

function ShareReturnActions({ intent }: ReturnActionsProps) {
  const { resolvePendingIntent, flow } = useDemoSession();
  const { copy } = useI18n();
  const isShare = intent.type === "share" || intent.type === "repost-image";
  if (!isShare) return null;

  const skill = flow.status === "return-to-context" ? flow.skill : undefined;
  const title = misleadingShareTitle(skill, {
    default: copy.experience.bfReturnShareTitle,
    context: copy.experience.bfReturnShareTitleContext,
    chart: copy.experience.bfReturnShareTitleChart,
    photoClaim: copy.experience.bfReturnShareTitlePhotoClaim,
    pressure: copy.experience.bfReturnShareTitlePressure,
  });
  const detail = misleadingShareDetail(skill, {
    default: copy.experience.bfReturnShareDetail,
    chart: copy.experience.bfReturnShareDetailChart,
    photoClaim: copy.experience.bfReturnShareDetailPhotoClaim,
    context: copy.experience.bfReturnShareDetailContext,
    pressure: copy.experience.bfReturnShareDetailPressure,
  });

  return (
    <div
      className="mx-4 mb-3 rounded-lg border border-amber/45 bg-amber/10 p-3"
      role="region"
      aria-label={title}
    >
      <p className="flex items-start gap-2 text-[15px] font-semibold text-[#92400e]">
        <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        <span>{title}</span>
      </p>
      <p className="mt-1 pl-6 text-[14px] text-bf-muted">{detail}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          data-primary-cta="true"
          onClick={() => resolvePendingIntent("open-source")}
          className={PRIMARY_CLASS}
        >
          <X className="h-4 w-4" aria-hidden />
          {copy.experience.cancelShare}
        </button>
        <button
          type="button"
          onClick={() => resolvePendingIntent("confirm")}
          className={SECONDARY_CLASS}
        >
          <Share2 className="h-4 w-4" aria-hidden />
          {copy.experience.bfShareAnyway}
        </button>
      </div>
    </div>
  );
}

/**
 * Shown inside the post the user acted on once the challenge is done. Mirrors
 * the Y skin's bar — the flow states are identical, only the wording ("share"
 * rather than "repost") and the card styling differ.
 */
export function BookfaceIntentReturnBar() {
  const { flow } = useDemoSession();
  if (flow.status !== "return-to-context") return null;

  return flow.intent.type === "comment" ? (
    <CommentReturnActions intent={flow.intent} />
  ) : (
    <ShareReturnActions intent={flow.intent} />
  );
}
