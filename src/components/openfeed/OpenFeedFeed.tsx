import { useDemoSession } from "../../context/DemoSessionContext";
import { useI18n } from "../../i18n/I18nContext";
import { OpenFeedPost } from "./OpenFeedPost";
import { OpenFeedSearch } from "./OpenFeedSearch";
import { ImageCreditsButton } from "./ImageCreditsButton";

export function OpenFeedFeed() {
  const { filteredPosts, nav, alerts, query, loading } = useDemoSession();
  const { language } = useI18n();

  if (nav === "alerts") {
    return (
      <div className="flex-1 overflow-y-auto">
        <div className="sticky top-0 z-10 border-b border-navy/8 bg-white/95 p-3 backdrop-blur">
          <h2 className="text-sm font-semibold text-navy">
            {language === "es" ? "Alertas" : "Alerts"}
          </h2>
        </div>
        <ul className="divide-y divide-navy/8">
          {alerts.map((a) => (
            <li key={a.id} className="px-4 py-4">
              <p className="text-sm text-navy">{a.text[language]}</p>
              <p className="mt-1 text-xs text-navy/40">
                {new Date(a.at).toLocaleString(language)}
              </p>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <div className="sticky top-0 z-10 space-y-2 border-b border-navy/8 bg-white/95 p-3 backdrop-blur">
        <OpenFeedSearch />
        <div className="flex items-center justify-between xl:hidden">
          <ImageCreditsButton />
        </div>
      </div>

      {loading && (
        <div className="space-y-3 p-4" aria-busy="true">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-2xl bg-navy/5"
            />
          ))}
        </div>
      )}

      {!loading && filteredPosts.length === 0 && (
        <div className="p-8 text-center" role="status" aria-live="polite">
          <p className="text-sm font-medium text-navy">
            {language === "es" ? "Sin resultados" : "No results"}
          </p>
          <p className="mt-1 text-sm text-navy/55">
            {query
              ? language === "es"
                ? "Prueba otra búsqueda o limpia el filtro."
                : "Try another search or clear the filter."
              : language === "es"
                ? "No hay publicaciones en esta vista."
                : "No posts in this view."}
          </p>
        </div>
      )}

      {!loading &&
        filteredPosts.map((post) => <OpenFeedPost key={post.id} post={post} />)}
    </div>
  );
}
