import type { LucideIcon } from "lucide-react";

interface BookfaceNavItemProps {
  icon: LucideIcon;
  label: string;
  active: boolean;
  badge?: number;
  /** `tab` is the header strip, `rail` the labelled desktop sidebar row. */
  variant: "tab" | "rail";
  tint: string;
  onSelect: () => void;
}

export function BookfaceNavItem({
  icon: Icon,
  label,
  active,
  badge = 0,
  variant,
  tint,
  onSelect,
}: BookfaceNavItemProps) {
  const shared =
    "relative inline-flex items-center transition-colors focus-visible:outline-bf-blue";

  if (variant === "tab") {
    return (
      <button
        type="button"
        onClick={onSelect}
        aria-current={active ? "page" : undefined}
        aria-label={label}
        title={label}
        className={`${shared} h-12 flex-1 justify-center rounded-lg md:h-14 md:w-[112px] md:flex-none md:rounded-none ${
          active
            ? "text-bf-blue after:absolute after:inset-x-0 after:bottom-0 after:h-[3px] after:rounded-t after:bg-bf-blue"
            : "text-bf-muted hover:bg-bf-hover"
        }`}
      >
        <span className="relative grid place-items-center">
          <Icon className="h-6 w-6" strokeWidth={active ? 2.4 : 2} aria-hidden="true" />
          {badge > 0 ? (
            <span
              className="absolute -right-2.5 -top-1.5 min-w-[18px] rounded-full bg-bf-love px-1 text-center text-[11px] font-bold leading-[18px] text-white"
              aria-hidden="true"
            >
              {badge}
            </span>
          ) : null}
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={active ? "page" : undefined}
      className={`${shared} min-h-11 w-full gap-3 rounded-lg px-2 text-left text-[15px] hover:bg-bf-hover ${
        active ? "bg-bf-chip font-semibold" : "font-medium"
      }`}
    >
      <Icon className={`h-6 w-6 shrink-0 ${tint}`} aria-hidden="true" />
      <span className="min-w-0 flex-1 truncate text-bf-text">{label}</span>
      {badge > 0 ? (
        <span
          className="shrink-0 rounded-full bg-bf-love px-2 text-[12px] font-bold leading-5 text-white"
          aria-hidden="true"
        >
          {badge}
        </span>
      ) : null}
    </button>
  );
}
