import type { FeedComment } from "../../data/openFeedPosts";
import type { LocalizedText } from "../../types";

export const FEED_NAV = {
  HOME: "home",
  EXPLORE: "explore",
  ALERTS: "alerts",
  SAVED: "saved",
  PROFILE: "profile",
} as const;

export type FeedNav = (typeof FEED_NAV)[keyof typeof FEED_NAV];

export const COMMENT_SORT = {
  FEATURED: "featured",
  RECENT: "recent",
} as const;

export type CommentSort =
  (typeof COMMENT_SORT)[keyof typeof COMMENT_SORT];

export type AlertItem = {
  id: string;
  kind: "reply" | "verified" | "challenge";
  text: LocalizedText;
  at: string;
  postId?: string;
};

export type DraftComment = {
  postId: string;
  body: string;
  parentId?: string;
};

export type CommentsMap = Record<string, FeedComment[]>;

