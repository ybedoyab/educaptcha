import { useState } from "react";
import { BadgeCheck, ChevronDown, ChevronUp, ShieldCheck } from "lucide-react";
import type { OpenFeedPost } from "../../data/openFeedPosts";
import { useI18n } from "../../i18n/I18nContext";
import { buildVerificationTrace } from "../../lib/postVerificationTrace";
import { SourceTrace } from "../minigames/SourceTrace";

type VerificationStatus = "ai-cleared" | "misleading";

interface Props {
  post: OpenFeedPost;
  status: VerificationStatus;
  /** Y vs Bookface surface tokens */
  skin?: "y" | "bookface";
}

/** Expandable in-feed evidence: source link, date/place, claim vs original. */
export function PostVerificationTrail({
  post,
  status,
  skin = "y",
}: Props) {
  const { copy } = useI18n();
  const [open, setOpen] = useState(false);
  const steps = buildVerificationTrace(post, status);

  const shell =
    skin === "bookface"
      ? "mx-4 mb-3 rounded-lg border border-bf-border bg-bf-chip/60 p-3"
      : "mt-3 rounded-2xl border border-social-border bg-social-surface p-3";
  const toggleClass =
    skin === "bookface"
      ? "inline-flex min-h-11 w-full cursor-pointer items-center justify-between gap-2 text-left text-[14px] font-semibold text-bf-blue"
      : "inline-flex min-h-11 w-full cursor-pointer items-center justify-between gap-2 text-left text-sm font-bold text-social-blue";
  const strong =
    skin === "bookface" ? "text-bf-text" : "text-social-text";

  return (
    <div className={shell}>
      <button
        type="button"
        className={toggleClass}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="inline-flex items-center gap-2">
          {status === "ai-cleared" ? (
            <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden />
          ) : (
            <BadgeCheck className="h-4 w-4 shrink-0" aria-hidden />
          )}
          {open
            ? copy.experience.hideVerification
            : copy.experience.seeVerification}
        </span>
        {open ? (
          <ChevronUp className="h-4 w-4 shrink-0" aria-hidden />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0" aria-hidden />
        )}
      </button>

      {open ? (
        <div className="mt-2">
          <p className={`mb-2 text-sm font-semibold ${strong}`}>
            {status === "ai-cleared"
              ? copy.experience.aiClearedTraceTitle
              : copy.experience.misleadingTraceTitle}
          </p>
          <SourceTrace steps={steps} />
        </div>
      ) : null}
    </div>
  );
}
