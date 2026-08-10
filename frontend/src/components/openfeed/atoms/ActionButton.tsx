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
  /** Immediate interaction lock (before spinner grace). */
  locked?: boolean;
  /** Play the X-style green repost pop once. */
  animatePop?: boolean;
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
  locked = false,
  animatePop = false,
  tone,
  className = "",
  disabled,
  ...buttonProps
}: ActionButtonProps) {
  const IconComponent = busy ? Loader2 : Icon;
  const toneClasses = TONE_CLASSES[tone];
  const activeClass = active ? toneClasses.active : "";
  const isDisabled = Boolean(disabled || locked);

  return (
    <button
      type="button"
      className={`group inline-flex min-h-11 min-w-11 items-center gap-1 text-xs text-social-muted transition-colors ${toneClasses.hover} ${activeClass} ${isDisabled && !active ? "cursor-not-allowed opacity-60" : ""} ${className}`}
      aria-label={label}
      aria-busy={busy || undefined}
      aria-disabled={isDisabled || undefined}
      aria-pressed={active || undefined}
      disabled={isDisabled}
      {...buttonProps}
    >
      <span className="grid h-9 w-9 place-items-center rounded-full transition-colors group-hover:bg-current/10">
        <IconComponent
          className={`h-[18px] w-[18px] ${busy ? "animate-spin" : ""} ${
            animatePop && tone === "repost" ? "animate-repost-pop" : ""
          } ${animatePop && tone === "like" ? "animate-share-flash" : ""}`}
          aria-hidden="true"
        />
      </span>
      {count === undefined ? null : (
        <span
          aria-hidden="true"
          className={animatePop ? "animate-share-flash tabular-nums" : "tabular-nums"}
        >
          {count}
        </span>
      )}
    </button>
  );
}
