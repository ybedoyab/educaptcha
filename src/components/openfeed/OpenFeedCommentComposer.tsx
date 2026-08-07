import { useEffect, useState } from "react";
import { useDemoSession } from "../../context/DemoSessionContext";
import { useI18n } from "../../i18n/I18nContext";
import type { ActionDecision } from "../../lib/LearningTriggerEngine";
import { isPromise } from "../../lib/risk/riskSource";

interface Props {
  postId: string;
  parentId?: string;
  onPosted?: () => void;
  placeholder?: string;
}

export function OpenFeedCommentComposer({
  postId,
  parentId,
  onPosted,
  placeholder,
}: Props) {
  const { requestComment, draftComment, resolvePendingIntent } =
    useDemoSession();
  const { language } = useI18n();
  const [text, setText] = useState("");

  useEffect(() => {
    if (draftComment?.postId === postId && !parentId) {
      setText(draftComment.body);
    }
  }, [draftComment, postId, parentId]);

  // Set only while an external risk check is in flight. Never true when the
  // service is unconfigured, so the local path renders exactly as before.
  const [busy, setBusy] = useState(false);

  const finish = (
    decision: ActionDecision | null,
    submittedBody: string,
  ) => {
    // Only an explicit "continue" means the comment was published. On intercept
    // — or null — the draft is deliberately preserved.
    if (!decision || decision.type !== "continue") return;
    // Don't swallow characters typed while the request was in flight.
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
      `comment-${postId}`,
    );

    if (!isPromise(decision)) {
      finish(decision, body);
      return;
    }
    setBusy(true);
    void decision
      .then((d) => finish(d, body))
      .finally(() => setBusy(false));
  };

  return (
    <div className="space-y-2" aria-busy={busy}>
      {draftComment?.postId === postId && !parentId && (
        <p className="text-xs text-amber" role="status">
          {language === "es"
            ? "Tu borrador se conservó. Puedes editarlo o publicarlo."
            : "Your draft was preserved. You can edit or publish it."}
        </p>
      )}
      <div className="flex flex-col gap-2 sm:flex-row">
        <label
          className="sr-only"
          htmlFor={`composer-${postId}-${parentId ?? "root"}`}
        >
          {placeholder}
        </label>
        <input
          id={`composer-${postId}-${parentId ?? "root"}`}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
          placeholder={placeholder}
          className="min-h-11 flex-1 rounded-xl border border-navy/10 bg-white px-3 text-sm outline-none ring-teal focus:ring-2"
        />
        <button
          type="button"
          onClick={submit}
          // aria-disabled rather than disabled: disabling a focused button
          // strands focus on <body>. The `busy` early-return in submit() is
          // what actually prevents a double post.
          aria-disabled={busy}
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-navy px-4 text-sm font-semibold text-white"
        >
          {language === "es" ? "Publicar" : "Post"}
        </button>
        {draftComment?.postId === postId && !parentId && (
          <button
            type="button"
            onClick={() => resolvePendingIntent("cancel")}
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-navy/15 px-3 text-sm font-semibold text-navy/60"
          >
            {language === "es" ? "Descartar" : "Discard"}
          </button>
        )}
      </div>
    </div>
  );
}
