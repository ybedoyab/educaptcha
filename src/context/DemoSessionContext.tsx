import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { openFeedPosts, type FeedComment, type OpenFeedPost } from "../data/openFeedPosts";
import { useLocalStorage } from "../hooks/useLocalStorage";
import {
  createTriggerEngine,
  type TriggerAction,
  type TriggerDecision,
} from "../lib/LearningTriggerEngine";
import type { ChallengeResult } from "../types/minigame";
import type { LocalizedText } from "../types";

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

export type ChallengeFocus = {
  postId: string;
  returnElementId: string;
  reason: LocalizedText;
  minigameId: string;
  transferMinigameId?: string;
  phase: "initial" | "transfer";
  skill?: string;
};

export type OutcomeRecord = {
  postId: string;
  skill?: string;
  initial?: ChallengeResult;
  transfer?: ChallengeResult;
  skipped?: boolean;
  evidenceInspected?: boolean;
  firstDecision?: string;
  transferDecision?: string;
  completedAt: string;
};

type CommentsMap = Record<string, FeedComment[]>;

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
  toggleSave: (id: string, openSource?: boolean) => void;
  comments: CommentsMap;
  addComment: (postId: string, body: string, parentId?: string) => void;
  likeComment: (postId: string, commentId: string) => void;
  deleteComment: (postId: string, commentId: string) => void;
  commentSort: "featured" | "recent";
  setCommentSort: (s: "featured" | "recent") => void;
  alerts: AlertItem[];
  challenge: ChallengeFocus | null;
  challengeReason: LocalizedText | null;
  tryAction: (
    action: TriggerAction,
    post: OpenFeedPost,
    returnElementId: string,
    commentText?: string,
  ) => boolean;
  completeChallenge: (result: ChallengeResult) => void;
  skipChallenge: () => void;
  outcomes: OutcomeRecord[];
  toast: string | null;
  setToast: (t: string | null) => void;
  selectedPostId: string | null;
  setSelectedPostId: (id: string | null) => void;
  focusReturnId: string | null;
  clearFocusReturn: () => void;
  loading: boolean;
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
  const [challenge, setChallenge] = useState<ChallengeFocus | null>(null);
  const [outcomes, setOutcomes] = useLocalStorage<OutcomeRecord[]>(
    "educaptcha-outcomes",
    [],
  );
  const [toast, setToast] = useState<string | null>(null);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [focusReturnId, setFocusReturnId] = useState<string | null>(null);
  const [loading] = useState(false);
  const engineRef = useRef(createTriggerEngine());
  const pendingInitial = useRef<ChallengeResult | null>(null);

  const likedSet = useMemo(() => new Set(liked), [liked]);
  const savedSet = useMemo(() => new Set(saved), [saved]);

  const filteredPosts = useMemo(() => {
    let list = [...openFeedPosts];
    if (nav === "saved") {
      list = list.filter((p) => savedSet.has(p.id));
    } else if (nav === "explore") {
      list = list.filter((p) => p.tone !== "manipulative" || p.category === "science");
      list = [...list].sort((a, b) => b.reactions - a.reactions);
    } else if (nav === "profile") {
      list = list.filter((p) => p.tone === "official" || p.mediaKind === "thread");
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

  const tryAction = useCallback(
    (
      action: TriggerAction,
      post: OpenFeedPost,
      returnElementId: string,
      commentText?: string,
    ) => {
      const decision: TriggerDecision | null = engineRef.current.decide(
        action,
        post,
        commentText,
      );
      if (!decision?.shouldTrigger) return false;
      setChallenge({
        postId: post.id,
        returnElementId,
        reason: decision.reason,
        minigameId: decision.minigameId,
        transferMinigameId: decision.transferMinigameId,
        phase: "initial",
        skill: decision.skill,
      });
      return true;
    },
    [],
  );

  const returnFocus = useCallback((id: string) => {
    setFocusReturnId(id);
    requestAnimationFrame(() => {
      const el = document.getElementById(id);
      el?.focus();
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }, []);

  const completeChallenge = useCallback(
    (result: ChallengeResult) => {
      if (!challenge) return;
      if (challenge.phase === "initial" && challenge.transferMinigameId) {
        pendingInitial.current = result;
        setChallenge({
          ...challenge,
          phase: "transfer",
          minigameId: challenge.transferMinigameId,
        });
        return;
      }

      const initial = pendingInitial.current ?? result;
      const transfer =
        challenge.phase === "transfer" ? result : undefined;
      pendingInitial.current = null;

      setOutcomes((prev) => [
        ...prev,
        {
          postId: challenge.postId,
          skill: challenge.skill,
          initial,
          transfer,
          evidenceInspected: true,
          firstDecision: initial.correct ? "identified" : "missed",
          transferDecision: transfer
            ? transfer.correct
              ? "identified"
              : "missed"
            : undefined,
          completedAt: new Date().toISOString(),
        },
      ]);
      setAlerts((prev) => [
        {
          id: `a-${Date.now()}`,
          kind: "challenge",
          text: {
            en: "You completed a learning check.",
            es: "Completaste una revisión de aprendizaje.",
          },
          at: new Date().toISOString(),
          postId: challenge.postId,
        },
        ...prev,
      ]);
      engineRef.current.markSkippedOrDone(challenge.skill ?? null);
      const returnId = challenge.returnElementId;
      setChallenge(null);
      returnFocus(returnId);
    },
    [challenge, returnFocus, setOutcomes],
  );

  const skipChallenge = useCallback(() => {
    if (!challenge) return;
    setOutcomes((prev) => [
      ...prev,
      {
        postId: challenge.postId,
        skill: challenge.skill,
        skipped: true,
        completedAt: new Date().toISOString(),
      },
    ]);
    engineRef.current.markSkippedOrDone(challenge.skill ?? null);
    const returnId = challenge.returnElementId;
    pendingInitial.current = null;
    setChallenge(null);
    returnFocus(returnId);
  }, [challenge, returnFocus, setOutcomes]);

  const toggleLike = useCallback(
    (id: string) => {
      setLiked((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
      );
    },
    [setLiked],
  );

  const toggleSave = useCallback(
    (id: string, openSource = false) => {
      setSaved((prev) => {
        const next = prev.includes(id)
          ? prev.filter((x) => x !== id)
          : [...prev, id];
        return next;
      });
      if (!openSource) {
        const post = openFeedPosts.find((p) => p.id === id);
        if (post && !saved.includes(id)) {
          tryAction("save", post, `save-${id}`);
        }
      }
    },
    [saved, setSaved, tryAction],
  );

  const addComment = useCallback(
    (postId: string, body: string, parentId?: string) => {
      const comment: FeedComment = {
        id: `own-${Date.now()}`,
        author: "You",
        handle: "@you.demo",
        body: { en: body, es: body },
        createdAt: new Date().toISOString(),
        likes: 0,
        parentId,
        isOwn: true,
      };
      setComments((prev) => ({
        ...prev,
        [postId]: [...(prev[postId] ?? []), comment],
      }));
      const post = openFeedPosts.find((p) => p.id === postId);
      if (post) {
        tryAction("comment", post, `comment-${postId}`, body);
      }
    },
    [setComments, tryAction],
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
    addComment,
    likeComment,
    deleteComment,
    commentSort,
    setCommentSort,
    alerts,
    challenge,
    challengeReason: challenge?.reason ?? null,
    tryAction,
    completeChallenge,
    skipChallenge,
    outcomes,
    toast,
    setToast,
    selectedPostId,
    setSelectedPostId,
    focusReturnId,
    clearFocusReturn: () => setFocusReturnId(null),
    loading,
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
