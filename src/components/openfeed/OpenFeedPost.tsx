import { Heart, MessageCircle, Bookmark, Share2, Link2 } from "lucide-react";
import type { OpenFeedPost } from "../../data/openFeedPosts";
import { useDemoSession } from "../../context/DemoSessionContext";
import { useI18n } from "../../i18n/I18nContext";
import { DemoPhoto } from "../minigames/DemoPhoto";

interface Props {
  post: OpenFeedPost;
  expanded?: boolean;
}

export function OpenFeedPost({ post, expanded }: Props) {
  const { language, copy } = useI18n();
  const {
    liked,
    saved,
    toggleLike,
    toggleSave,
    tryAction,
    setSelectedPostId,
    setToast,
    comments,
  } = useDemoSession();

  const commentCount = (comments[post.id] ?? []).length;
  const isLiked = liked.has(post.id);
  const isSaved = saved.has(post.id);

  const onShare = () => {
    const triggered = tryAction("share", post, `share-${post.id}`);
    if (!triggered) {
      setToast(
        language === "es" ? "Compartido (simulado)" : "Shared (simulated)",
      );
    }
  };

  const onRepostImage = () => {
    if (!post.imageSrc) return;
    tryAction("repost-image", post, `repost-${post.id}`);
  };

  const onVerify = () => {
    tryAction("verify-link", post, `verify-${post.id}`);
  };

  return (
    <article
      id={`post-${post.id}`}
      className="border-b border-navy/8 bg-white px-4 py-4 transition hover:bg-navy/[0.015]"
    >
      <div className="flex gap-3">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
          style={{ background: `hsl(${post.avatarHue} 45% 42%)` }}
          aria-hidden
        >
          {post.author[language].slice(0, 1)}
        </div>
        <div className="min-w-0 flex-1">
          <header className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <h3 className="text-sm font-semibold text-navy">
              {post.author[language]}
            </h3>
            <span className="text-xs text-navy/45">{post.handle}</span>
            <span className="text-xs text-navy/35">· {post.time[language]}</span>
            <span className="rounded-md bg-navy/5 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-navy/50">
              {post.category.replace("-", " ")}
            </span>
          </header>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-navy/85">
            {post.body[language]}
          </p>

          {post.imageSrc && (
            <button
              type="button"
              onClick={onRepostImage}
              className="mt-3 block w-full overflow-hidden rounded-2xl border border-navy/10 text-left focus-visible:outline-teal"
            >
              <DemoPhoto
                src={post.imageSrc}
                alt=""
                showArchiveBadge={false}
                allowExpand={false}
                className={
                  post.mediaKind === "video"
                    ? "aspect-video object-cover"
                    : "aspect-[16/10] object-cover"
                }
              />
              {post.mediaKind === "video" && (
                <span className="sr-only">
                  {language === "es" ? "Video simulado" : "Simulated video"}
                </span>
              )}
            </button>
          )}

          <div className="mt-3 flex flex-wrap gap-1">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-sky/10 px-2 py-0.5 text-[11px] text-navy/60"
              >
                #{tag}
              </span>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-1 text-navy/55">
            <button
              type="button"
              onClick={() => toggleLike(post.id)}
              className={`inline-flex min-h-11 items-center gap-1.5 rounded-xl px-2.5 text-sm font-medium transition ${
                isLiked ? "text-teal" : "hover:bg-navy/5"
              }`}
              aria-pressed={isLiked}
            >
              <Heart
                className={`h-4 w-4 ${isLiked ? "fill-teal" : ""}`}
                aria-hidden
              />
              {post.reactions + (isLiked ? 1 : 0)}
              <span className="sr-only">{copy.experience.like}</span>
            </button>
            <button
              type="button"
              id={`comment-${post.id}`}
              onClick={() => setSelectedPostId(post.id)}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-xl px-2.5 text-sm font-medium hover:bg-navy/5"
            >
              <MessageCircle className="h-4 w-4" aria-hidden />
              {commentCount}
              <span className="sr-only">{copy.experience.comment}</span>
            </button>
            <button
              type="button"
              id={`share-${post.id}`}
              onClick={onShare}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-xl px-2.5 text-sm font-medium hover:bg-navy/5"
            >
              <Share2 className="h-4 w-4" aria-hidden />
              {post.shares}
              <span className="sr-only">{copy.experience.share}</span>
            </button>
            <button
              type="button"
              id={`save-${post.id}`}
              onClick={() => toggleSave(post.id)}
              className={`inline-flex min-h-11 items-center gap-1.5 rounded-xl px-2.5 text-sm font-medium transition ${
                isSaved ? "text-amber" : "hover:bg-navy/5"
              }`}
              aria-pressed={isSaved}
            >
              <Bookmark
                className={`h-4 w-4 ${isSaved ? "fill-amber" : ""}`}
                aria-hidden
              />
              <span className="sr-only">{copy.experience.save}</span>
            </button>
            {post.triggerSkill && (
              <button
                type="button"
                id={`verify-${post.id}`}
                onClick={onVerify}
                className="inline-flex min-h-11 items-center gap-1.5 rounded-xl px-2.5 text-sm font-medium text-teal hover:bg-teal/10"
              >
                <Link2 className="h-4 w-4" aria-hidden />
                {language === "es" ? "Verificar" : "Verify"}
              </button>
            )}
          </div>

          {expanded && (
            <p className="mt-2 text-xs text-navy/40">
              {language === "es" ? "Detalle ampliado" : "Expanded detail"}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
