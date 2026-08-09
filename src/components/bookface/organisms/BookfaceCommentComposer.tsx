import { useEffect, useState } from "react";
import { Send } from "lucide-react";
import { useDemoSession } from "../../../context/DemoSessionContext";
import { useI18n } from "../../../i18n/I18nContext";
import type { ActionDecision } from "../../../lib/LearningTriggerEngine";
import { isPromise } from "../../../lib/risk/riskSource";
import { FeedAvatar } from "../../openfeed/atoms/FeedAvatar";
import {
  OPEN_FEED_IDS,
  OPEN_FEED_KEYS,
} from "../../openfeed/openFeed.constants";

interface BookfaceCommentComposerProps {
  postId: string;
  parentId?: string;
  onPosted?: () => void;
  placeholder: string;
}

export function BookfaceCommentComposer({
  postId,
  parentId,
  onPosted,
  placeholder,
}: BookfaceCommentComposerProps) {
  const { requestComment, draftComment, resolvePendingIntent } =
    useDemoSession();
  const { copy } = useI18n();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const isRootDraft = draftComment?.postId === postId && !parentId;
  const composerId = OPEN_FEED_IDS.composer(postId, parentId);

  useEffect(() => {
    if (!isRootDraft || !draftComment) return;
    setText(draftComment.body);
  }, [draftComment, isRootDraft]);

  const finish = (decision: ActionDecision | null, submittedBody: string) => {
    if (!decision || decision.type !== "continue") return;
    if (text.trim() === submittedBody) setText("");
    onPosted?.();
  };

  const submit = () => {
    if (busy) return;
    const body = text.trim();
    if (!body) return;

    const decision = requestComment(
      postId,
      body,
      parentId,
      OPEN_FEED_IDS.comment(postId),
    );

    if (!isPromise(decision)) {
      finish(decision, body);
      return;
    }

    setBusy(true);
    void decision
      .then((result) => finish(result, body))
      .finally(() => setBusy(false));
  };

  return (
    <div className="px-4 py-2" aria-busy={busy}>
      {isRootDraft ? (
        <p className="mb-2 text-[13px] font-medium text-amber" role="status">
          {copy.experience.draftPreserved}
        </p>
      ) : null}
      <div className="flex items-center gap-2">
        <FeedAvatar author={copy.experience.you} hue={205} size="sm" />
        <div className="flex min-w-0 flex-1 items-center gap-1 rounded-full bg-bf-chip pl-3 pr-1">
          <label className="sr-only" htmlFor={composerId}>
            {placeholder}
          </label>
          <input
            id={composerId}
            value={text}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === OPEN_FEED_KEYS.enter) submit();
            }}
            placeholder={placeholder}
            className="min-h-11 min-w-0 flex-1 bg-transparent text-[15px] text-bf-text outline-none placeholder:text-bf-muted"
          />
          <button
            type="button"
            onClick={submit}
            aria-disabled={busy || !text.trim()}
            aria-label={copy.experience.bfPostComment}
            className="grid min-h-11 min-w-11 place-items-center rounded-full text-bf-blue transition-colors hover:bg-bf-border aria-disabled:opacity-40"
          >
            <Send className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>
      {isRootDraft ? (
        <div className="mt-2 flex justify-end">
          <button
            type="button"
            onClick={() => resolvePendingIntent("cancel")}
            className="min-h-11 rounded-lg px-3 text-[15px] font-semibold text-bf-muted hover:bg-bf-hover"
          >
            {copy.experience.discard}
          </button>
        </div>
      ) : null}
    </div>
  );
}
