import { Bookmark, Heart, Link2, MessageCircle, Repeat2 } from "lucide-react";
import { ActionButton } from "../atoms/ActionButton";

interface PostActionsProps {
  commentCount: number;
  reactionCount: number;
  repostCount: number;
  liked: boolean;
  saved: boolean;
  reposted?: boolean;
  repostBusy: boolean;
  repostLocked?: boolean;
  repostAnimate?: boolean;
  labels: {
    comment: string;
    repost: string;
    like: string;
    save: string;
    verify: string;
  };
  ids: {
    comment: string;
    repost: string;
    save: string;
    verify: string;
  };
  onComment: () => void;
  onRepost: () => void;
  onLike: () => void;
  onSave: () => void;
  onVerify?: () => void;
}

export function PostActions({
  commentCount,
  reactionCount,
  repostCount,
  liked,
  saved,
  reposted = false,
  repostBusy,
  repostLocked = false,
  repostAnimate = false,
  labels,
  ids,
  onComment,
  onRepost,
  onLike,
  onSave,
  onVerify,
}: PostActionsProps) {
  return (
    <div className="mt-1 flex max-w-[460px] items-center justify-between" role="group">
      <ActionButton
        id={ids.comment}
        icon={MessageCircle}
        label={labels.comment}
        count={commentCount}
        tone="reply"
        onClick={onComment}
      />
      <ActionButton
        id={ids.repost}
        icon={Repeat2}
        label={labels.repost}
        count={repostCount}
        active={reposted}
        busy={repostBusy}
        locked={repostLocked}
        animatePop={repostAnimate}
        tone="repost"
        onClick={onRepost}
      />
      <ActionButton
        icon={Heart}
        label={labels.like}
        count={reactionCount}
        active={liked}
        tone="like"
        aria-pressed={liked}
        onClick={onLike}
      />
      <ActionButton
        id={ids.save}
        icon={Bookmark}
        label={labels.save}
        active={saved}
        tone="save"
        aria-pressed={saved}
        onClick={onSave}
      />
      {onVerify ? (
        <ActionButton
          id={ids.verify}
          icon={Link2}
          label={labels.verify}
          tone="verify"
          onClick={onVerify}
        />
      ) : null}
    </div>
  );
}
