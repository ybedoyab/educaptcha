import type { LucideIcon } from "lucide-react";

interface FeedNavigationItemProps {
  icon: LucideIcon;
  label: string;
  active: boolean;
  badge?: number;
  compact?: boolean;
  variant?: "sidebar" | "bottom";
  onSelect: () => void;
}

const VARIANT_CLASSES = {
  sidebar:
    "justify-center gap-4 rounded-full px-3 lg:justify-start xl:w-fit",
  bottom: "flex-1 flex-col gap-0 rounded-none px-1",
} as const;

export function FeedNavigationItem({
  icon: Icon,
  label,
  active,
  badge = 0,
  compact = false,
  variant = "sidebar",
  onSelect,
}: FeedNavigationItemProps) {
  const activeClass = active ? "font-bold" : "font-normal";
  const sidebarLabelClass = compact ? "sr-only xl:not-sr-only" : "";
  const labelClass = variant === "bottom" ? "text-[10px]" : sidebarLabelClass;

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={active ? "page" : undefined}
      className={`group relative inline-flex min-h-11 items-center text-social-text transition-colors hover:bg-social-text/10 ${VARIANT_CLASSES[variant]} ${activeClass}`}
    >
      <span className="relative grid h-8 w-8 shrink-0 place-items-center">
        <Icon className="h-[26px] w-[26px]" strokeWidth={active ? 2.5 : 2} aria-hidden="true" />
        {badge > 0 ? (
          <span className="absolute -right-1 -top-1 min-w-4 rounded-full bg-social-blue px-1 text-center text-[10px] font-bold leading-4 text-white">
            {badge}
          </span>
        ) : null}
      </span>
      <span className={labelClass}>{label}</span>
    </button>
  );
}
