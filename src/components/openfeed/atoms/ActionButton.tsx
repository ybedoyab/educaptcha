import { Loader2, type LucideIcon } from "lucide-react";
import type { ButtonHTMLAttributes } from "react";

type ActionTone = "reply" | "repost" | "like" | "save" | "verify";

interface ActionButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  icon: LucideIcon;
  label: string;
  count?: number;
  active?: boolean;
  busy?: boolean;
  tone: ActionTone;
}

const TONE_CLASSES: Record<ActionTone, { hover: string; active: string }> = {
  reply: {
    hover: "hover:text-social-blue",
    active: "text-social-blue",
  },
  repost: {
    hover: "hover:text-social-green",
    active: "text-social-green",
  },
  like: {
    hover: "hover:text-social-pink",
    active: "text-social-pink",
  },
  save: {
    hover: "hover:text-social-blue",
    active: "text-social-blue",
  },
  verify: {
    hover: "hover:text-social-blue",
    active: "text-social-blue",
  },
};

export function ActionButton({
  icon: Icon,
  label,
  count,
  active = false,
  busy = false,
  tone,
  className = "",
  ...buttonProps
}: ActionButtonProps) {
  const IconComponent = busy ? Loader2 : Icon;
  const toneClasses = TONE_CLASSES[tone];
  const activeClass = active ? toneClasses.active : "";

  return (
    <button
      type="button"
      className={`group inline-flex min-h-11 min-w-11 items-center gap-1 text-xs text-social-muted transition-colors ${toneClasses.hover} ${activeClass} ${className}`}
      aria-label={label}
      aria-busy={busy}
      {...buttonProps}
    >
      <span className="grid h-9 w-9 place-items-center rounded-full transition-colors group-hover:bg-current/10">
        <IconComponent
          className={`h-[18px] w-[18px] ${busy ? "animate-spin" : ""}`}
          aria-hidden="true"
        />
      </span>
      {count === undefined ? null : <span aria-hidden="true">{count}</span>}
    </button>
  );
}
