import { useDemoSession } from "../../../context/DemoSessionContext";
import { useI18n } from "../../../i18n/I18nContext";
import { OPEN_FEED_NAV_ITEMS } from "../openFeed.constants";
import { FeedNavigationItem } from "../molecules/FeedNavigationItem";

export function OpenFeedMobileNav() {
  const { nav, setNav, alerts, saved } = useDemoSession();
  const { copy } = useI18n();
  const badgeValues = { alerts: alerts.length, saved: saved.size };

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex h-16 border-t border-social-border bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
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
            variant="bottom"
            onSelect={() => setNav(item.id)}
          />
        );
      })}
    </nav>
  );
}

