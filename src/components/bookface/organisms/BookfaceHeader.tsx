import { useDemoSession } from "../../../context/DemoSessionContext";
import { useI18n } from "../../../i18n/I18nContext";
import { BookfaceMark } from "../atoms/BookfaceMark";
import { BookfaceNavItem } from "../molecules/BookfaceNavItem";
import { BookfaceSearch } from "../molecules/BookfaceSearch";
import { BookfaceSessionControls } from "../molecules/BookfaceSessionControls";
import { BOOKFACE_NAV_ITEMS } from "../bookface.constants";

/**
 * Three-part bar: brand + search, the centred tab strip, session controls.
 * Below `md` the strip drops onto its own full-width row, which is how the
 * mobile web layout behaves.
 */
export function BookfaceHeader() {
  const { nav, setNav, alerts, saved } = useDemoSession();
  const { copy } = useI18n();
  const badgeValues = { alerts: alerts.length, saved: saved.size };

  return (
    <header className="relative z-30 flex shrink-0 flex-col bg-white shadow-[0_1px_2px_rgba(0,0,0,0.15)] md:h-14 md:flex-row md:items-center md:gap-3 md:px-4">
      <div className="flex h-14 min-w-0 items-center gap-2 px-3 md:flex-1 md:px-0">
        <BookfaceMark
          className="h-10 w-10 shrink-0 text-bf-blue"
          label={copy.experience.bfBrandLabel}
        />
        <BookfaceSearch className="min-w-0 flex-1 md:max-w-[240px]" />
        <div className="shrink-0 md:hidden">
          <BookfaceSessionControls />
        </div>
      </div>

      <nav
        className="flex w-full border-t border-bf-border md:w-auto md:border-0"
        aria-label={copy.experience.bfBrandLabel}
      >
        {BOOKFACE_NAV_ITEMS.map((item) => (
          <BookfaceNavItem
            key={item.id}
            icon={item.icon}
            label={copy.experience[item.labelKey]}
            active={nav === item.id}
            badge={item.badgeSource ? badgeValues[item.badgeSource] : 0}
            variant="tab"
            tint={item.tint}
            onSelect={() => setNav(item.id)}
          />
        ))}
      </nav>

      <div className="hidden md:flex md:flex-1 md:justify-end">
        <BookfaceSessionControls />
      </div>
    </header>
  );
}
