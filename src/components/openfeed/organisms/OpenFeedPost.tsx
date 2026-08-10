import type { OpenFeedPost as OpenFeedPostData } from "../../../data/openFeedPosts";
import { useDemoSession } from "../../../context/DemoSessionContext";
import { useI18n } from "../../../i18n/I18nContext";
import { DemoPhoto } from "../../minigames/DemoPhoto";
import { FeedAvatar } from "../atoms/FeedAvatar";
import { IntentReturnBar } from "../molecules/IntentReturnBar";
import { PostActions } from "../molecules/PostActions";
import { PostMeta } from "../molecules/PostMeta";
import {
  OPEN_FEED_ACTION,
  OPEN_FEED_IDS,
  OPEN_FEED_MESSAGES,
} from "../openFeed.constants";

interface OpenFeedPostProps {
  post: OpenFeedPostData;
  expanded?: boolean;
}

export function OpenFeedPost({ post, expanded = false }: OpenFeedPostProps) {
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
  const repostImageBusy =
    pendingActionKey ===
    OPEN_FEED_IDS.pendingAction(OPEN_FEED_ACTION.repostImage, post.id);
  const commentCount = (comments[post.id] ?? []).length;
  const isLiked = liked.has(post.id);
  const isSaved = saved.has(post.id);
  const isHighlighted = highlightedPostId === post.id;
  const repostCount = shareCounts[post.id] ?? post.shares;
  const showReturn =
    flow.status === "return-to-context" && flow.intent.postId === post.id;
  const hasMedia = Boolean(post.mediaAssetId || post.imageSrc);
  const canVerify = Boolean(post.triggerSkill || post.mediaAssetId);
  const articleVisibility = expanded
    ? ""
    : "[content-visibility:auto] [contain-intrinsic-size:auto_420px]";

  const handleRepost = () => {
    requestShare(post, OPEN_FEED_IDS.share(post.id));
  };

  const handleImage = () => {
    if (!hasMedia) return;
    requestRepostImage(post, OPEN_FEED_IDS.repostImage(post.id));
  };

  const handleVerify = () => {
    setToast(OPEN_FEED_MESSAGES.verifyAcknowledgement);
  };

  const inspectImageLabel = copy.experience.inspectImage.replace(
    "{author}",
    post.author[language],
  );

  return (
    <article
      id={OPEN_FEED_IDS.post(post.id)}
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
              id={OPEN_FEED_IDS.repostImage(post.id)}
              onClick={handleImage}
              aria-busy={repostImageBusy}
              aria-label={inspectImageLabel}
              className="mt-3 block w-full overflow-hidden rounded-2xl border border-social-border bg-social-surface text-left focus-visible:outline-social-blue"
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
              comment: OPEN_FEED_IDS.comment(post.id),
              repost: OPEN_FEED_IDS.share(post.id),
              save: OPEN_FEED_IDS.save(post.id),
              verify: OPEN_FEED_IDS.verify(post.id),
            }}
            onComment={() => setSelectedPostId(post.id)}
            onRepost={handleRepost}
            onLike={() => toggleLike(post.id)}
            onSave={() => toggleSave(post.id)}
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

