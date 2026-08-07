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
        aria-label={language === "es" ? "Borrador de comentario" : "Comment draft"}
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-amber">
          {language === "es" ? "Borrador conservado" : "Draft preserved"}
        </p>
        <p className="mt-1 text-sm text-navy/80">“{intent.body}”</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => resolvePendingIntent("edit")}
            className="inline-flex min-h-11 items-center rounded-xl border border-navy/15 bg-white px-3 text-sm font-semibold"
          >
            {language === "es" ? "Editar comentario" : "Edit comment"}
          </button>
          <button
            type="button"
            onClick={() => resolvePendingIntent("confirm")}
            className="inline-flex min-h-11 items-center rounded-xl bg-navy px-3 text-sm font-semibold text-white"
          >
            {language === "es" ? "Publicar de todos modos" : "Publish anyway"}
          </button>
          <button
            type="button"
            onClick={() => resolvePendingIntent("cancel")}
            className="inline-flex min-h-11 items-center rounded-xl px-3 text-sm font-semibold text-navy/60"
          >
            {language === "es" ? "Cancelar" : "Cancel"}
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
        aria-label={language === "es" ? "Acción pendiente" : "Pending action"}
      >
        <p className="text-sm font-medium text-navy">
          {language === "es"
            ? "¿Qué quieres hacer con tu acción?"
            : "What do you want to do with your action?"}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => resolvePendingIntent("confirm")}
            className="inline-flex min-h-11 items-center rounded-xl bg-navy px-3 text-sm font-semibold text-white"
          >
            {language === "es" ? "Compartir de todos modos" : "Share anyway"}
          </button>
          <button
            type="button"
            onClick={() => resolvePendingIntent("cancel")}
            className="inline-flex min-h-11 items-center rounded-xl border border-navy/15 bg-white px-3 text-sm font-semibold"
          >
            {language === "es" ? "Cancelar envío" : "Cancel share"}
          </button>
          <button
            type="button"
            onClick={() => resolvePendingIntent("open-source")}
            className="inline-flex min-h-11 items-center rounded-xl bg-teal px-3 text-sm font-semibold text-white"
          >
            {language === "es" ? "Abrir fuente" : "Open source"}
          </button>
        </div>
      </div>
    );
  }

  return null;
}
