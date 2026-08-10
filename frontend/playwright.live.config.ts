import { defineConfig, devices } from "@playwright/test";

/**
 * Live smoke against the already-deployed site. No vite / webServer.
 *
 *   PLAYWRIGHT_BASE_URL=https://educaptcha.web.app npm run test:e2e:live
 */
const baseURL =
  process.env.PLAYWRIGHT_BASE_URL?.replace(/\/+$/, "") ||
  "https://educaptcha.web.app";

export default defineConfig({
  testDir: "./e2e-live",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: "list",
  timeout: 90_000,
  use: {
    baseURL,
    trace: "on-first-retry",
    reducedMotion: "reduce",
  },
  projects: [
    {
      name: "chromium-live",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile-live",
      use: { ...devices["Pixel 5"], viewport: { width: 390, height: 844 } },
      testMatch: /mobile\.spec\.ts/,
    },
  ],
});
