import { useMemo, useState } from "react";
import { Heart, Trash2 } from "lucide-react";
import { useDemoSession } from "../../context/DemoSessionContext";
import { useI18n } from "../../i18n/I18nContext";
import { OpenFeedCommentComposer } from "./OpenFeedCommentComposer";

interface Props {
  postId: string;
}

export function OpenFeedComments({ postId }: Props) {
  const {
    comments,
    commentSort,
    setCommentSort,
    likeComment,
    deleteComment,
  } = useDemoSession();
  const { language } = useI18n();
  const [replyTo, setReplyTo] = useState<string | undefined>();

  const list = useMemo(() => {
    const items = [...(comments[postId] ?? [])];
    if (commentSort === "featured") {
      items.sort((a, b) => b.likes - a.likes);
    } else {
      items.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    }
    return items;
  }, [comments, postId, commentSort]);

  const roots = list.filter((c) => !c.parentId);
  const repliesOf = (id: string) => list.filter((c) => c.parentId === id);

  return (
    <section className="border-t border-navy/8 px-4 py-3" aria-label="Comments">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-navy">
          {language === "es" ? "Comentarios" : "Comments"} · {list.length}
        </p>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setCommentSort("featured")}
            className={`min-h-11 rounded-lg px-2 text-xs font-semibold ${
              commentSort === "featured"
                ? "bg-teal/10 text-teal"
                : "text-navy/50"
            }`}
          >
            {language === "es" ? "Destacados" : "Featured"}
          </button>
          <button
            type="button"
            onClick={() => setCommentSort("recent")}
            className={`min-h-11 rounded-lg px-2 text-xs font-semibold ${
              commentSort === "recent"
                ? "bg-teal/10 text-teal"
                : "text-navy/50"
            }`}
          >
            {language === "es" ? "Recientes" : "Recent"}
          </button>
        </div>
      </div>

      <OpenFeedCommentComposer
        postId={postId}
        parentId={replyTo}
        onPosted={() => setReplyTo(undefined)}
        placeholder={
          replyTo
            ? language === "es"
              ? "Escribe una respuesta…"
              : "Write a reply…"
            : language === "es"
              ? "Añade un comentario…"
              : "Add a comment…"
        }
      />

      <ul className="mt-4 space-y-3">
        {roots.map((c) => (
          <li key={c.id} className="rounded-xl bg-off-white/80 p-3">
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-semibold text-navy">{c.author}</span>
              <span className="text-xs text-navy/40">{c.handle}</span>
            </div>
            <p className="mt-1 text-sm text-navy/80">{c.body[language]}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => likeComment(postId, c.id)}
                className="inline-flex min-h-11 items-center gap-1 rounded-lg px-2 text-xs font-medium text-navy/60 hover:bg-white"
              >
                <Heart className="h-3.5 w-3.5" aria-hidden />
                {c.likes}
              </button>
              <button
                type="button"
                onClick={() => setReplyTo(c.id)}
                className="inline-flex min-h-11 items-center rounded-lg px-2 text-xs font-medium text-navy/60 hover:bg-white"
              >
                {language === "es" ? "Responder" : "Reply"}
              </button>
              {c.isOwn && (
                <button
                  type="button"
                  onClick={() => deleteComment(postId, c.id)}
                  className="inline-flex min-h-11 items-center gap-1 rounded-lg px-2 text-xs font-medium text-navy/50 hover:bg-white"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden />
                  {language === "es" ? "Eliminar" : "Delete"}
                </button>
              )}
            </div>
            {repliesOf(c.id).length > 0 && (
              <ul className="mt-2 space-y-2 border-l border-navy/10 pl-3">
                {repliesOf(c.id).map((r) => (
                  <li key={r.id}>
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-semibold text-navy">
                        {r.author}
                      </span>
                      <span className="text-xs text-navy/40">{r.handle}</span>
                    </div>
                    <p className="mt-1 text-sm text-navy/80">
                      {r.body[language]}
                    </p>
                    <div className="mt-1 flex gap-2">
                      <button
                        type="button"
                        onClick={() => likeComment(postId, r.id)}
                        className="inline-flex min-h-11 items-center gap-1 rounded-lg px-2 text-xs text-navy/60"
                      >
                        <Heart className="h-3.5 w-3.5" aria-hidden />
                        {r.likes}
                      </button>
                      {r.isOwn && (
                        <button
                          type="button"
                          onClick={() => deleteComment(postId, r.id)}
                          className="inline-flex min-h-11 items-center rounded-lg px-2 text-xs text-navy/50"
                        >
                          {language === "es" ? "Eliminar" : "Delete"}
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
