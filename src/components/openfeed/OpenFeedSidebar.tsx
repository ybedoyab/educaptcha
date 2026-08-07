import {
  Bell,
  Bookmark,
  Compass,
  Home,
  User,
} from "lucide-react";
import { useDemoSession, type FeedNav } from "../../context/DemoSessionContext";
import { useI18n } from "../../i18n/I18nContext";

const items: { id: FeedNav; icon: typeof Home; labelKey: keyof typeof labels }[] = [
  { id: "home", icon: Home, labelKey: "home" },
  { id: "explore", icon: Compass, labelKey: "explore" },
  { id: "alerts", icon: Bell, labelKey: "alerts" },
  { id: "saved", icon: Bookmark, labelKey: "saved" },
  { id: "profile", icon: User, labelKey: "profile" },
];

const labels = {
  home: { en: "Home", es: "Inicio" },
  explore: { en: "Explore", es: "Explorar" },
  alerts: { en: "Alerts", es: "Alertas" },
  saved: { en: "Saved", es: "Guardados" },
  profile: { en: "Profile", es: "Perfil" },
} as const;

export function OpenFeedSidebar() {
  const { nav, setNav, alerts, saved } = useDemoSession();
  const { language, copy } = useI18n();

  return (
    <nav
      className="flex shrink-0 gap-1 overflow-x-auto border-b border-navy/8 bg-white px-2 py-2 lg:w-52 lg:flex-col lg:overflow-visible lg:border-b-0 lg:border-r lg:px-3 lg:py-4"
      aria-label={copy.experience.feedName}
    >
      {items.map(({ id, icon: Icon, labelKey }) => {
        const active = nav === id;
        const badge =
          id === "alerts"
            ? alerts.length
            : id === "saved"
              ? saved.size
              : 0;
        return (
          <button
            key={id}
            type="button"
            onClick={() => setNav(id)}
            aria-current={active ? "page" : undefined}
            className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-3 text-sm font-semibold transition ${
              active
                ? "bg-teal/10 text-teal"
                : "text-navy/70 hover:bg-navy/5 hover:text-navy"
            }`}
          >
            <Icon className="h-4 w-4" aria-hidden />
            <span>{labels[labelKey][language]}</span>
            {badge > 0 && (
              <span className="ml-auto rounded-md bg-amber/20 px-1.5 text-xs text-navy">
                {badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
