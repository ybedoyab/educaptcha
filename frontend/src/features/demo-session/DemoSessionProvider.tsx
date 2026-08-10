import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { openFeedPosts, type FeedComment } from "../../data/openFeedPosts";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import {
  demoFlowReducer,
  initialDemoFlowState,
  type PendingIntent,
} from "../../lib/demoFlow";
import {
  createTriggerEngine,
  isAffirmingComment,
  type ActionDecision,
} from "../../lib/LearningTriggerEngine";
import {
  postOutcome,
  prefetchRisk,
  riskApiBase,
  riskSessionId,
} from "../../lib/risk/riskClient";
import { isPromise, type MaybeAsync } from "../../lib/risk/riskSource";
import { useI18n } from "../../i18n/I18nContext";
import type { LocalizedText } from "../../types";
import type { ChallengeResult } from "../../types/minigame";
import {
  COMMENT_SORT,
  FEED_NAV,
  type CommentSort,
  type CommentsMap,
  type DraftComment,
  type FeedNav,
} from "../../components/openfeed/openFeed.types";
import type { AlertItem } from "../../components/openfeed/openFeed.types";
import {
  OPEN_FEED_ACTION,
  OPEN_FEED_IDS,
  OPEN_FEED_MESSAGES,
  OPEN_FEED_SEED_ALERTS,
  OPEN_FEED_SKIPPED_RESULT,
  OPEN_FEED_STORAGE_KEYS,
} from "../../components/openfeed/openFeed.constants";
import { OPEN_FEED_ERRORS } from "../../components/openfeed/openFeed.errors";
import { selectVisiblePosts } from "../../components/openfeed/openFeed.utils";
import {
  createDecideForPost,
  isRiskInteractionBlocked,
} from "./decideForPost";
import { seedComments, toToast, transferReason } from "./helpers";
import type {
  DemoSessionProviderProps,
  DemoSessionValue,
} from "./types";

export type { FeedNav } from "./types";
export type { DemoSessionMessages, DemoSessionValue } from "./types";

const DemoSessionContext = createContext<DemoSessionValue | null>(null);

