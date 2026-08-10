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
    postVerification,
    flow,
    shareCounts,
    justSharedPostId,
    pendingActionKey,
    lockedActionKey,
  } = useDemoSession();

  const shareKey = OPEN_FEED_IDS.pendingAction(OPEN_FEED_ACTION.share, post.id);
  const imageKey = OPEN_FEED_IDS.pendingAction(
    OPEN_FEED_ACTION.repostImage,
    post.id,
  );

  const shareBusy = pendingActionKey === shareKey;
  const imageBusy = pendingActionKey === imageKey;
  /** This post already shared once in the session (count is base+1). */
  const hasShared = shareCounts[post.id] != null;
  /** Only lock the control that owns the in-flight analyze — not the whole feed. */
  const sharePending =
    lockedActionKey === shareKey || pendingActionKey === shareKey;
  const imagePending =
    lockedActionKey === imageKey || pendingActionKey === imageKey;

  const commentCount = (comments[post.id] ?? []).length;
  const isLiked = liked.has(post.id);
  const isSaved = saved.has(post.id);
  const isHighlighted = highlightedPostId === post.id;
  const checkStatus = postVerification[post.id] ?? null;
  const shareCount = shareCounts[post.id] ?? post.shares;
  const showReturn =
    flow.status === "return-to-context" && flow.intent.postId === post.id;
  const hasMedia = Boolean(post.mediaAssetId || post.imageSrc);
  const canVerify = Boolean(post.triggerSkill || post.mediaAssetId);
  const justShared = justSharedPostId === post.id;

  const handleShare = () => {
    // Keep the control usable so cooldown / remote retries can run; incrementShare
    // itself is once-only so the visible count never climbs past base+1.
    if (sharePending || showReturn) return;
    requestShare(post, OPEN_FEED_IDS.share(post.id));
  };

  const handleImage = () => {
    if (!hasMedia || imagePending) return;
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
    checkStatus,
    shareCount,
    /** Alias used by the Y skin ("repost count"). */
    repostCount: shareCount,
    hasShared,
    justShared,
    showReturn,
    hasMedia,
    canVerify,
    shareBusy,
    imageBusy,
    shareLocked: sharePending || showReturn,
    imageLocked: imagePending,
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
