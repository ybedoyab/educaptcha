import type { OpenFeedPost } from "../../data/openFeedPosts";
import {
  COMMENT_SORT,
  FEED_NAV,
  type CommentSort,
  type FeedNav,
} from "./openFeed.types";
import type { FeedComment } from "../../data/openFeedPosts";

type FeedFilter = (post: OpenFeedPost, saved: ReadonlySet<string>) => boolean;
type FeedComparator = (left: OpenFeedPost, right: OpenFeedPost) => number;

const INCLUDE_POST: FeedFilter = () => true;
const KEEP_ORDER: FeedComparator = () => 0;

const NAV_FILTERS: Record<FeedNav, FeedFilter> = {
  [FEED_NAV.HOME]: INCLUDE_POST,
  [FEED_NAV.EXPLORE]: (post) =>
    post.tone !== "manipulative" || post.category === "science",
  [FEED_NAV.ALERTS]: INCLUDE_POST,
  [FEED_NAV.SAVED]: (post, saved) => saved.has(post.id),
  [FEED_NAV.PROFILE]: (post) =>
    post.tone === "official" || post.mediaKind === "thread",
};

const NAV_COMPARATORS: Record<FeedNav, FeedComparator> = {
  [FEED_NAV.HOME]: KEEP_ORDER,
  [FEED_NAV.EXPLORE]: (left, right) => right.reactions - left.reactions,
  [FEED_NAV.ALERTS]: KEEP_ORDER,
  [FEED_NAV.SAVED]: KEEP_ORDER,
  [FEED_NAV.PROFILE]: KEEP_ORDER,
};

const COMMENT_COMPARATORS: Record<
  CommentSort,
  (left: FeedComment, right: FeedComment) => number
> = {
  [COMMENT_SORT.FEATURED]: (left, right) => right.likes - left.likes,
  [COMMENT_SORT.RECENT]: (left, right) =>
    new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
};

function matchesQuery(post: OpenFeedPost, query: string): boolean {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return true;

  const searchableText = [
    post.author.en,
    post.author.es,
    post.handle,
    post.body.en,
    post.body.es,
    post.category,
    ...post.tags,
  ]
    .join(" ")
    .toLowerCase();

  return searchableText.includes(normalizedQuery);
}

export function selectVisiblePosts(
  posts: readonly OpenFeedPost[],
  nav: FeedNav,
  saved: ReadonlySet<string>,
  query: string,
): OpenFeedPost[] {
  return posts
    .filter((post) => NAV_FILTERS[nav](post, saved))
    .filter((post) => matchesQuery(post, query))
    .sort(NAV_COMPARATORS[nav]);
}

export function sortComments(
  comments: readonly FeedComment[],
  sort: CommentSort,
): FeedComment[] {
  return [...comments].sort(COMMENT_COMPARATORS[sort]);
}
