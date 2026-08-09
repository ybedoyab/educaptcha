import { Loader2, type LucideIcon } from "lucide-react";
import type { ButtonHTMLAttributes } from "react";

type ActionTone = "like" | "comment" | "share";

interface BookfaceActionButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  busy?: boolean;
  tone: ActionTone;
}

const ACTIVE_TONE_CLASSES: Record<ActionTone, string> = {
  like: "text-bf-like",
  comment: "text-bf-blue",
  share: "text-bf-blue",
};

/**
 * The wide, evenly split Like / Comment / Share control under a post card —
 * label always visible, unlike the icon-only actions on the Y skin.
 */
export function BookfaceActionButton({
  icon: Icon,
  label,
  active = false,
  busy = false,
  tone,
  className = "",
  ...buttonProps
}: BookfaceActionButtonProps) {
  const IconComponent = busy ? Loader2 : Icon;
  const stateClass = active ? ACTIVE_TONE_CLASSES[tone] : "text-bf-muted";

  return (
    <button
      type="button"
      className={`inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg text-[15px] font-semibold transition-colors hover:bg-bf-hover ${stateClass} ${className}`}
      aria-busy={busy}
      {...buttonProps}
    >
      <IconComponent
        className={`h-5 w-5 ${busy ? "animate-spin" : ""}`}
        fill={active && !busy ? "currentColor" : "none"}
        aria-hidden="true"
      />
      <span>{label}</span>
    </button>
  );
}
