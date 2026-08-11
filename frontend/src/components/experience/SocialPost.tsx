import {
  Bookmark,
  Heart,
  MessageCircle,
  Share2,
} from "lucide-react";
import type { Language } from "../../types";
import type { FeedPostData } from "../../types/learning";
import { useI18n } from "../../i18n/I18nContext";

interface SocialPostProps {
  post: FeedPostData;
  language: Language;
  highlighted?: boolean;
  liked?: boolean;
  saved?: boolean;
  transferMode?: boolean;
  onShare: (postId: string) => void;
  onLike: (postId: string) => void;
  onSave: (postId: string) => void;
  onComment: (postId: string) => void;
  onVerify?: () => void;
  onShareImmediate?: () => void;
  showTransferActions?: boolean;
  verifyLabel?: string;
  shareImmediateLabel?: string;
}

function PostVisual({
  visual,
  alt,
}: {
  visual: FeedPostData["visual"];
  alt: string;
}) {
  if (visual === "neutral") return null;

  if (visual === "old-photo" || visual === "reused-photo") {
    return null;
  }

  if (visual === "urgent-alert") {
    return null;
  }

  if (visual === "subtle-warn") {
    return (
      <div
        className="mt-3 overflow-hidden rounded-xl border border-navy/10"
        role="img"
        aria-label={alt}
      >
        <div className="bg-gradient-to-r from-navy via-teal/80 to-sky px-4 py-10">
          <div className="mx-auto h-16 w-16 rounded-full border-2 border-white/40 bg-white/10" />
        </div>
      </div>
    );
  }

  if (visual === "old-photo" || visual === "reused-photo") {
    return null;
  }

  return null;
}

export function SocialPost({
  post,
  language,
  highlighted,
  liked,
  saved,
  transferMode,
  onShare,
  onLike,
  onSave,
  onComment,
  onVerify,
  onShareImmediate,
  showTransferActions,
  verifyLabel,
  shareImmediateLabel,
}: SocialPostProps) {
  const { copy } = useI18n();
  const body = post.body[language];

  return (
    <article
      id={`post-${post.id}`}
      className={`rounded-2xl border bg-white p-4 transition ${
        highlighted
          ? "border-teal shadow-[0_0_0_3px_rgba(14,165,164,0.2)]"
          : "border-navy/8"
      }`}
    >
      <header className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-sky to-teal text-sm font-bold text-white"
          aria-hidden
        >
          {post.author[language].slice(0, 1)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-navy">
            {post.author[language]}
          </p>
          <p className="truncate text-xs text-navy/70">
            {post.handle} · {post.time[language]}
          </p>
        </div>
      </header>

      <p className="mt-3 text-sm leading-relaxed text-navy">{body}</p>
      <PostVisual visual={post.visual} alt={body} />
      {(post.visual === "old-photo" || post.visual === "reused-photo") && (
        <img
          src={
            post.visual === "old-photo"
              ? "/demo-assets/photos/flood-lagos-2019.jpg"
              : "/demo-assets/photos/flood-response-2015.jpg"
          }
          alt={body}
          className="mt-3 aspect-video w-full rounded-xl object-cover"
        />
      )}
      {post.visual === "urgent-alert" && (
        <img
          src="/demo-assets/viral-health-alert.svg"
          alt={body}
          className="mt-3 aspect-video w-full rounded-xl object-cover"
        />
      )}

          <div className="mt-3 flex flex-wrap gap-3 text-xs text-navy/70">
            <span>
              {post.reactions.toLocaleString()} {copy.experience.like.toLowerCase()}
            </span>
            <span>
              {post.comments} {copy.experience.comment.toLowerCase()}
            </span>
            <span>
              {post.shares} {copy.experience.share.toLowerCase()}
            </span>
          </div>

      <div className="mt-3 grid grid-cols-4 gap-1 border-t border-navy/8 pt-2">
        <button
          type="button"
          onClick={() => onLike(post.id)}
          className={`inline-flex min-h-10 items-center justify-center gap-1 rounded-lg text-xs font-medium transition hover:bg-navy/5 ${
            liked ? "text-teal" : "text-navy/70"
          }`}
          aria-pressed={liked}
        >
          <Heart className={`h-4 w-4 ${liked ? "fill-teal" : ""}`} aria-hidden />
          <span className="hidden sm:inline">{copy.experience.like}</span>
        </button>
        <button
          type="button"
          onClick={() => onComment(post.id)}
          className="inline-flex min-h-10 items-center justify-center gap-1 rounded-lg text-xs font-medium text-navy/70 transition hover:bg-navy/5"
        >
          <MessageCircle className="h-4 w-4" aria-hidden />
          <span className="hidden sm:inline">{copy.experience.comment}</span>
        </button>
        <button
          type="button"
          onClick={() => onShare(post.id)}
          disabled={transferMode && post.isTransferTarget}
          className="inline-flex min-h-10 items-center justify-center gap-1 rounded-lg text-xs font-medium text-navy/70 transition hover:bg-navy/5 disabled:cursor-default"
        >
          <Share2 className="h-4 w-4" aria-hidden />
          <span className="hidden sm:inline">{copy.experience.share}</span>
        </button>
        <button
          type="button"
          onClick={() => onSave(post.id)}
          className={`inline-flex min-h-10 items-center justify-center gap-1 rounded-lg text-xs font-medium transition hover:bg-navy/5 ${
            saved ? "text-amber" : "text-navy/70"
          }`}
          aria-pressed={saved}
        >
          <Bookmark className={`h-4 w-4 ${saved ? "fill-amber" : ""}`} aria-hidden />
          <span className="hidden sm:inline">{copy.experience.save}</span>
        </button>
      </div>

      {showTransferActions && post.isTransferTarget && (
        <div className="mt-4 animate-slide-up space-y-2 rounded-xl border border-teal/30 bg-teal/5 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-teal">
            {copy.experience.applyHint}
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={onVerify}
              className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl bg-teal px-3 py-2 text-sm font-semibold text-white"
            >
              {verifyLabel}
            </button>
            <button
              type="button"
              onClick={onShareImmediate}
              className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl border border-navy/15 bg-white px-3 py-2 text-sm font-semibold text-navy"
            >
              {shareImmediateLabel}
            </button>
          </div>
        </div>
      )}
    </article>
  );
}
