import { defineConfig, devices } from "@playwright/test";

/**
 * `VITE_*` is inlined at build time and `vite preview` serves a prebuilt `dist`,
 * so the remote-mode path cannot be toggled on the default server — it needs its
 * own build (`dist-remote`) and its own project.
 *
 * Both are gated behind E2E_REMOTE so the everyday `npx playwright test` does
 * not pay for a second build and server. CI sets it.
 */
const REMOTE = !!process.env.E2E_REMOTE;

// A port nothing listens on: every request is intercepted with page.route, so a
// spec that forgets to stub fails fast instead of hanging on a real socket.
const REMOTE_API = "http://127.0.0.1:4599";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "on-first-retry",
    reducedMotion: "reduce",
  },
  webServer: [
    {
      command: "npm run preview -- --host 127.0.0.1 --port 4173",
      url: "http://127.0.0.1:4173",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    ...(REMOTE
      ? [
          {
            command: `npm run build:remote && npx vite preview --outDir dist-remote --host 127.0.0.1 --port 4174`,
            url: "http://127.0.0.1:4174",
            reuseExistingServer: !process.env.CI,
            timeout: 180_000,
            env: { VITE_RISK_API_URL: REMOTE_API },
          },
        ]
      : []),
  ],
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      testIgnore: /remote\.spec\.ts/,
    },
    ...(REMOTE
      ? [
          {
            name: "chromium-remote",
            use: { ...devices["Desktop Chrome"], baseURL: "http://127.0.0.1:4174" },
            testMatch: /remote\.spec\.ts/,
          },
        ]
      : []),
  ],
});
