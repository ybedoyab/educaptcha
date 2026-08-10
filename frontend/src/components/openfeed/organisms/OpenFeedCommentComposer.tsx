import { useEffect, useState } from "react";
import { useDemoSession } from "../../../context/DemoSessionContext";
import { useI18n } from "../../../i18n/I18nContext";
import type { ActionDecision } from "../../../lib/LearningTriggerEngine";
import { isPromise } from "../../../lib/risk/riskSource";
import { FeedAvatar } from "../atoms/FeedAvatar";
import { OPEN_FEED_IDS, OPEN_FEED_KEYS } from "../openFeed.constants";

interface OpenFeedCommentComposerProps {
  postId: string;
  parentId?: string;
  onPosted?: () => void;
  placeholder: string;
}

export function OpenFeedCommentComposer({
  postId,
  parentId,
  onPosted,
  placeholder,
}: OpenFeedCommentComposerProps) {
  const {
    requestComment,
    draftComment,
    resolvePendingIntent,
    riskInteractionLocked,
  } = useDemoSession();
  const { copy } = useI18n();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const submitLocked = busy || riskInteractionLocked;
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
    if (submitLocked) return;
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
    <div
      className="border-b border-social-border px-4 py-3"
      aria-busy={busy || undefined}
    >
      {isRootDraft ? (
        <p className="mb-2 text-sm text-amber" role="status">
          {copy.experience.draftPreserved}
        </p>
      ) : null}
      <div className="flex gap-3">
        <FeedAvatar author={copy.experience.you} hue={205} />
        <div className="min-w-0 flex-1">
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
            className="min-h-11 w-full border-0 bg-white px-0 text-[17px] text-social-text outline-none placeholder:text-social-muted focus:ring-0"
          />
          <div className="mt-2 flex items-center justify-end gap-2 border-t border-social-border pt-2">
            {isRootDraft ? (
              <button
                type="button"
                onClick={() => resolvePendingIntent("cancel")}
                className="min-h-11 rounded-full px-4 text-sm font-bold text-social-muted hover:bg-social-surface"
              >
                {copy.experience.discard}
              </button>
            ) : null}
            <button
              type="button"
              onClick={submit}
              disabled={submitLocked}
              aria-disabled={submitLocked || !text.trim() || undefined}
              className="min-h-11 rounded-full bg-social-blue px-5 text-sm font-bold text-white transition enabled:hover:bg-social-blue/90 aria-disabled:opacity-50 disabled:opacity-50"
            >
              {copy.experience.publish}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
