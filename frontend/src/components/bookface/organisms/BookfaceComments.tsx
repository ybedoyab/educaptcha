import { useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import type { FeedComment } from "../../../data/openFeedPosts";
import { useDemoSession } from "../../../context/DemoSessionContext";
import { useI18n } from "../../../i18n/I18nContext";
import { FeedAvatar } from "../../openfeed/atoms/FeedAvatar";
import { sortComments } from "../../openfeed/openFeed.utils";
import { BOOKFACE_COMMENT_SORT_OPTIONS } from "../bookface.constants";
import { BookfaceCommentComposer } from "./BookfaceCommentComposer";

interface BookfaceCommentsProps {
  postId: string;
}

interface CommentItemProps {
  comment: FeedComment;
  postId: string;
  onReply?: (commentId: string) => void;
}

const META_BUTTON_CLASS =
  "inline-flex min-h-11 items-center gap-1 rounded px-1 text-[12px] font-semibold hover:underline";

function avatarHue(author: string): number {
  let hue = 0;
  for (const character of author) hue = (hue + character.charCodeAt(0)) % 360;
  return hue;
}

function CommentItem({ comment, postId, onReply }: CommentItemProps) {
  const { likeComment, deleteComment } = useDemoSession();
  const { language, copy } = useI18n();

  return (
    <div className="flex gap-2 py-1">
      <FeedAvatar
        author={comment.author}
        hue={avatarHue(comment.author)}
        size="sm"
      />
      <div className="min-w-0 flex-1">
        <div className="inline-block max-w-full rounded-2xl bg-bf-chip px-3 py-2">
          <p className="truncate text-[13px] font-semibold text-bf-text">
            {comment.author}
          </p>
          <p className="whitespace-pre-wrap text-[15px] leading-5 text-bf-text">
            {comment.body[language]}
          </p>
        </div>
        <div className="flex items-center gap-3 pl-3 text-bf-muted">
          <button
            type="button"
            onClick={() => likeComment(postId, comment.id)}
            className={`${META_BUTTON_CLASS} hover:text-bf-like`}
          >
            {copy.experience.like}
            <span aria-hidden="true">· {comment.likes}</span>
          </button>
          {onReply ? (
            <button
              type="button"
              onClick={() => onReply(comment.id)}
              className={META_BUTTON_CLASS}
            >
              {copy.experience.reply}
            </button>
          ) : null}
          {comment.isOwn ? (
            <button
              type="button"
              onClick={() => deleteComment(postId, comment.id)}
              className={`${META_BUTTON_CLASS} hover:text-bf-love`}
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              {copy.experience.delete}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function BookfaceComments({ postId }: BookfaceCommentsProps) {
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

  const placeholder = replyTo
    ? copy.experience.bfWriteReply
    : copy.experience.bfWriteComment;

  return (
    <section
      aria-label={copy.experience.bfCommentsRegion}
      className="border-t border-bf-border pb-2"
    >
      <div className="flex items-center gap-1 px-4 pt-2">
        <h3 className="sr-only">{copy.experience.bfCommentsTitle}</h3>
        {BOOKFACE_COMMENT_SORT_OPTIONS.map((option) => {
          const active = commentSort === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setCommentSort(option.id)}
              aria-pressed={active}
              className={`min-h-11 rounded-lg px-2 text-[13px] font-semibold transition-colors ${
                active
                  ? "bg-bf-chip text-bf-text"
                  : "text-bf-muted hover:bg-bf-hover"
              }`}
            >
              {copy.experience[option.labelKey]}
            </button>
          );
        })}
      </div>

      <BookfaceCommentComposer
        postId={postId}
        parentId={replyTo}
        onPosted={() => setReplyTo(undefined)}
        placeholder={placeholder}
      />

      <ul className="px-4">
        {groupedComments.roots.map((comment) => {
          const replies = groupedComments.replies.get(comment.id) ?? [];
          return (
            <li key={comment.id}>
              <CommentItem
                comment={comment}
                postId={postId}
                onReply={setReplyTo}
              />
              {replies.length > 0 ? (
                <ul className="pl-10">
                  {replies.map((reply) => (
                    <li key={reply.id}>
                      <CommentItem comment={reply} postId={postId} />
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
