import {
  Bell,
  Bookmark,
  Home,
  MonitorPlay,
  User,
  type LucideIcon,
} from "lucide-react";
import type { DemoSessionMessages } from "../../context/DemoSessionContext";
import type { UiCopy } from "../../i18n/translations";
import { localizedExperienceText } from "../openfeed/openFeed.constants";
import {
  COMMENT_SORT,
  FEED_NAV,
  type CommentSort,
  type FeedNav,
} from "../openfeed/openFeed.types";

/**
 * Bookface is the second simulated network (`/demo/bookface`), styled after the
 * Facebook web feed. It is a *skin*: the feed data, the intercept pipeline, the
 * DOM id contract (`OPEN_FEED_IDS`) and `DemoSessionProvider` are all shared
 * with the Y skin in `../openfeed`. Only presentation and copy live here.
 *
 * Bookface maps the five shared `FeedNav` views onto Facebook's vocabulary:
 * explore → Watch, alerts → Notifications.
 */

type ExperienceCopyKey = keyof UiCopy["experience"];

export type BookfaceNavItem = {
  id: FeedNav;
  icon: LucideIcon;
  labelKey: ExperienceCopyKey;
  badgeSource: "alerts" | "saved" | null;
  /** Left-rail glyph tint — Bookface colours its rail icons, Y does not. */
  tint: string;
};

export const BOOKFACE_NAV_ITEMS = [
  {
    id: FEED_NAV.HOME,
    icon: Home,
    labelKey: "navHome",
    badgeSource: null,
    tint: "text-bf-blue",
  },
  {
    id: FEED_NAV.EXPLORE,
    icon: MonitorPlay,
    labelKey: "bfNavWatch",
    badgeSource: null,
    tint: "text-bf-love",
  },
  {
    id: FEED_NAV.ALERTS,
    icon: Bell,
    labelKey: "bfNavNotifications",
    badgeSource: "alerts",
    tint: "text-bf-love",
  },
  {
    id: FEED_NAV.SAVED,
    icon: Bookmark,
    labelKey: "navSaved",
    badgeSource: "saved",
    tint: "text-bf-green",
  },
  {
    id: FEED_NAV.PROFILE,
    icon: User,
    labelKey: "navProfile",
    badgeSource: null,
    tint: "text-bf-blue",
  },
] as const satisfies readonly BookfaceNavItem[];

export const BOOKFACE_NAV_TITLE_KEYS: Record<FeedNav, ExperienceCopyKey> = {
  [FEED_NAV.HOME]: "navHome",
  [FEED_NAV.EXPLORE]: "bfNavWatch",
  [FEED_NAV.ALERTS]: "bfNavNotifications",
  [FEED_NAV.SAVED]: "navSaved",
  [FEED_NAV.PROFILE]: "navProfile",
};

export const BOOKFACE_COMMENT_SORT_OPTIONS: ReadonlyArray<{
  id: CommentSort;
  labelKey: ExperienceCopyKey;
}> = [
  { id: COMMENT_SORT.FEATURED, labelKey: "bfMostRelevant" },
  { id: COMMENT_SORT.RECENT, labelKey: "bfNewest" },
];

export const BOOKFACE_ROUTES = {
  home: "/",
  demo: "/demo/bookface",
  testSession: "/demo/test-session",
} as const;

/**
 * Copy overrides handed to `DemoSessionProvider`. Y reposts, Bookface shares —
 * everything else the session emits reads the same on both skins.
 */
export const BOOKFACE_MESSAGES: DemoSessionMessages = {
  scenarioGuide: localizedExperienceText("bfScenarioGuide"),
  sharedToast: localizedExperienceText("bfSharedToast"),
  sharedToastAiVerified: localizedExperienceText("bfSharedToastAiVerified"),
  repostToast: localizedExperienceText("bfShareImageToast"),
};

/** How many feed authors surface as stories / contacts in the rails. */
export const BOOKFACE_LIMITS = {
  stories: 6,
  contacts: 8,
} as const;
