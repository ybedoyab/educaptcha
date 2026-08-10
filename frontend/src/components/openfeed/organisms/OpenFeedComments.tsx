import { useMemo, useState } from "react";
import { Heart, Trash2 } from "lucide-react";
import type { FeedComment } from "../../../data/openFeedPosts";
import { useDemoSession } from "../../../context/DemoSessionContext";
import { useI18n } from "../../../i18n/I18nContext";
import { FeedAvatar } from "../atoms/FeedAvatar";
import { OPEN_FEED_COMMENT_SORT_OPTIONS } from "../openFeed.constants";
import { sortComments } from "../openFeed.utils";
import { OpenFeedCommentComposer } from "./OpenFeedCommentComposer";

interface OpenFeedCommentsProps {
  postId: string;
}

interface CommentItemProps {
  comment: FeedComment;
  postId: string;
  nested?: boolean;
  onReply?: (commentId: string) => void;
}

function avatarHue(author: string): number {
  let hue = 0;
  for (const character of author) hue = (hue + character.charCodeAt(0)) % 360;
  return hue;
}

function CommentItem({
  comment,
  postId,
  nested = false,
  onReply,
}: CommentItemProps) {
  const { likeComment, deleteComment } = useDemoSession();
  const { language, copy } = useI18n();

  return (
    <div className={`flex gap-3 ${nested ? "py-3" : "py-4"}`}>
      <FeedAvatar
        author={comment.author}
        hue={avatarHue(comment.author)}
        size="sm"
      />
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-1 text-[15px] leading-5">
          <span className="truncate font-bold text-social-text">
            {comment.author}
          </span>
          <span className="truncate text-social-muted">{comment.handle}</span>
        </div>
        <p className="mt-0.5 text-[15px] leading-5 text-social-text">
          {comment.body[language]}
        </p>
        <div className="mt-1 flex items-center gap-3 text-social-muted">
          <button
            type="button"
            onClick={() => likeComment(postId, comment.id)}
            className="inline-flex min-h-11 items-center gap-1 rounded-full px-2 text-xs hover:bg-social-pink/10 hover:text-social-pink"
            aria-label={copy.experience.like}
          >
            <Heart className="h-4 w-4" aria-hidden="true" />
            {comment.likes}
          </button>
          {onReply ? (
            <button
              type="button"
              onClick={() => onReply(comment.id)}
              className="min-h-11 rounded-full px-2 text-xs hover:bg-social-blue/10 hover:text-social-blue"
            >
              {copy.experience.reply}
            </button>
          ) : null}
          {comment.isOwn ? (
            <button
              type="button"
              onClick={() => deleteComment(postId, comment.id)}
              className="inline-flex min-h-11 items-center gap-1 rounded-full px-2 text-xs hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              {copy.experience.delete}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function OpenFeedComments({ postId }: OpenFeedCommentsProps) {
  const { comments, commentSort, setCommentSort } = useDemoSession();
  const { copy } = useI18n();
  const [replyTo, setReplyTo] = useState<string>();

  const groupedComments = useMemo(() => {
    const roots: FeedComment[] = [];
    const replies = new Map<string, FeedComment[]>();

    for (const comment of sortComments(comments[postId] ?? [], commentSort)) {
      if (!comment.parentId) {
        roots.push(comment);
        continue;
      }

      const groupedReplies = replies.get(comment.parentId) ?? [];
      groupedReplies.push(comment);
      replies.set(comment.parentId, groupedReplies);
    }

    return { roots, replies };
  }, [comments, postId, commentSort]);

  const commentCount = comments[postId]?.length ?? 0;
  const placeholder = replyTo
    ? copy.experience.writeReply
    : copy.experience.addComment;

  return (
    <section aria-label={copy.experience.commentsRegion}>
      <div className="flex items-center justify-between gap-2 border-b border-social-border px-4 py-2">
        <h3 className="text-[15px] font-bold text-social-text">
          {copy.experience.commentsTitle} · {commentCount}
        </h3>
        <div className="flex gap-1">
          {OPEN_FEED_COMMENT_SORT_OPTIONS.map((option) => {
            const active = commentSort === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setCommentSort(option.id)}
                aria-pressed={active}
                className={`min-h-11 rounded-full px-3 text-xs font-bold transition-colors ${
                  active
                    ? "bg-social-blue/10 text-social-blue"
                    : "text-social-muted hover:bg-social-surface"
                }`}
              >
                {copy.experience[option.labelKey]}
              </button>
            );
          })}
        </div>
      </div>

      <OpenFeedCommentComposer
        postId={postId}
        parentId={replyTo}
        onPosted={() => setReplyTo(undefined)}
        placeholder={placeholder}
      />

      <ul className="divide-y divide-social-border">
        {groupedComments.roots.map((comment) => {
          const replies = groupedComments.replies.get(comment.id) ?? [];
          return (
            <li key={comment.id} className="px-4">
              <CommentItem
                comment={comment}
                postId={postId}
                onReply={setReplyTo}
              />
              {replies.length > 0 ? (
                <ul className="ml-4 border-l border-social-border pl-5">
                  {replies.map((reply) => (
                    <li key={reply.id}>
                      <CommentItem comment={reply} postId={postId} nested />
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

