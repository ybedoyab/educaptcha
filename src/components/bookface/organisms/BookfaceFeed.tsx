import { useDemoSession } from "../../../context/DemoSessionContext";
import { useI18n } from "../../../i18n/I18nContext";
import { FEED_NAV } from "../../openfeed/openFeed.types";
import { BookfaceImageCredits } from "../molecules/BookfaceImageCredits";
import { BOOKFACE_NAV_TITLE_KEYS } from "../bookface.constants";
import { BookfaceComposer } from "./BookfaceComposer";
import { BookfacePost } from "./BookfacePost";
import { BookfaceStories } from "./BookfaceStories";

function FeedSkeleton() {
  return (
    <div className="space-y-3 rounded-lg bg-white p-4 shadow-sm" aria-busy="true">
      {[1, 2, 3].map((item) => (
        <div key={item} className="flex gap-3">
          <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-bf-chip" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-2/5 animate-pulse rounded bg-bf-chip" />
            <div className="h-24 animate-pulse rounded-lg bg-bf-chip" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyFeed({ hasQuery, isSaved }: { hasQuery: boolean; isSaved: boolean }) {
  const { copy } = useI18n();
  let description = copy.experience.emptyView;
  if (hasQuery) description = copy.experience.emptySearch;
  else if (isSaved) description = copy.experience.bfEmptySaved;

  return (
    <div
      className="rounded-lg bg-white px-8 py-12 text-center shadow-sm"
      role="status"
      aria-live="polite"
    >
      <p className="text-[17px] font-bold text-bf-text">
        {copy.experience.noResults}
      </p>
      <p className="mt-1 text-[15px] text-bf-muted">{description}</p>
    </div>
  );
}

function AlertsFeed() {
  const { alerts } = useDemoSession();
  const { language } = useI18n();

  return (
    <ul className="divide-y divide-bf-border overflow-hidden rounded-lg bg-white shadow-sm">
      {alerts.map((alert) => (
        <li key={alert.id} className="px-4 py-3 hover:bg-bf-hover">
          <p className="text-[15px] leading-5 text-bf-text">
            {alert.text[language]}
          </p>
          <p className="mt-1 text-[13px] text-bf-muted">
            {new Date(alert.at).toLocaleString(language)}
          </p>
        </li>
      ))}
    </ul>
  );
}

export function BookfaceFeed() {
  const { filteredPosts, nav, query, loading } = useDemoSession();
  const { copy } = useI18n();
  const isHome = nav === FEED_NAV.HOME;
  const isAlertsView = nav === FEED_NAV.ALERTS;
  const title = copy.experience[BOOKFACE_NAV_TITLE_KEYS[nav]];

  return (
    <main
      className="min-w-0 flex-1 overflow-y-auto"
      data-testid="bookface-main"
    >
      <div className="mx-auto flex w-full max-w-[590px] flex-col gap-4 py-4 sm:px-3">
        {isHome ? (
          <h1 className="sr-only">{title}</h1>
        ) : (
          <h1 className="px-4 text-[24px] font-bold leading-7 text-bf-text sm:px-0">
            {title}
          </h1>
        )}

        {isHome ? (
          <>
            <BookfaceStories />
            <BookfaceComposer />
          </>
        ) : null}

        {isAlertsView ? <AlertsFeed /> : null}
        {!isAlertsView && loading ? <FeedSkeleton /> : null}
        {!isAlertsView && !loading && filteredPosts.length === 0 ? (
          <EmptyFeed
            hasQuery={Boolean(query)}
            isSaved={nav === FEED_NAV.SAVED}
          />
        ) : null}
        {!isAlertsView && !loading
          ? filteredPosts.map((post) => (
              <BookfacePost key={post.id} post={post} />
            ))
          : null}

        <div className="px-4 lg:hidden">
          <BookfaceImageCredits />
        </div>
      </div>
    </main>
  );
}
