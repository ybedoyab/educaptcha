import { useDemoSession } from "../../../context/DemoSessionContext";
import { useI18n } from "../../../i18n/I18nContext";
import { YMark } from "../atoms/YMark";
import { OPEN_FEED_NAV_ITEMS } from "../openFeed.constants";
import { FeedNavigationItem } from "../molecules/FeedNavigationItem";
import { SessionControls } from "../molecules/SessionControls";

export function OpenFeedSidebar() {
  const { nav, setNav, alerts, saved } = useDemoSession();
  const { copy } = useI18n();
  const badgeValues = { alerts: alerts.length, saved: saved.size };

  return (
    <aside className="hidden h-full w-[88px] shrink-0 border-r border-social-border bg-white md:flex md:flex-col xl:w-[260px]">
      <div className="flex h-full flex-col px-2 xl:px-3">
        <div className="flex h-14 items-center justify-center xl:justify-start xl:px-3">
          <YMark
            className="h-8 w-8 text-social-text"
            label={copy.experience.socialBrandLabel}
          />
        </div>
        <nav
          className="flex flex-col gap-1"
          aria-label={copy.experience.socialBrandLabel}
        >
          {OPEN_FEED_NAV_ITEMS.map((item) => {
            const badge = item.badgeSource
              ? badgeValues[item.badgeSource]
              : undefined;

            return (
              <FeedNavigationItem
                key={item.id}
                icon={item.icon}
                label={copy.experience[item.labelKey]}
                active={nav === item.id}
                badge={badge}
                compact
                onSelect={() => setNav(item.id)}
              />
            );
          })}
        </nav>
        <div className="mt-auto border-t border-social-border py-2">
          <SessionControls compact />
        </div>
      </div>
    </aside>
  );
}

