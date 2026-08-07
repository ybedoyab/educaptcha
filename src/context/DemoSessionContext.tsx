import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  openFeedPosts,
  type FeedComment,
  type OpenFeedPost,
} from "../data/openFeedPosts";
import { useLocalStorage } from "../hooks/useLocalStorage";
import {
  demoFlowReducer,
  initialDemoFlowState,
  type DemoFlowState,
  type OutcomeRecord,
  type PendingIntent,
} from "../lib/demoFlow";
import {
  createTriggerEngine,
  isAffirmingComment,
  type ActionDecision,
} from "../lib/LearningTriggerEngine";
import {
  analyzeRisk,
  postOutcome,
  prefetchRisk,
  riskApiBase,
  riskSessionId,
} from "../lib/risk/riskClient";
import {
  isPromise,
  mergeRemoteDecision,
  type MaybeAsync,
} from "../lib/risk/riskSource";
import { useI18n } from "../i18n/I18nContext";
import type { LocalizedText } from "../types";
import type { ChallengeResult } from "../types/minigame";

export type FeedNav =
  | "home"
  | "explore"
  | "alerts"
  | "saved"
  | "profile";

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

type CommentsMap = Record<string, FeedComment[]>;

type ToastValue = LocalizedText | null;

const SCENARIO_GUIDE: LocalizedText = {
  en: "Try sharing the highlighted post.",
  es: "Intenta compartir la publicación resaltada.",
};

const TRANSFER_TOAST: LocalizedText = {
  en: "Now apply this skill to a new post.",
  es: "Ahora aplica esta habilidad en otra publicación.",
};

const VERIFY_ACK: LocalizedText = {
  en: "Good instinct — open a source and compare details.",
  es: "Buen instinto — abre una fuente y compara los detalles.",
};

const SHARED_TOAST: LocalizedText = {
  en: "Shared (simulated)",
  es: "Compartido (simulado)",
};

const REPOST_TOAST: LocalizedText = {
  en: "Image reposted (simulated)",
  es: "Imagen republicada (simulada)",
};

const SKIPPED_RESULT: ChallengeResult = {
  completed: false,
  correct: false,
  score: 0,
  attempts: 0,
  selectedIds: [],
  durationMs: 0,
  hintsUsed: 0,
  skipped: true,
};

function toToast(value: LocalizedText | string | null): ToastValue {
  if (value === null) return null;
  if (typeof value === "string") return { en: value, es: value };
  return value;
}

function transferReason(skill?: string): LocalizedText {
  return {
    en: skill
      ? `Apply what you learned about ${skill.replace(/-/g, " ")} to this post.`
      : "Apply what you learned to this new post.",
    es: skill
      ? `Aplica lo que aprendiste sobre ${skill.replace(/-/g, " ")} en esta publicación.`
      : "Aplica lo que aprendiste en esta nueva publicación.",
  };
}

