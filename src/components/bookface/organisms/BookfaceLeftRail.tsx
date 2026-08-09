import { useDemoSession } from "../../../context/DemoSessionContext";
import { useI18n } from "../../../i18n/I18nContext";
import { FeedAvatar } from "../../openfeed/atoms/FeedAvatar";
import { BookfaceNavItem } from "../molecules/BookfaceNavItem";
import { BookfaceImageCredits } from "../molecules/BookfaceImageCredits";
import { BOOKFACE_NAV_ITEMS } from "../bookface.constants";

export function BookfaceLeftRail() {
  const { nav, setNav, alerts, saved } = useDemoSession();
  const { copy } = useI18n();
  const badgeValues = { alerts: alerts.length, saved: saved.size };

  return (
    <aside className="hidden h-full w-[300px] shrink-0 overflow-y-auto px-2 py-3 lg:block xl:w-[320px]">
      <div className="flex min-h-11 items-center gap-3 rounded-lg px-2 py-1">
        <FeedAvatar author={copy.experience.you} hue={205} />
        <span className="min-w-0 flex-1 truncate text-[15px] font-semibold text-bf-text">
          {copy.experience.you}
        </span>
      </div>

      <nav
        className="mt-1 flex flex-col gap-0.5"
        aria-label={copy.experience.bfMenuLabel}
      >
        {BOOKFACE_NAV_ITEMS.map((item) => (
          <BookfaceNavItem
            key={item.id}
            icon={item.icon}
            label={copy.experience[item.labelKey]}
            active={nav === item.id}
            badge={item.badgeSource ? badgeValues[item.badgeSource] : 0}
            variant="rail"
            tint={item.tint}
            onSelect={() => setNav(item.id)}
          />
        ))}
      </nav>

      <div className="mt-3 border-t border-bf-border px-2 pt-2">
        <BookfaceImageCredits />
        <p className="pb-4 text-[12px] leading-4 text-bf-muted">
          {copy.footer.rights}
        </p>
      </div>
    </aside>
  );
}
