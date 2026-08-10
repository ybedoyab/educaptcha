export const OPEN_FEED_ERRORS = {
  missingProvider: "useDemoSession must be used within DemoSessionProvider",
  unknownChallenge: (challengeId: string | null) =>
    `[EduCAPTCHA] unknown challengeId "${challengeId ?? "unknown"}" — releasing the pending action.`,
} as const;

