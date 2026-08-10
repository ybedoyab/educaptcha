import { Forward, MessageCircle, ThumbsUp } from "lucide-react";
import type { OpenFeedPost as OpenFeedPostData } from "../../../data/openFeedPosts";
import { useDemoSession } from "../../../context/DemoSessionContext";
import { useI18n } from "../../../i18n/I18nContext";
import { DemoPhoto } from "../../minigames/DemoPhoto";
import {
  OPEN_FEED_ACTION,
  OPEN_FEED_IDS,
  OPEN_FEED_MESSAGES,
} from "../../openfeed/openFeed.constants";
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
    liked,
    saved,
    toggleLike,
    toggleSave,
    requestShare,
    requestRepostImage,
    setSelectedPostId,
    setToast,
    comments,
    highlightedPostId,
    flow,
    shareCounts,
    pendingActionKey,
    lockedActionKey,
  } = useDemoSession();

  const shareKey = OPEN_FEED_IDS.pendingAction(OPEN_FEED_ACTION.share, post.id);
  const shareBusy = pendingActionKey === shareKey;
  const shareLocked = lockedActionKey === shareKey;
  const imageBusy =
    pendingActionKey ===
    OPEN_FEED_IDS.pendingAction(OPEN_FEED_ACTION.repostImage, post.id);
  const commentCount = (comments[post.id] ?? []).length;
  const isLiked = liked.has(post.id);
  const isSaved = saved.has(post.id);
  const isHighlighted = highlightedPostId === post.id;
  const shareCount = shareCounts[post.id] ?? post.shares;
  const showReturn =
    flow.status === "return-to-context" && flow.intent.postId === post.id;
  const hasMedia = Boolean(post.mediaAssetId || post.imageSrc);
  const canCheckSource = Boolean(post.triggerSkill || post.mediaAssetId);
  const articleVisibility = expanded
    ? ""
    : "[content-visibility:auto] [contain-intrinsic-size:auto_520px]";

  return (
    <article
      id={OPEN_FEED_IDS.post(post.id)}
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
        menu={
          <BookfacePostMenu
            postId={post.id}
            author={post.author[language]}
            saved={isSaved}
            onToggleSave={() => toggleSave(post.id)}
            onCheckSource={
              canCheckSource
                ? () => setToast(OPEN_FEED_MESSAGES.verifyAcknowledgement)
                : undefined
            }
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
          id={OPEN_FEED_IDS.repostImage(post.id)}
          onClick={() =>
            requestRepostImage(post, OPEN_FEED_IDS.repostImage(post.id))
          }
          aria-busy={imageBusy}
          aria-label={fillTemplate(copy.experience.inspectImage, {
            author: post.author[language],
          })}
          className="block w-full border-y border-bf-border bg-bf-chip text-left focus-visible:outline-bf-blue"
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
      />

      <div className="mx-4 border-t border-bf-border" />

      <div className="flex items-center gap-1 px-2 py-1" role="group">
        <BookfaceActionButton
          icon={ThumbsUp}
          label={copy.experience.like}
          tone="like"
          active={isLiked}
          aria-pressed={isLiked}
          onClick={() => toggleLike(post.id)}
        />
        <BookfaceActionButton
          id={OPEN_FEED_IDS.comment(post.id)}
          icon={MessageCircle}
          label={copy.experience.comment}
          tone="comment"
          onClick={() => setSelectedPostId(post.id)}
        />
        <BookfaceActionButton
          id={OPEN_FEED_IDS.share(post.id)}
          icon={Forward}
          label={copy.experience.share}
          tone="share"
          busy={shareBusy}
          locked={shareLocked}
          onClick={() => requestShare(post, OPEN_FEED_IDS.share(post.id))}
        />
      </div>

      {showReturn ? <BookfaceIntentReturnBar /> : null}

      {expanded ? (
        <span className="sr-only">{copy.experience.expandedDetail}</span>
      ) : null}
    </article>
  );
}
