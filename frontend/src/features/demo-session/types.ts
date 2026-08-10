import type { ReactNode } from "react";
import type { OpenFeedPost } from "../../data/openFeedPosts";
import type {
  DemoFlowState,
  OutcomeRecord,
} from "../../lib/demoFlow";
import type { ActionDecision } from "../../lib/LearningTriggerEngine";
import type { MaybeAsync } from "../../lib/risk/riskSource";
import type { LocalizedText } from "../../types";
import type { ChallengeResult } from "../../types/minigame";
import type {
  AlertItem,
  CommentSort,
  CommentsMap,
  DraftComment,
  FeedNav,
} from "../../components/openfeed/openFeed.types";
import type { OPEN_FEED_MESSAGES } from "../../components/openfeed/openFeed.constants";

export type { FeedNav } from "../../components/openfeed/openFeed.types";

export type ToastValue = LocalizedText | null;

/**
 * Copy the session itself emits (toasts, the scenario banner, the alert it
 * appends). Each skin sends the same events but names the action differently —
 * Y "reposts", Bookface "shares" — so the strings are a provider input rather
 * than a constant. Pass a module-level object; it is spread into the defaults.
 */
export type DemoSessionMessages = Partial<typeof OPEN_FEED_MESSAGES>;

export type DemoSessionValue = {
  posts: OpenFeedPost[];
  nav: FeedNav;
  setNav: (n: FeedNav) => void;
  query: string;
  setQuery: (q: string) => void;
  clearSearch: () => void;
  filteredPosts: OpenFeedPost[];
  liked: Set<string>;
  saved: Set<string>;
  toggleLike: (id: string) => void;
  toggleSave: (id: string) => void;
  comments: CommentsMap;
  likeComment: (postId: string, commentId: string) => void;
  deleteComment: (postId: string, commentId: string) => void;
  commentSort: CommentSort;
  setCommentSort: (s: CommentSort) => void;
  flow: DemoFlowState;
  draftComment: DraftComment | null;
  highlightedPostId: string | null;
  scenarioGuide: LocalizedText | null;
  guidedScenarioId: string | null;
  shareCounts: Record<string, number>;
  introSeen: boolean;
  setIntroSeen: (seen: boolean) => void;
  toast: ToastValue;
  setToast: (t: LocalizedText | string | null) => void;
  selectedPostId: string | null;
  setSelectedPostId: (id: string | null) => void;
  focusReturnId: string | null;
  clearFocusReturn: () => void;
  loading: boolean;
  /**
   * Immediate lock for the action/post while a remote risk check is in flight.
   * Set before the network call; prevents a second click from running local
   * share/intercept while the first request is still pending.
   */
  lockedActionKey: string | null;
  /**
   * True while ANY interactive remote risk analyze is in flight. All share /
   * image / comment controls should disable for the duration.
   */
  riskInteractionLocked: boolean;
  /**
   * `"share:p-flood-live"` while an external risk check is in flight for that
   * control, after a short grace delay. Null when unset or when the decision
   * was local (and therefore instant). Drives a per-button spinner only —
   * never a feed-level or overlay state.
   */
  pendingActionKey: string | null;
  outcomes: OutcomeRecord[];
  alerts: AlertItem[];
  launchScenario: (scenarioId: string) => OpenFeedPost | null;
  requestShare: (
    post: OpenFeedPost,
    returnElementId: string,
  ) => MaybeAsync<ActionDecision>;
  requestComment: (
    postId: string,
    body: string,
    parentId: string | undefined,
    returnElementId: string,
  ) => MaybeAsync<ActionDecision | null>;
  requestRepostImage: (
    post: OpenFeedPost,
    returnElementId: string,
  ) => MaybeAsync<ActionDecision>;
  commitComment: (postId: string, body: string, parentId?: string) => void;
  resolvePendingIntent: (
    choice: "confirm" | "cancel" | "edit" | "open-source",
  ) => void;
  completeChallenge: (result: ChallengeResult) => void;
  skipChallenge: () => void;
  beginChallenge: () => void;
  isGuidedAction: (post: OpenFeedPost) => boolean;
};

export type DemoSessionProviderProps = {
  children: ReactNode;
  messages?: DemoSessionMessages;
};
