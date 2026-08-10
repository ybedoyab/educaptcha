import { useDemoSession } from "../../../context/DemoSessionContext";
import { useI18n } from "../../../i18n/I18nContext";
import { ImageCreditsButton } from "../molecules/ImageCreditsButton";
import { OpenFeedSearch } from "../molecules/OpenFeedSearch";
import { OPEN_FEED_NAV_TITLE_KEYS } from "../openFeed.constants";
import { FEED_NAV } from "../openFeed.types";
import { OpenFeedPost } from "./OpenFeedPost";

function FeedSkeleton() {
  return (
    <div className="space-y-4 p-4" aria-busy="true">
      {[1, 2, 3].map((item) => (
        <div key={item} className="flex gap-3">
          <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-social-surface" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-2/5 animate-pulse rounded bg-social-surface" />
            <div className="h-20 animate-pulse rounded-xl bg-social-surface" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyFeed({ hasQuery }: { hasQuery: boolean }) {
  const { copy } = useI18n();
  const description = hasQuery
    ? copy.experience.emptySearch
    : copy.experience.emptyView;

  return (
    <div className="px-8 py-12 text-center" role="status" aria-live="polite">
      <p className="text-[17px] font-extrabold text-social-text">
        {copy.experience.noResults}
      </p>
      <p className="mt-1 text-[15px] text-social-muted">{description}</p>
    </div>
  );
}

function AlertsFeed() {
  const { alerts } = useDemoSession();
  const { language } = useI18n();

  return (
    <ul className="divide-y divide-social-border">
      {alerts.map((alert) => (
        <li key={alert.id} className="px-4 py-4 hover:bg-social-text/[0.015]">
          <p className="text-[15px] leading-5 text-social-text">
            {alert.text[language]}
          </p>
          <p className="mt-1 text-[13px] text-social-muted">
            {new Date(alert.at).toLocaleString(language)}
          </p>
        </li>
      ))}
    </ul>
  );
}

export function OpenFeedFeed() {
  const { filteredPosts, nav, query, loading } = useDemoSession();
  const { copy } = useI18n();
  const titleKey = OPEN_FEED_NAV_TITLE_KEYS[nav];
  const isAlertsView = nav === FEED_NAV.ALERTS;

  return (
    <main
      className="min-w-0 flex-1 overflow-y-auto border-r border-social-border bg-white pb-16 md:max-w-[600px] md:pb-0"
      data-testid="open-feed-main"
    >
      <div className="sticky top-0 z-20 border-b border-social-border bg-white/95 backdrop-blur">
        <div className="flex h-[53px] items-center px-4">
          <h1 className="text-xl font-extrabold text-social-text">
            {copy.experience[titleKey]}
          </h1>
        </div>
        <div className="px-3 pb-3 lg:hidden">
          <OpenFeedSearch />
        </div>
      </div>

      {isAlertsView ? <AlertsFeed /> : null}
      {!isAlertsView && loading ? <FeedSkeleton /> : null}
      {!isAlertsView && !loading && filteredPosts.length === 0 ? (
        <EmptyFeed hasQuery={Boolean(query)} />
      ) : null}
      {!isAlertsView && !loading
        ? filteredPosts.map((post) => (
            <OpenFeedPost key={post.id} post={post} />
          ))
        : null}

      <div className="px-4 lg:hidden">
        <ImageCreditsButton />
      </div>
    </main>
  );
}