type DemoSessionValue = {
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
  commentSort: "featured" | "recent";
  setCommentSort: (s: "featured" | "recent") => void;
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

const DemoSessionContext = createContext<DemoSessionValue | null>(null);

function seedComments(): CommentsMap {
  const map: CommentsMap = {};
  for (const p of openFeedPosts) {
    map[p.id] = [...p.seedComments];
  }
  return map;
}

const seedAlerts: AlertItem[] = [
  {
    id: "a1",
    kind: "reply",
    text: {
      en: "Ada replied to a community garden post.",
      es: "Ada respondió a una publicación del jardín comunitario.",
    },
    at: "2026-08-06T12:00:00Z",
    postId: "p-garden",
  },
  {
    id: "a2",
    kind: "verified",
    text: {
      en: "Health Dept. bulletin was marked as an official source.",
      es: "El boletín del Dept. de Salud se marcó como fuente oficial.",
    },
    at: "2026-08-06T11:30:00Z",
    postId: "p-health-tips",
  },
  {
    id: "a3",
    kind: "challenge",
    text: {
      en: "You completed a context verification practice.",
      es: "Completaste una práctica de verificación de contexto.",
    },
    at: "2026-08-06T10:00:00Z",
  },
];

export function DemoSessionProvider({ children }: { children: ReactNode }) {
  const [nav, setNav] = useState<FeedNav>("home");
  const [query, setQuery] = useState("");
  const [liked, setLiked] = useLocalStorage<string[]>("educaptcha-liked", []);
  const [saved, setSaved] = useLocalStorage<string[]>("educaptcha-saved", []);
  const [comments, setComments] = useLocalStorage<CommentsMap>(
    "educaptcha-comments",
    seedComments(),
  );
  const [commentSort, setCommentSort] = useState<"featured" | "recent">(
    "featured",
  );
  const [alerts, setAlerts] = useState<AlertItem[]>(seedAlerts);
  const [outcomes, setOutcomes] = useLocalStorage<OutcomeRecord[]>(
    "educaptcha-outcomes",
    [],
  );
  const [introSeen, setIntroSeen] = useLocalStorage<boolean>(
    "educaptcha-intro-seen",
    false,
  );
  const [toast, setToastState] = useState<ToastValue>(null);
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

  const [flow, dispatch] = useReducer(demoFlowReducer, initialDemoFlowState);
  const engineRef = useRef(createTriggerEngine());
  const recordedOutcomeKey = useRef<string | null>(null);

  const { language } = useI18n();

  // Guards for the remote path only; all three are inert when the service is
  // unconfigured, because no promise is ever created.
  const flowRef = useRef(flow);
  flowRef.current = flow;
  const requestSeqRef = useRef(0);
  const inFlightRef = useRef(false);
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
    (post: OpenFeedPost) =>
      Boolean(guidedScenarioId && post.scenarioId === guidedScenarioId),
    [guidedScenarioId],
  );

  const filteredPosts = useMemo(() => {
    let list = [...openFeedPosts];
    if (nav === "saved") {
      list = list.filter((p) => savedSet.has(p.id));
    } else if (nav === "explore") {
      list = list.filter(
        (p) => p.tone !== "manipulative" || p.category === "science",
      );
      list = [...list].sort((a, b) => b.reactions - a.reactions);
    } else if (nav === "profile") {
      list = list.filter(
        (p) => p.tone === "official" || p.mediaKind === "thread",
      );
    }

    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter((p) => {
        const hay = [
          p.author.en,
          p.author.es,
          p.handle,
          p.body.en,
          p.body.es,
          p.category,
          ...p.tags,
        ]
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      });
    }
    return list;
  }, [nav, query, savedSet]);

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
    (post: OpenFeedPost, intent: PendingIntent): boolean => {
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

  /**
   * The single point where a decision is made.
   *
   * Returns synchronously (exactly today's behaviour) unless the external
   * service is configured, in which case it returns a promise that resolves to
   * the remote decision — or to the local one if the service is slow, down, or
   * returns something that fails validation.
   */
  const decideForPost = useCallback(
    (
      action: "share" | "comment" | "repost-image",
      post: OpenFeedPost,
      intent: PendingIntent,
      commentText?: string,
    ): MaybeAsync<ActionDecision> => {
      // Guided scenarios stay local, always. They are the scripted pitch: they
      // must be deterministic, survive dead conference wifi, and they
      // deliberately bypass the cooldown, which a remote service has no basis
      // to reproduce.
      if (isGuidedAction(post)) {
        return engineRef.current.forceScenario(post, intent);
      }

      // Computed unconditionally — this call owns the cooldown mutation, so
      // skipping it on the remote path would freeze the counter.
      const local = engineRef.current.decideFreeBrowse(
        action,
        post,
        intent,
        commentText,
      );

      if (!riskApiBase()) return local;

      // One decision in flight at a time; a second click is a no-op rather than
      // a racing dispatch.
      if (inFlightRef.current) return local;
      inFlightRef.current = true;

      const seq = ++requestSeqRef.current;
      const key = `${action}:${post.id}`;
      // Grace delay: a warm cache answers in ~5ms, and flashing a spinner for
      // that long looks like a glitch.
      const graceTimer = setTimeout(() => {
        if (requestSeqRef.current === seq && mountedRef.current) {
          setPendingActionKey(key);
        }
      }, 250);

      return analyzeRisk(post, action, language, commentText)
        .then((remote) => {
          // Discard a late answer if the user has moved on, or if a challenge
          // is already open — otherwise a slow response stomps it.
          const status = flowRef.current.status;
          const stale =
            seq !== requestSeqRef.current ||
            status === "challenge-intro" ||
            status === "challenge-active" ||
            status === "challenge-feedback" ||
            status === "transfer-active";
          if (stale) return local;
          return mergeRemoteDecision(remote, local, intent);
        })
        .catch(() => local)
        .finally(() => {
          clearTimeout(graceTimer);
          inFlightRef.current = false;
          if (mountedRef.current) setPendingActionKey(null);
        });
    },
    [isGuidedAction, language],
  );

  const launchScenario = useCallback((scenarioId: string): OpenFeedPost | null => {
    const post = openFeedPosts.find((p) => p.scenarioId === scenarioId);
    if (!post) {
      setToast({
        en: "Scenario not found — showing the full feed.",
        es: "Escenario no encontrado — mostrando el feed completo.",
      });
      return null;
    }
    setGuidedScenarioId(scenarioId);
    setHighlightedPostId(post.id);
    setScenarioGuide(SCENARIO_GUIDE);
    return post;
  }, [setToast]);

  const requestShare = useCallback(
    (post: OpenFeedPost, returnElementId: string): MaybeAsync<ActionDecision> => {
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

      // Tail extracted verbatim so it can run either synchronously (local) or
      // after an await (remote) without duplicating the side effects.
      const finish = (decision: ActionDecision): ActionDecision => {
        if (decision.type === "intercept") {
          startIntercept(decision);
          return decision;
        }
        incrementShare(post.id);
        setToast(SHARED_TOAST);
        return decision;
      };

      const decision = decideForPost("share", post, intent);
      return isPromise(decision) ? decision.then(finish) : finish(decision);
    },
    [
      decideForPost,
      flow,
      incrementShare,
      maybeStartTransfer,
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

      const decision = decideForPost("comment", post, intent, trimmed);

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
    (post: OpenFeedPost, returnElementId: string): MaybeAsync<ActionDecision> => {
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

      const finish = (decision: ActionDecision): ActionDecision => {
        if (decision.type === "intercept") {
          startIntercept(decision);
          return decision;
        }
        setToast(REPOST_TOAST);
        return decision;
      };

      const decision = decideForPost("repost-image", post, intent);
      return isPromise(decision) ? decision.then(finish) : finish(decision);
    },
    [decideForPost, flow, maybeStartTransfer, setToast, startIntercept],
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
      setToast(TRANSFER_TOAST);
      requestAnimationFrame(() => {
        document
          .getElementById(`post-${transferPostId}`)
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    },
    [setToast],
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
          setToast(SHARED_TOAST);
        } else if (intent.type === "comment") {
          commitComment(intent.postId, intent.body, intent.parentId);
        } else if (intent.type === "repost-image") {
          setToast(REPOST_TOAST);
        }
        dispatch({ type: "RESOLVE_INTENT", transferPostId });
        if (hasTransfer) {
          enterTransferPending(transferPostId);
        }
        returnFocus(intent.returnElementId);
        return;
      }

      if (choice === "open-source") {
        setToast(VERIFY_ACK);
      }

      // cancel and open-source: do not execute intent; still allow transfer
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
          transferPostId: post?.transferPostId,
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
        dispatch({ type: "SKIP_CHALLENGE", result: SKIPPED_RESULT });
        returnFocus(flow.intent.returnElementId);
        return;
      }
      const post = openFeedPosts.find((p) => p.id === flow.intent.postId);
      dispatch({
        type: "SKIP_CHALLENGE",
        result: SKIPPED_RESULT,
        transferPostId: post?.transferPostId,
      });
      returnFocus(flow.intent.returnElementId);
      return;
    }
    if (flow.status === "transfer-active") {
      dispatch({ type: "SKIP_CHALLENGE", result: SKIPPED_RESULT });
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
      event: flow.outcome.skipped ? "intervention_skipped" : "challenge_completed",
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
        text: {
          en: "You completed a learning check.",
          es: "Completaste una revisión de aprendizaje.",
        },
        at: new Date().toISOString(),
        postId: flow.outcome.postId,
      },
      ...prev,
    ]);
    setHighlightedPostId(null);
    dispatch({ type: "RESET_FLOW" });
  }, [flow, setOutcomes, language]);

  // Speculative warm-up. A cold analysis costs ~5s (network-bound), so without
  // this the first interception on any post would miss its window and fall back
  // to local. `dryRun` means the service caches the analysis without advancing
  // any cooldown counter. No-op when the service is unset.
  useEffect(() => {
    if (!riskApiBase()) return;
    prefetchRisk(
      openFeedPosts.filter((p) => p.tone !== "neutral" && p.tone !== "official"),
      language,
    );
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
    throw new Error("useDemoSession must be used within DemoSessionProvider");
  }
  return ctx;
}
