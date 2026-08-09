import { openFeedTrends } from "../../../data/openFeedPosts";
import { useI18n } from "../../../i18n/I18nContext";
import { ImageCreditsButton } from "../molecules/ImageCreditsButton";
import { OpenFeedSearch } from "../molecules/OpenFeedSearch";
import { TrendItem } from "../molecules/TrendItem";

export function OpenFeedTrends() {
  const { language, copy } = useI18n();

  return (
    <aside className="hidden h-full w-[320px] shrink-0 overflow-y-auto bg-white px-5 lg:block xl:w-[350px]">
      <div className="sticky top-0 z-10 bg-white pb-3 pt-1">
        <OpenFeedSearch />
      </div>
      <section className="overflow-hidden rounded-2xl bg-social-surface">
        <h2 className="px-4 pb-2 pt-3 text-xl font-extrabold text-social-text">
          {copy.experience.trendsTitle}
        </h2>
        <ul>
          {openFeedTrends.map((trend) => (
            <TrendItem
              key={trend.en}
              context={copy.experience.trendContext}
              title={trend[language]}
            />
          ))}
        </ul>
      </section>
      <div className="px-4 py-2">
        <ImageCreditsButton />
      </div>
    </aside>
  );
}
