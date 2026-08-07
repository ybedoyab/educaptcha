import { openFeedTrends } from "../../data/openFeedPosts";
import { useI18n } from "../../i18n/I18nContext";
import { ImageCreditsButton } from "./ImageCreditsButton";

export function OpenFeedTrends() {
  const { language, copy } = useI18n();

  return (
    <aside className="hidden w-64 shrink-0 border-l border-navy/8 bg-white p-4 xl:block">
      <h2 className="text-sm font-semibold text-navy">
        {copy.experience.trendsTitle}
      </h2>
      <ul className="mt-3 space-y-2">
        {openFeedTrends.map((t) => (
          <li
            key={t.en}
            className="rounded-xl bg-off-white px-3 py-2 text-sm text-navy/75"
          >
            {t[language]}
          </li>
        ))}
      </ul>
      <div className="mt-6">
        <ImageCreditsButton />
      </div>
    </aside>
  );
}
