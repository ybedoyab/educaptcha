import {
  Bell,
  Bookmark,
  Compass,
  Home,
  User,
  type LucideIcon,
} from "lucide-react";
import { translations, type UiCopy } from "../../i18n/translations";
import type { LocalizedText } from "../../types";
import type { ChallengeResult } from "../../types/minigame";
import {
  COMMENT_SORT,
  FEED_NAV,
  type AlertItem,
  type CommentSort,
  type FeedNav,
} from "./openFeed.types";

type ExperienceCopyKey = keyof UiCopy["experience"];

export type OpenFeedNavItem = {
  id: FeedNav;
  icon: LucideIcon;
  labelKey: ExperienceCopyKey;
  badgeSource: "alerts" | "saved" | null;
};

export const OPEN_FEED_NAV_ITEMS = [
  { id: FEED_NAV.HOME, icon: Home, labelKey: "navHome", badgeSource: null },
  {
    id: FEED_NAV.EXPLORE,
    icon: Compass,
    labelKey: "navExplore",
    badgeSource: null,
  },
  {
    id: FEED_NAV.ALERTS,
    icon: Bell,
    labelKey: "navAlerts",
    badgeSource: "alerts",
  },
  {
    id: FEED_NAV.SAVED,
    icon: Bookmark,
    labelKey: "navSaved",
    badgeSource: "saved",
  },
  {
    id: FEED_NAV.PROFILE,
    icon: User,
    labelKey: "navProfile",
    badgeSource: null,
  },
] as const satisfies readonly OpenFeedNavItem[];

export const OPEN_FEED_NAV_TITLE_KEYS: Record<FeedNav, ExperienceCopyKey> = {
  [FEED_NAV.HOME]: "navHome",
  [FEED_NAV.EXPLORE]: "navExplore",
  [FEED_NAV.ALERTS]: "navAlerts",
  [FEED_NAV.SAVED]: "navSaved",
  [FEED_NAV.PROFILE]: "navProfile",
};

export const OPEN_FEED_COMMENT_SORT_OPTIONS: ReadonlyArray<{
  id: CommentSort;
  labelKey: ExperienceCopyKey;
}> = [
  { id: COMMENT_SORT.FEATURED, labelKey: "commentsFeatured" },
  { id: COMMENT_SORT.RECENT, labelKey: "commentsRecent" },
];

export const OPEN_FEED_STORAGE_KEYS = {
  liked: "educaptcha-liked",
  saved: "educaptcha-saved",
  comments: "educaptcha-comments",
  outcomes: "educaptcha-outcomes",
  introSeen: "educaptcha-intro-seen",
} as const;

export const OPEN_FEED_ROUTES = {
  home: "/",
  testSession: "/demo/test-session",
} as const;

export const OPEN_FEED_TIMINGS = {
  scenarioScrollMs: 120,
  transferScrollMs: 200,
  pendingActionGraceMs: 250,
  toastMs: 3200,
} as const;

export const OPEN_FEED_ACTION = {
  share: "share",
  repostImage: "repost-image",
  comment: "comment",
} as const;

export const OPEN_FEED_KEYS = {
  enter: "Enter",
  escape: "Escape",
} as const;

export const OPEN_FEED_IDS = {
  post: (postId: string) => `post-${postId}`,
  comment: (postId: string) => `comment-${postId}`,
  share: (postId: string) => `share-${postId}`,
  save: (postId: string) => `save-${postId}`,
  verify: (postId: string) => `verify-${postId}`,
  repostImage: (postId: string) => `repost-${postId}`,
  composer: (postId: string, parentId?: string) =>
    `composer-${postId}-${parentId ?? "root"}`,
  pendingAction: (action: string, postId: string) => `${action}:${postId}`,
} as const;

export const OPEN_FEED_SKIPPED_RESULT: ChallengeResult = {
  completed: false,
  correct: false,
  score: 0,
  attempts: 0,
  selectedIds: [],
  durationMs: 0,
  hintsUsed: 0,
  skipped: true,
};

export function localizedExperienceText(
  key: ExperienceCopyKey,
): LocalizedText {
  return {
    en: translations.en.experience[key],
    es: translations.es.experience[key],
  };
}

export function formatLocalizedExperienceText(
  key: ExperienceCopyKey,
  values: Readonly<Record<string, string>>,
): LocalizedText {
  const message = localizedExperienceText(key);
  const format = (template: string) =>
    Object.entries(values).reduce(
      (result, [name, value]) => result.replace(`{${name}}`, value),
      template,
    );

  return { en: format(message.en), es: format(message.es) };
}

export const OPEN_FEED_MESSAGES = {
  scenarioGuide: localizedExperienceText("scenarioGuide"),
  scenarioNotFound: localizedExperienceText("scenarioNotFound"),
  transferToast: localizedExperienceText("transferToast"),
  verifyAcknowledgement: localizedExperienceText("verifyAcknowledgement"),
  sharedToast: localizedExperienceText("sharedToast"),
  sharedToastAiVerified: localizedExperienceText("sharedToastAiVerified"),
  repostToast: localizedExperienceText("repostToast"),
  completedAlert: localizedExperienceText("completedAlert"),
} as const;

export const OPEN_FEED_SEED_ALERTS: AlertItem[] = [
  {
    id: "a1",
    kind: "reply",
    text: localizedExperienceText("seedAlertReply"),
    at: "2026-08-06T12:00:00Z",
    postId: "p-garden",
  },
  {
    id: "a2",
    kind: "verified",
    text: localizedExperienceText("seedAlertVerified"),
    at: "2026-08-06T11:30:00Z",
    postId: "p-health-tips",
  },
  {
    id: "a3",
    kind: "challenge",
    text: localizedExperienceText("seedAlertChallenge"),
    at: "2026-08-06T10:00:00Z",
  },
];
