import type { ReactNode } from "react";
import { BadgeCheck, Globe, TriangleAlert } from "lucide-react";
import { useI18n } from "../../../i18n/I18nContext";
import { FeedAvatar } from "../../openfeed/atoms/FeedAvatar";

export type BookfaceCheckBadgeStatus = "ai-cleared" | "misleading";

interface BookfacePostHeaderProps {
  author: string;
  handle: string;
  time: string;
  hue: number;
  highlighted: boolean;
  highlightedLabel: string;
  checkStatus?: BookfaceCheckBadgeStatus | null;
  aiVerifiedLabel?: string;
  misleadingLabel?: string;
  menu: ReactNode;
}

export function BookfacePostHeader({
  author,
  handle,
  time,
  hue,
  highlighted,
  highlightedLabel,
  checkStatus = null,
  aiVerifiedLabel,
  misleadingLabel,
  menu,
}: BookfacePostHeaderProps) {
  const { copy } = useI18n();

  return (
    <header className="flex items-start gap-2 px-4 pt-3">
      <FeedAvatar author={author} hue={hue} />
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-[15px] font-semibold leading-5 text-bf-text">
          {author}
        </h3>
        <p className="flex min-w-0 flex-wrap items-center gap-1 text-[13px] leading-4 text-bf-muted">
          <span className="truncate">{handle}</span>
          <span aria-hidden="true">·</span>
          <span className="shrink-0">{time}</span>
          <span aria-hidden="true">·</span>
          <Globe className="h-3 w-3 shrink-0" aria-hidden="true" />
          <span className="sr-only">{copy.experience.bfAudiencePublic}</span>
          {highlighted ? (
            <span className="shrink-0 rounded-full bg-bf-blue/10 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-bf-blue">
              {highlightedLabel}
            </span>
          ) : null}
          {checkStatus === "ai-cleared" ? (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-md border border-bf-green/40 bg-bf-green/15 px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-wide text-bf-green">
              <BadgeCheck className="h-3 w-3" aria-hidden="true" />
              {aiVerifiedLabel ?? copy.experience.aiVerifiedBadge}
            </span>
          ) : null}
          {checkStatus === "misleading" ? (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-md border border-amber/50 bg-amber/15 px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-wide text-[#b45309]">
              <TriangleAlert className="h-3 w-3" aria-hidden="true" />
              {misleadingLabel ?? copy.experience.verifiedBadge}
            </span>
          ) : null}
        </p>
      </div>
      {menu}
    </header>
  );
}