export function DemoSessionProvider({
  children,
  messages,
}: DemoSessionProviderProps) {
  const msg = useMemo(
    () => ({ ...OPEN_FEED_MESSAGES, ...messages }),
    [messages],
  );
  const [nav, setNav] = useState<FeedNav>(FEED_NAV.HOME);
  const [query, setQuery] = useState("");
  const [liked, setLiked] = useLocalStorage<string[]>(
    OPEN_FEED_STORAGE_KEYS.liked,
    [],
  );
  const [saved, setSaved] = useLocalStorage<string[]>(
    OPEN_FEED_STORAGE_KEYS.saved,
    [],
  );
  const [comments, setComments] = useLocalStorage<CommentsMap>(
    OPEN_FEED_STORAGE_KEYS.comments,
    seedComments(),
  );
  const [commentSort, setCommentSort] = useState<CommentSort>(
    COMMENT_SORT.FEATURED,
  );
  const [alerts, setAlerts] = useState<AlertItem[]>(OPEN_FEED_SEED_ALERTS);
  const [outcomes, setOutcomes] = useLocalStorage(
    OPEN_FEED_STORAGE_KEYS.outcomes,
    [] as DemoSessionValue["outcomes"],
  );
  const [introSeen, setIntroSeen] = useLocalStorage<boolean>(
    OPEN_FEED_STORAGE_KEYS.introSeen,
    false,
  );
  const [toast, setToastState] = useState<DemoSessionValue["toast"]>(null);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [focusReturnId, setFocusReturnId] = useState<string | null>(null);
  const [draftComment, setDraftComment] = useState<DraftComment | null>(null);
  const [highlightedPostId, setHighlightedPostId] = useState<string | null>(
    null,
  );
  const [scenarioGuide, setScenarioGuide] = useState<LocalizedText | null>(
    null,
  );
  const [guidedScenarioId, setGuidedScenarioId] = useState<string | null>(
    null,
  );
  const [shareCounts, setShareCounts] = useState<Record<string, number>>({});
  const [loading] = useState(false);

  const [pendingActionKey, setPendingActionKey] = useState<string | null>(null);
  const [lockedActionKey, setLockedActionKey] = useState<string | null>(null);
  const [riskInteractionLocked, setRiskInteractionLocked] = useState(false);

  const [flow, dispatch] = useReducer(demoFlowReducer, initialDemoFlowState);
  const engineRef = useRef(createTriggerEngine());
  const recordedOutcomeKey = useRef<string | null>(null);

  const { language } = useI18n();

  // Guards for the remote path only; all are inert when the service is
  // unconfigured, because no promise is ever created.
  const flowRef = useRef(flow);
  flowRef.current = flow;
  const requestSeqRef = useRef(0);
  /** In-flight remote decisions keyed by action:postId — duplicate clicks reuse. */
  const inFlightPromisesRef = useRef<Map<string, Promise<ActionDecision>>>(
    new Map(),
  );
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const likedSet = useMemo(() => new Set(liked), [liked]);
  const savedSet = useMemo(() => new Set(saved), [saved]);

  const setToast = useCallback((t: LocalizedText | string | null) => {
    setToastState(toToast(t));
  }, []);

  const clearFocusReturn = useCallback(() => setFocusReturnId(null), []);

  const isGuidedAction = useCallback(
    (post: (typeof openFeedPosts)[number]) =>
      Boolean(guidedScenarioId && post.scenarioId === guidedScenarioId),
    [guidedScenarioId],
  );

  const filteredPosts = useMemo(
    () => selectVisiblePosts(openFeedPosts, nav, savedSet, query),
    [nav, query, savedSet],
  );

  const returnFocus = useCallback((id: string) => {
    setFocusReturnId(id);
    requestAnimationFrame(() => {
      const el = document.getElementById(id);
      el?.focus();
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }, []);

  const commitComment = useCallback(
    (postId: string, body: string, parentId?: string) => {
      const trimmed = body.trim();
      if (!trimmed) return;
      const comment: FeedComment = {
        id: `own-${Date.now()}`,
        author: "You",
        handle: "@you.demo",
        body: { en: trimmed, es: trimmed },
        createdAt: new Date().toISOString(),
        likes: 0,
        parentId,
        isOwn: true,
      };
      setComments((prev) => ({
        ...prev,
        [postId]: [...(prev[postId] ?? []), comment],
      }));
      setDraftComment((prev) =>
        prev && prev.postId === postId ? null : prev,
      );
    },
    [setComments],
  );

  const incrementShare = useCallback((postId: string) => {
    setShareCounts((prev) => ({
      ...prev,
      [postId]: (prev[postId] ?? 0) + 1,
    }));
  }, []);

  const startIntercept = useCallback(
    (decision: Extract<ActionDecision, { type: "intercept" }>) => {
      dispatch({
        type: "START_CHALLENGE",
        intent: decision.intent,
        challengeId: decision.challengeId,
        transferChallengeId: decision.transferChallengeId,
        skill: decision.skill,
        reason: decision.reason,
        transferPostId: decision.transferPostId,
      });
      dispatch({ type: "BEGIN_ACTIVE" });
      setGuidedScenarioId(null);
      setScenarioGuide(null);
    },
    [],
  );

  const maybeStartTransfer = useCallback(
    (post: (typeof openFeedPosts)[number], intent: PendingIntent): boolean => {
      if (flow.status !== "transfer-pending") return false;
      if (post.id !== flow.targetPostId && post.id !== highlightedPostId) {
        return false;
      }
      dispatch({
        type: "START_TRANSFER",
        intent,
        reason: transferReason(flow.skill),
      });
      setHighlightedPostId(post.id);
      setScenarioGuide(null);
      return true;
    },
    [flow, highlightedPostId],
  );

  const decideForPost = useMemo(
    () =>
      createDecideForPost({
        isGuidedAction,
        language,
        engineRef,
        flowRef,
        requestSeqRef,
        inFlightPromisesRef,
        mountedRef,
        setLockedActionKey,
        setPendingActionKey,
        setRiskInteractionLocked,
      }),
    [isGuidedAction, language],
  );

  const launchScenario = useCallback(
    (scenarioId: string) => {
      const post = openFeedPosts.find((p) => p.scenarioId === scenarioId);
      if (!post) {
        setToast(msg.scenarioNotFound);
        return null;
      }
      setGuidedScenarioId(scenarioId);
      setHighlightedPostId(post.id);
      setScenarioGuide(msg.scenarioGuide);
      return post;
    },
    [msg, setToast],
  );

  const requestShare = useCallback(
    (
      post: (typeof openFeedPosts)[number],
      returnElementId: string,
    ): MaybeAsync<ActionDecision> => {
      const intent: PendingIntent = {
        type: "share",
        postId: post.id,
        returnElementId,
      };

      if (maybeStartTransfer(post, intent)) {
        return {
          type: "intercept",
          challengeId:
            flow.status === "transfer-pending" ? flow.challengeId : "",
          skill: flow.status === "transfer-pending" ? flow.skill : undefined,
          reason: transferReason(
            flow.status === "transfer-pending" ? flow.skill : undefined,
          ),
          intent,
        };
      }

      const flightKey = OPEN_FEED_IDS.pendingAction(
        OPEN_FEED_ACTION.share,
        post.id,
      );
      // Global lock: do not fall through to local continue for another post/action.
      if (
        riskApiBase() &&
        isRiskInteractionBlocked(inFlightPromisesRef.current, flightKey)
      ) {
        return { type: "continue" };
      }

      const finish = (decision: ActionDecision): ActionDecision => {
        if (decision.type === "intercept") {
          startIntercept(decision);
          return decision;
        }
        incrementShare(post.id);
        setToast(msg.sharedToast);
        return decision;
      };

      const decision = decideForPost(OPEN_FEED_ACTION.share, post, intent);
      return isPromise(decision) ? decision.then(finish) : finish(decision);
    },
    [
      decideForPost,
      flow,
      incrementShare,
      maybeStartTransfer,
      msg,
      setToast,
      startIntercept,
    ],
  );

  const requestComment = useCallback(
    (
      postId: string,
      body: string,
      parentId: string | undefined,
      returnElementId: string,
    ): MaybeAsync<ActionDecision | null> => {
      const trimmed = body.trim();
      if (!trimmed) return null;

      const post = openFeedPosts.find((p) => p.id === postId);
      if (!post) return null;

      const intent: PendingIntent = {
        type: "comment",
        postId,
        body: trimmed,
        parentId,
        returnElementId,
      };

      if (maybeStartTransfer(post, intent)) {
        setDraftComment({ postId, body: trimmed, parentId });
        return {
          type: "intercept",
          challengeId:
            flow.status === "transfer-pending" ? flow.challengeId : "",
          skill: flow.status === "transfer-pending" ? flow.skill : undefined,
          reason: transferReason(
            flow.status === "transfer-pending" ? flow.skill : undefined,
          ),
          intent,
        };
      }

      const flightKey = OPEN_FEED_IDS.pendingAction(
        OPEN_FEED_ACTION.comment,
        post.id,
      );
      if (
        riskApiBase() &&
        isRiskInteractionBlocked(inFlightPromisesRef.current, flightKey)
      ) {
        return null;
      }

      const decision = decideForPost(
        OPEN_FEED_ACTION.comment,
        post,
        intent,
        trimmed,
      );

      const finish = (d: ActionDecision, remote: boolean): ActionDecision => {
        // The local disjunction below is a tautology today: decideFreeBrowse
        // can only return `intercept` for a comment when isAffirmingComment
        // already passed. It is kept as a guard in case that loosens, and
        // `remote` is added so a service decision is not silently downgraded
        // to a plain comment post.
        if (
          d.type === "intercept" &&
          (remote || isGuidedAction(post) || isAffirmingComment(trimmed))
        ) {
          setDraftComment({ postId, body: trimmed, parentId });
          startIntercept(d);
          return d;
        }
        commitComment(postId, trimmed, parentId);
        return d.type === "intercept" ? { type: "continue" } : d;
      };

      return isPromise(decision)
        ? decision.then((d) => finish(d, true))
        : finish(decision, false);
    },
    [
      commitComment,
      decideForPost,
      flow,
      isGuidedAction,
      maybeStartTransfer,
      startIntercept,
    ],
  );

  const requestRepostImage = useCallback(
    (
      post: (typeof openFeedPosts)[number],
      returnElementId: string,
    ): MaybeAsync<ActionDecision> => {
      const intent: PendingIntent = {
        type: "repost-image",
        postId: post.id,
        returnElementId,
      };

      if (maybeStartTransfer(post, intent)) {
        return {
          type: "intercept",
          challengeId:
            flow.status === "transfer-pending" ? flow.challengeId : "",
          skill: flow.status === "transfer-pending" ? flow.skill : undefined,
          reason: transferReason(
            flow.status === "transfer-pending" ? flow.skill : undefined,
          ),
          intent,
        };
      }

      const flightKey = OPEN_FEED_IDS.pendingAction(
        OPEN_FEED_ACTION.repostImage,
        post.id,
      );
      if (
        riskApiBase() &&
        isRiskInteractionBlocked(inFlightPromisesRef.current, flightKey)
      ) {
        return { type: "continue" };
      }

      const finish = (decision: ActionDecision): ActionDecision => {
        if (decision.type === "intercept") {
          startIntercept(decision);
          return decision;
        }
        setToast(msg.repostToast);
        return decision;
      };

      const decision = decideForPost(
        OPEN_FEED_ACTION.repostImage,
        post,
        intent,
      );
      return isPromise(decision) ? decision.then(finish) : finish(decision);
    },
    [decideForPost, flow, maybeStartTransfer, msg, setToast, startIntercept],
  );

  const resolveTransferTarget = useCallback(
    (intent: PendingIntent): string | undefined => {
      if (flow.status === "return-to-context" && flow.transferPostId) {
        return flow.transferPostId;
      }
      const post = openFeedPosts.find((p) => p.id === intent.postId);
      return post?.transferPostId;
    },
    [flow],
  );

  const enterTransferPending = useCallback(
    (transferPostId: string | undefined) => {
      if (!transferPostId) return;
      setHighlightedPostId(transferPostId);
      setToast(msg.transferToast);
      requestAnimationFrame(() => {
        document
          .getElementById(OPEN_FEED_IDS.post(transferPostId))
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    },
    [msg, setToast],
  );

  const resolvePendingIntent = useCallback(
    (choice: "confirm" | "cancel" | "edit" | "open-source") => {
      if (flow.status !== "return-to-context") return;
      const { intent } = flow;
      const transferPostId = resolveTransferTarget(intent);
      const hasTransfer = Boolean(flow.transferChallengeId && flow.skill);

      if (choice === "edit") {
        if (intent.type === "comment") {
          setDraftComment({
            postId: intent.postId,
            body: intent.body,
            parentId: intent.parentId,
          });
        }
        dispatch({ type: "RESET_FLOW" });
        returnFocus(intent.returnElementId);
        return;
      }

      if (choice === "confirm") {
        if (intent.type === "share") {
          incrementShare(intent.postId);
          setToast(msg.sharedToast);
        } else if (intent.type === "comment") {
          commitComment(intent.postId, intent.body, intent.parentId);
        } else if (intent.type === "repost-image") {
          setToast(msg.repostToast);
        }
        dispatch({ type: "RESOLVE_INTENT", transferPostId });
        if (hasTransfer) {
          enterTransferPending(transferPostId);
        }
        returnFocus(intent.returnElementId);
        return;
      }

      if (choice === "open-source") {
        // Acknowledge the user's intent without claiming a source opened.
        // Set after transfer highlight so the transfer toast does not overwrite it.
        dispatch({ type: "CANCEL_INTENT", transferPostId });
        if (hasTransfer) {
          enterTransferPending(transferPostId);
        } else {
          setDraftComment(null);
        }
        setToast(msg.verifyAcknowledgement);
        returnFocus(intent.returnElementId);
        return;
      }

      // cancel: do not execute intent; still allow transfer
      dispatch({ type: "CANCEL_INTENT", transferPostId });
      if (hasTransfer) {
        enterTransferPending(transferPostId);
      } else {
        setDraftComment(null);
      }
      returnFocus(intent.returnElementId);
    },
    [
      commitComment,
      enterTransferPending,
      flow,
      incrementShare,
      msg,
      resolveTransferTarget,
      returnFocus,
      setToast,
    ],
  );

  const completeChallenge = useCallback(
    (result: ChallengeResult) => {
      if (
        flow.status === "challenge-intro" ||
        flow.status === "challenge-active" ||
        (flow.status === "challenge-feedback" && !flow.isTransfer)
      ) {
        const post = openFeedPosts.find((p) => p.id === flow.intent.postId);
        dispatch({
          type: "COMPLETE_INITIAL",
          result,
          // Prefer remote-carried id already on flow; catalog is fallback only.
          transferPostId: flow.transferPostId ?? post?.transferPostId,
        });
        returnFocus(flow.intent.returnElementId);
        return;
      }

      if (
        flow.status === "transfer-active" ||
        (flow.status === "challenge-feedback" && flow.isTransfer)
      ) {
        dispatch({ type: "COMPLETE_TRANSFER_DONE", result });
        if ("intent" in flow) {
          returnFocus(flow.intent.returnElementId);
        }
      }
    },
    [flow, returnFocus],
  );

  const skipChallenge = useCallback(() => {
    if (
      flow.status === "challenge-intro" ||
      flow.status === "challenge-active" ||
      flow.status === "challenge-feedback"
    ) {
      if (flow.isTransfer) {
        dispatch({ type: "SKIP_CHALLENGE", result: OPEN_FEED_SKIPPED_RESULT });
        returnFocus(flow.intent.returnElementId);
        return;
      }
      const post = openFeedPosts.find((p) => p.id === flow.intent.postId);
      dispatch({
        type: "SKIP_CHALLENGE",
        result: OPEN_FEED_SKIPPED_RESULT,
        transferPostId: flow.transferPostId ?? post?.transferPostId,
      });
      returnFocus(flow.intent.returnElementId);
      return;
    }
    if (flow.status === "transfer-active") {
      dispatch({ type: "SKIP_CHALLENGE", result: OPEN_FEED_SKIPPED_RESULT });
      returnFocus(flow.intent.returnElementId);
    }
  }, [flow, returnFocus]);

  const beginChallenge = useCallback(() => {
    dispatch({ type: "BEGIN_ACTIVE" });
  }, []);

  const toggleLike = useCallback(
    (id: string) => {
      setLiked((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
      );
    },
    [setLiked],
  );

  const toggleSave = useCallback(
    (id: string) => {
      setSaved((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
      );
    },
    [setSaved],
  );

  const likeComment = useCallback(
    (postId: string, commentId: string) => {
      setComments((prev) => ({
        ...prev,
        [postId]: (prev[postId] ?? []).map((c) =>
          c.id === commentId ? { ...c, likes: c.likes + 1 } : c,
        ),
      }));
    },
    [setComments],
  );

  const deleteComment = useCallback(
    (postId: string, commentId: string) => {
      setComments((prev) => ({
        ...prev,
        [postId]: (prev[postId] ?? []).filter(
          (c) => c.id !== commentId && c.parentId !== commentId,
        ),
      }));
    },
    [setComments],
  );

  // Persist outcomes when flow reaches completed, then reset.
  useEffect(() => {
    if (flow.status !== "completed") {
      recordedOutcomeKey.current = null;
      return;
    }
    const key = `${flow.outcome.postId}-${flow.outcome.completedAt}`;
    if (recordedOutcomeKey.current === key) return;
    recordedOutcomeKey.current = key;

    setOutcomes((prev) => [...prev, flow.outcome]);
    engineRef.current.markDone(flow.outcome.skill ?? null);

    // Anonymous outcome, fire-and-forget. No-op when the service is unset.
    postOutcome({
      event: flow.outcome.skipped
        ? "intervention_skipped"
        : "challenge_completed",
      sessionId: riskSessionId(),
      occurredAt: flow.outcome.completedAt,
      locale: language,
      postId: flow.outcome.postId,
      skill: flow.outcome.skill,
      challengeId: flow.outcome.challengeId,
      transferChallengeId: flow.outcome.transferChallengeId,
      skipped: Boolean(flow.outcome.skipped),
      correct: flow.outcome.initial?.correct,
      durationMs: flow.outcome.initial?.durationMs,
    });
    setAlerts((prev) => [
      {
        id: `a-${Date.now()}`,
        kind: "challenge",
        text: msg.completedAlert,
        at: new Date().toISOString(),
        postId: flow.outcome.postId,
      },
      ...prev,
    ]);
    setHighlightedPostId(null);
    dispatch({ type: "RESET_FLOW" });
  }, [flow, msg, setOutcomes, language]);

  // Speculative warm-up. A cold analysis costs ~5s (network-bound), so without
  // this the first interception on any post would miss its window and fall back
  // to local. Prefetch every post — tone/triggerSkill/minigameId are curated
  // demo labels and must not decide what the agents see. The backend pretriage
  // discards obviously benign content without an LLM call. Deduped in the client.
  useEffect(() => {
    if (!riskApiBase()) return;
    prefetchRisk(openFeedPosts, language);
  }, [language]);

  const value: DemoSessionValue = {
    posts: openFeedPosts,
    nav,
    setNav,
    query,
    setQuery,
    clearSearch: () => setQuery(""),
    filteredPosts,
    liked: likedSet,
    saved: savedSet,
    toggleLike,
    toggleSave,
    comments,
    likeComment,
    deleteComment,
    commentSort,
    setCommentSort,
    flow,
    draftComment,
    highlightedPostId,
    scenarioGuide,
    guidedScenarioId,
    shareCounts,
    introSeen,
    setIntroSeen,
    toast,
    setToast,
    selectedPostId,
    setSelectedPostId,
    focusReturnId,
    clearFocusReturn,
    loading,
    pendingActionKey,
    lockedActionKey,
    riskInteractionLocked,
    outcomes,
    alerts,
    launchScenario,
    requestShare,
    requestComment,
    requestRepostImage,
    commitComment,
    resolvePendingIntent,
    completeChallenge,
    skipChallenge,
    beginChallenge,
    isGuidedAction,
  };

  return (
    <DemoSessionContext.Provider value={value}>
      {children}
    </DemoSessionContext.Provider>
  );
}

export function useDemoSession() {
  const ctx = useContext(DemoSessionContext);
  if (!ctx) {
    throw new Error(OPEN_FEED_ERRORS.missingProvider);
  }
  return ctx;
}
