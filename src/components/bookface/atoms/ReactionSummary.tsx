import { Heart, ThumbsUp } from "lucide-react";

interface ReactionSummaryProps {
  /** Formatted for display, e.g. "1.2K". */
  count: string;
  /** Full accessible sentence, e.g. "1,240 reactions". */
  label: string;
}

/** Facebook's stacked reaction pills plus the total, left of the divider. */
export function ReactionSummary({ count, label }: ReactionSummaryProps) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[15px] text-bf-muted">
      <span className="flex -space-x-1" aria-hidden="true">
        <span className="grid h-[18px] w-[18px] place-items-center rounded-full bg-bf-like ring-2 ring-white">
          <ThumbsUp className="h-2.5 w-2.5 text-white" fill="currentColor" />
        </span>
        <span className="grid h-[18px] w-[18px] place-items-center rounded-full bg-bf-love ring-2 ring-white">
          <Heart className="h-2.5 w-2.5 text-white" fill="currentColor" />
        </span>
      </span>
      <span className="sr-only">{label}</span>
      <span aria-hidden="true">{count}</span>
    </span>
  );
}
