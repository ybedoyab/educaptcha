import { useI18n } from "../../../i18n/I18nContext";
import { ReactionSummary } from "../atoms/ReactionSummary";
import { compactCount, fillTemplate } from "../bookface.utils";

interface BookfaceEngagementBarProps {
  reactionCount: number;
  commentCount: number;
  shareCount: number;
}

/** The counts row between the post body and the Like / Comment / Share bar. */
export function BookfaceEngagementBar({
  reactionCount,
  commentCount,
  shareCount,
}: BookfaceEngagementBarProps) {
  const { copy, language } = useI18n();

  return (
    <div className="flex items-center justify-between gap-2 px-4 py-2 text-[15px] text-bf-muted">
      <ReactionSummary
        count={compactCount(reactionCount, language)}
        label={fillTemplate(copy.experience.bfReactionsLabel, {
          count: reactionCount.toLocaleString(language),
        })}
      />
      <span className="truncate">
        {fillTemplate(copy.experience.bfCommentCount, { count: commentCount })}
        {" · "}
        {fillTemplate(copy.experience.bfShareCount, { count: shareCount })}
      </span>
    </div>
  );
}
