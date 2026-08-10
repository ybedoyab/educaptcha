/**
 * Thin re-export so existing `context/DemoSessionContext` imports keep working
 * after the session logic moved to `features/demo-session`.
 */
export {
  DemoSessionProvider,
  useDemoSession,
  type DemoSessionMessages,
  type FeedNav,
} from "../features/demo-session";
