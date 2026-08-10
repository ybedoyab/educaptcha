import { Forward, MessageCircle, ThumbsUp } from "lucide-react";
import type { OpenFeedPost as OpenFeedPostData } from "../../../data/openFeedPosts";
import { usePostInteractions } from "../../../features/demo-session";
import { useI18n } from "../../../i18n/I18nContext";
import { DemoPhoto } from "../../minigames/DemoPhoto";
import { PostVerificationTrail } from "../../experience/PostVerificationTrail";
import { BookfaceActionButton } from "../atoms/BookfaceActionButton";
import { BookfaceEngagementBar } from "../molecules/BookfaceEngagementBar";
import { BookfaceIntentReturnBar } from "../molecules/BookfaceIntentReturnBar";
import { BookfacePostHeader } from "../molecules/BookfacePostHeader";
import { BookfacePostMenu } from "../molecules/BookfacePostMenu";
import { fillTemplate } from "../bookface.utils";

interface BookfacePostProps {
  post: OpenFeedPostData;
  expanded?: boolean;
}

/**
 * A Bookface feed card. Behaviourally identical to `OpenFeedPost` — same
 * session calls, same element ids — so the intercept pipeline, focus return and
 * transfer highlighting work on this skin without any pipeline changes.
 */
export function BookfacePost({ post, expanded = false }: BookfacePostProps) {
  const { language, copy } = useI18n();
  const {
    commentCount,
    isLiked,
    isSaved,
    isHighlighted,
    checkStatus,
    shareCount,
    showReturn,
    hasMedia,
    canVerify,
    shareBusy,
    shareLocked,
    imageBusy,
    imageLocked,
    hasShared,
    justShared,
    handleShare,
    handleImage,
    handleVerify,
    handleLike,
    handleSave,
    handleComment,
    ids,
  } = usePostInteractions(post);

  const articleVisibility = expanded
    ? ""
    : "[content-visibility:auto] [contain-intrinsic-size:auto_520px]";

  return (
    <article
      id={ids.post}
      tabIndex={-1}
      className={`bg-white ${articleVisibility} ${
        expanded ? "" : "shadow-sm sm:rounded-lg"
      } ${isHighlighted ? "ring-2 ring-inset ring-bf-blue" : ""}`}
    >
      <BookfacePostHeader
        author={post.author[language]}
        handle={post.handle}
        time={post.time[language]}
        hue={post.avatarHue}
        highlighted={isHighlighted}
        highlightedLabel={copy.experience.highlighted}
        checkStatus={checkStatus}
        misleadingLabel={copy.experience.verifiedBadge}
        menu={
          <BookfacePostMenu
            postId={post.id}
            author={post.author[language]}
            saved={isSaved}
            onToggleSave={handleSave}
            onCheckSource={canVerify ? handleVerify : undefined}
          />
        }
      />

      <p className="whitespace-pre-wrap px-4 pb-3 pt-2 text-[15px] leading-5 text-bf-text">
        {post.body[language]}
      </p>

      {post.tags.length > 0 ? (
        <p className="px-4 pb-3 text-[15px] leading-5">
          {post.tags.map((tag) => (
            <span key={tag} className="mr-2 text-bf-blue">
              #{tag}
            </span>
          ))}
        </p>
      ) : null}

      {hasMedia ? (
        <button
          type="button"
          id={ids.repostImage}
          onClick={handleImage}
          disabled={imageLocked}
          aria-disabled={imageLocked || undefined}
          aria-busy={imageBusy || undefined}
          aria-label={fillTemplate(copy.experience.inspectImage, {
            author: post.author[language],
          })}
          className={`block w-full border-y border-bf-border bg-bf-chip text-left focus-visible:outline-bf-blue ${
            imageLocked ? "cursor-not-allowed opacity-60" : ""
          }`}
        >
          <DemoPhoto
            assetId={post.mediaAssetId}
            src={post.imageSrc}
            alt={post.body[language]}
            radiusClassName="rounded-none"
            showArchiveBadge={false}
          />
        </button>
      ) : null}

      <BookfaceEngagementBar
        reactionCount={post.reactions + (isLiked ? 1 : 0)}
        commentCount={commentCount}
        shareCount={shareCount}
        sharePulse={justShared}
      />

      <div className="mx-4 border-t border-bf-border" />

      <div className="flex items-center gap-1 px-2 py-1" role="group">
        <BookfaceActionButton
          icon={ThumbsUp}
          label={copy.experience.like}
          tone="like"
          active={isLiked}
          aria-pressed={isLiked}
          onClick={handleLike}
        />
        <BookfaceActionButton
          id={ids.comment}
          icon={MessageCircle}
          label={copy.experience.comment}
          tone="comment"
          onClick={handleComment}
        />
        <BookfaceActionButton
          id={ids.share}
          icon={Forward}
          label={copy.experience.share}
          tone="share"
          active={hasShared}
          busy={shareBusy}
          locked={shareLocked}
          animatePop={justShared}
          onClick={handleShare}
        />
      </div>

      {showReturn ? <BookfaceIntentReturnBar /> : null}

      {checkStatus ? (
        <PostVerificationTrail
          post={post}
          status={checkStatus}
          skin="bookface"
        />
      ) : null}

      {expanded ? (
        <span className="sr-only">{copy.experience.expandedDetail}</span>
      ) : null}
    </article>
  );
}
