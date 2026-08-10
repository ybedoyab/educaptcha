import type { OpenFeedPost as OpenFeedPostData } from "../../../data/openFeedPosts";
import { usePostInteractions } from "../../../features/demo-session";
import { useI18n } from "../../../i18n/I18nContext";
import { DemoPhoto } from "../../minigames/DemoPhoto";
import { FeedAvatar } from "../atoms/FeedAvatar";
import { IntentReturnBar } from "../molecules/IntentReturnBar";
import { PostActions } from "../molecules/PostActions";
import { PostMeta } from "../molecules/PostMeta";

interface OpenFeedPostProps {
  post: OpenFeedPostData;
  expanded?: boolean;
}

export function OpenFeedPost({ post, expanded = false }: OpenFeedPostProps) {
  const { language, copy } = useI18n();
  const {
    commentCount,
    isLiked,
    isSaved,
    isHighlighted,
    repostCount,
    showReturn,
    hasMedia,
    canVerify,
    shareBusy,
    shareLocked,
    imageBusy,
    imageLocked,
    handleRepost,
    handleImage,
    handleVerify,
    handleLike,
    handleSave,
    handleComment,
    ids,
  } = usePostInteractions(post);

  const articleVisibility = expanded
    ? ""
    : "[content-visibility:auto] [contain-intrinsic-size:auto_420px]";

  const inspectImageLabel = copy.experience.inspectImage.replace(
    "{author}",
    post.author[language],
  );

  return (
    <article
      id={ids.post}
      tabIndex={-1}
      className={`border-b border-social-border bg-white px-4 py-3 transition-colors hover:bg-social-text/[0.015] ${articleVisibility} ${
        isHighlighted ? "bg-social-blue/[0.035] ring-2 ring-inset ring-social-blue" : ""
      }`}
    >
      <div className="flex gap-3">
        <FeedAvatar
          author={post.author[language]}
          hue={post.avatarHue}
        />
        <div className="min-w-0 flex-1">
          <PostMeta
            author={post.author[language]}
            handle={post.handle}
            time={post.time[language]}
            highlighted={isHighlighted}
            highlightedLabel={copy.experience.highlighted}
          />
          <p className="whitespace-pre-wrap text-[15px] leading-5 text-social-text">
            {post.body[language]}
          </p>

          {hasMedia ? (
            <button
              type="button"
              id={ids.repostImage}
              onClick={handleImage}
              disabled={imageLocked}
              aria-disabled={imageLocked || undefined}
              aria-busy={imageBusy || undefined}
              aria-label={inspectImageLabel}
              className={`mt-3 block w-full overflow-hidden rounded-2xl border border-social-border bg-social-surface text-left focus-visible:outline-social-blue ${
                imageLocked ? "cursor-not-allowed opacity-60" : ""
              }`}
            >
              <DemoPhoto
                assetId={post.mediaAssetId}
                src={post.imageSrc}
                alt={post.body[language]}
                showArchiveBadge={false}
              />
            </button>
          ) : null}

          {post.tags.length > 0 ? (
            <div className="mt-2 text-[15px] leading-5">
              {post.tags.map((tag) => (
                <span key={tag} className="mr-2 text-social-blue hover:underline">
                  #{tag}
                </span>
              ))}
            </div>
          ) : null}

          {showReturn ? <IntentReturnBar /> : null}

          <PostActions
            commentCount={commentCount}
            reactionCount={post.reactions + (isLiked ? 1 : 0)}
            repostCount={repostCount}
            liked={isLiked}
            saved={isSaved}
            repostBusy={shareBusy}
            repostLocked={shareLocked}
            labels={{
              comment: copy.experience.comment,
              repost: copy.experience.repost,
              like: copy.experience.like,
              save: copy.experience.save,
              verify: copy.experience.verify,
            }}
            ids={{
              comment: ids.comment,
              repost: ids.share,
              save: ids.save,
              verify: ids.verify,
            }}
            onComment={handleComment}
            onRepost={handleRepost}
            onLike={handleLike}
            onSave={handleSave}
            onVerify={canVerify ? handleVerify : undefined}
          />

          {expanded ? (
            <span className="sr-only">{copy.experience.expandedDetail}</span>
          ) : null}
        </div>
      </div>
    </article>
  );
}
