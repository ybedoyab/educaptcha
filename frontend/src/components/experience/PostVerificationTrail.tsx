import { useState } from "react";
import { BadgeCheck, ChevronDown, ChevronUp } from "lucide-react";
import type { OpenFeedPost } from "../../data/openFeedPosts";
import { useI18n } from "../../i18n/I18nContext";
import { buildVerificationTrace } from "../../lib/postVerificationTrace";
import { SourceTrace } from "../minigames/SourceTrace";

type VerificationStatus = "no-intervention" | "misleading";

interface Props {
  post: OpenFeedPost;
  status: VerificationStatus;
  /** Y vs Bookface surface tokens */
  skin?: "y" | "bookface";
}

/**
 * Expandable in-feed evidence after a verification pause.
 * Only shown for posts that went through EduCAPTCHA (misleading path).
 * No “AI verified / cleared to share” certification for benign shares.
 */
export function PostVerificationTrail({
  post,
  status,
  skin = "y",
}: Props) {
  const { copy } = useI18n();
  const [open, setOpen] = useState(false);

  // Benign shares leave no verification trail — we did not certify truth.
  if (status !== "misleading") return null;

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
          <BadgeCheck className="h-4 w-4 shrink-0" aria-hidden />
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
            {copy.experience.misleadingTraceTitle}
          </p>
          <SourceTrace steps={steps} />
        </div>
      ) : null}
    </div>
  );
}
