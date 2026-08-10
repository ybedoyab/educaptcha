import { BadgeCheck, TriangleAlert } from "lucide-react";

export type PostCheckBadgeStatus = "ai-cleared" | "misleading";

interface PostMetaProps {
  author: string;
  handle: string;
  time: string;
  highlighted: boolean;
  highlightedLabel: string;
  checkStatus?: PostCheckBadgeStatus | null;
  aiVerifiedLabel?: string;
  misleadingLabel?: string;
}

export function PostMeta({
  author,
  handle,
  time,
  highlighted,
  highlightedLabel,
  checkStatus = null,
  aiVerifiedLabel,
  misleadingLabel,
}: PostMetaProps) {
  return (
    <header className="flex min-w-0 flex-wrap items-center gap-1 text-[15px] leading-5">
      <h3 className="truncate font-bold text-social-text hover:underline">
        {author}
      </h3>
      <span className="truncate text-social-muted">{handle}</span>
      <span className="shrink-0 text-social-muted" aria-hidden="true">
        ·
      </span>
      <span className="shrink-0 text-social-muted">{time}</span>
      {highlighted ? (
        <span className="ml-1 shrink-0 rounded-full bg-social-blue/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-social-blue">
          {highlightedLabel}
        </span>
      ) : null}
      {checkStatus === "ai-cleared" ? (
        <span className="ml-1 inline-flex shrink-0 items-center gap-1 rounded-md border border-social-green/35 bg-social-green/10 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-social-green">
          <BadgeCheck className="h-3 w-3" aria-hidden="true" />
          {aiVerifiedLabel ?? "AI verified"}
        </span>
      ) : null}
      {checkStatus === "misleading" ? (
        <span className="ml-1 inline-flex shrink-0 items-center gap-1 rounded-md border border-amber/40 bg-amber/15 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-[#b45309]">
          <TriangleAlert className="h-3 w-3" aria-hidden="true" />
          {misleadingLabel ?? "Misleading"}
        </span>
      ) : null}
    </header>
  );
}
