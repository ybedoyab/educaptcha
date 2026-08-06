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

  if (visual === "urgent-alert") {
    return (
      <div
        className="mt-3 overflow-hidden rounded-xl border border-amber/40"
        role="img"
        aria-label={alt}
      >
        <div className="bg-gradient-to-br from-amber via-amber/70 to-navy px-4 py-8 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/90">
            Alert
          </p>
          <p className="mt-2 font-display text-2xl font-bold text-white">SHARE NOW</p>
        </div>
      </div>
    );
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
    return (
      <div
        className="mt-3 overflow-hidden rounded-xl border border-navy/10"
        role="img"
        aria-label={alt}
      >
        <svg viewBox="0 0 400 220" className="h-auto w-full" aria-hidden>
          <defs>
            <linearGradient id={`photo-${visual}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={visual === "old-photo" ? "#0EA5A4" : "#38BDF8"} />
              <stop offset="55%" stopColor="#0F172A" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
          </defs>
          <rect width="400" height="220" fill={`url(#photo-${visual})`} />
          <rect x="40" y="50" width="160" height="100" rx="8" fill="rgba(248,250,252,0.2)" />
          <circle cx="300" cy="80" r="36" fill="rgba(248,250,252,0.25)" />
          <path
            d="M40 180 Q140 120 220 160 T360 140"
            stroke="rgba(248,250,252,0.45)"
            strokeWidth="8"
            fill="none"
          />
          {visual === "old-photo" && (
            <text x="16" y="28" fill="rgba(248,250,252,0.75)" fontSize="14" fontWeight="700">
              ARCHIVE LOOK
            </text>
          )}
        </svg>
      </div>
    );
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
          <p className="truncate text-xs text-navy/50">
            {post.handle} · {post.time[language]}
          </p>
        </div>
      </header>

      <p className="mt-3 text-sm leading-relaxed text-navy">{body}</p>
      <PostVisual visual={post.visual} alt={body} />

          <div className="mt-3 flex flex-wrap gap-3 text-xs text-navy/50">
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
