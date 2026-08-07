import { useDemoSession } from "../../context/DemoSessionContext";
import { useI18n } from "../../i18n/I18nContext";

export function IntentReturnBar() {
  const { flow, resolvePendingIntent } = useDemoSession();
  const { language } = useI18n();

  if (flow.status !== "return-to-context") return null;

  const intent = flow.intent;

  if (intent.type === "comment") {
    return (
      <div
        className="mt-3 rounded-xl border border-amber/30 bg-amber/10 p-3"
        role="region"
      >
        <p className="text-sm font-medium text-navy">
          {language === "es"
            ? "Estabas a punto de publicar este comentario."
            : "You were about to post this comment."}
        </p>
        <p className="mt-1 text-sm text-navy/70">“{intent.body}”</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            data-primary-cta="true"
            onClick={() => resolvePendingIntent("edit")}
            className="inline-flex min-h-11 items-center rounded-xl bg-teal px-3 text-sm font-semibold text-white"
          >
            {language === "es" ? "Editar comentario" : "Edit comment"}
          </button>
          <button
            type="button"
            onClick={() => resolvePendingIntent("confirm")}
            className="inline-flex min-h-11 items-center rounded-xl border border-navy/15 bg-white px-3 text-sm font-semibold"
          >
            {language === "es" ? "Publicar de todos modos" : "Publish anyway"}
          </button>
        </div>
      </div>
    );
  }

  if (intent.type === "share" || intent.type === "repost-image") {
    return (
      <div
        className="mt-3 rounded-xl border border-teal/25 bg-teal/5 p-3"
        role="region"
      >
        <p className="text-sm font-medium text-navy">
          {language === "es"
            ? "Estabas a punto de compartir esta publicación."
            : "You were about to share this post."}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            data-primary-cta="true"
            onClick={() => resolvePendingIntent("open-source")}
            className="inline-flex min-h-11 items-center rounded-xl bg-teal px-3 text-sm font-semibold text-white"
          >
            {language === "es"
              ? "Cancelar y revisar fuente"
              : "Cancel & check source"}
          </button>
          <button
            type="button"
            onClick={() => resolvePendingIntent("confirm")}
            className="inline-flex min-h-11 items-center rounded-xl border border-navy/15 bg-white px-3 text-sm font-semibold"
          >
            {language === "es" ? "Compartir de todos modos" : "Share anyway"}
          </button>
        </div>
      </div>
    );
  }

  return null;
}
