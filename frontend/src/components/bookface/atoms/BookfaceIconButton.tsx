import type { LucideIcon } from "lucide-react";
// ComponentProps rather than ButtonHTMLAttributes so callers can pass `ref`,
// which React 19 treats as an ordinary prop (the post menu needs it).
import type { ComponentProps } from "react";

interface BookfaceIconButtonProps
  extends Omit<ComponentProps<"button">, "children"> {
  icon: LucideIcon;
  label: string;
}

/** Circular grey icon button — the post-menu affordance. */
export function BookfaceIconButton({
  icon: Icon,
  label,
  className = "",
  ...buttonProps
}: BookfaceIconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      className={`grid min-h-11 min-w-11 place-items-center rounded-full bg-bf-chip text-bf-text transition-colors hover:bg-bf-border ${className}`}
      {...buttonProps}
    >
      <Icon className="h-5 w-5" aria-hidden="true" />
    </button>
  );
}
