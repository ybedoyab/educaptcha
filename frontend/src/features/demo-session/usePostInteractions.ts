import type { OpenFeedPost } from "../../data/openFeedPosts";
import {
  OPEN_FEED_ACTION,
  OPEN_FEED_IDS,
  OPEN_FEED_MESSAGES,
} from "../../components/openfeed/openFeed.constants";
import { useDemoSession } from "./DemoSessionProvider";

/**
 * Shared post interaction behaviour for OpenFeed and Bookface cards.
 * Skins keep their own markup; this centralizes liked/saved/counts/locks.
 */
export function usePostInteractions(post: OpenFeedPost) {
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
    riskInteractionLocked,
  } = useDemoSession();

  const shareKey = OPEN_FEED_IDS.pendingAction(OPEN_FEED_ACTION.share, post.id);
  const imageKey = OPEN_FEED_IDS.pendingAction(
    OPEN_FEED_ACTION.repostImage,
    post.id,
  );

  const shareBusy = pendingActionKey === shareKey;
  const imageBusy = pendingActionKey === imageKey;
  const interactionLocked = riskInteractionLocked;

  const commentCount = (comments[post.id] ?? []).length;
  const isLiked = liked.has(post.id);
  const isSaved = saved.has(post.id);
  const isHighlighted = highlightedPostId === post.id;
  const shareCount = shareCounts[post.id] ?? post.shares;
  const showReturn =
    flow.status === "return-to-context" && flow.intent.postId === post.id;
  const hasMedia = Boolean(post.mediaAssetId || post.imageSrc);
  const canVerify = Boolean(post.triggerSkill || post.mediaAssetId);

  const handleShare = () => {
    if (interactionLocked) return;
    requestShare(post, OPEN_FEED_IDS.share(post.id));
  };

  const handleImage = () => {
    if (!hasMedia || interactionLocked) return;
    requestRepostImage(post, OPEN_FEED_IDS.repostImage(post.id));
  };

  const handleVerify = () => {
    setToast(OPEN_FEED_MESSAGES.verifyAcknowledgement);
  };

  const handleLike = () => toggleLike(post.id);
  const handleSave = () => toggleSave(post.id);
  const handleComment = () => setSelectedPostId(post.id);

  return {
    commentCount,
    isLiked,
    isSaved,
    isHighlighted,
    shareCount,
    /** Alias used by the Y skin ("repost count"). */
    repostCount: shareCount,
    showReturn,
    hasMedia,
    canVerify,
    shareBusy,
    imageBusy,
    /** Global: any interactive risk analyze locks all share/image/comment. */
    interactionLocked,
    shareLocked: interactionLocked,
    imageLocked: interactionLocked,
    handleShare,
    handleRepost: handleShare,
    handleImage,
    handleVerify,
    handleLike,
    handleSave,
    handleComment,
    ids: {
      post: OPEN_FEED_IDS.post(post.id),
      comment: OPEN_FEED_IDS.comment(post.id),
      share: OPEN_FEED_IDS.share(post.id),
      save: OPEN_FEED_IDS.save(post.id),
      verify: OPEN_FEED_IDS.verify(post.id),
      repostImage: OPEN_FEED_IDS.repostImage(post.id),
    },
  };
}
