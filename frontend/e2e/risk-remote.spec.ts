/**
 * Behaviour that only exists when `VITE_RISK_API_URL` is set.
 *
 * Runs against the `dist-remote` build on :4174 (see playwright.config.ts) and
 * is gated behind E2E_REMOTE. Requests are intercepted with `page.route`, so no
 * real backend is needed and malformed bodies / timeouts are easy to simulate.
 *
 * These use `/demo` rather than `/demo/scenario/...`: guided scenarios are
 * deliberately decided locally and never consult the service.
 */
import { expect, test, type Page } from "@playwright/test";

const ANALYZE = "**/risk/analyze";

const intercept = (over: Record<string, unknown> = {}) => ({
  decision: {
    outcome: "intercept",
    shouldIntervene: true,
    skill: "image-context",
    challengeId: "ic-match",
    transferChallengeId: "ic-transfer",
    transferPostId: "p-flood-today",
    reason: {
      en: "Before sharing this image, check when and where it was taken.",
      es: "Antes de compartir esta imagen, comprueba cuándo y dónde fue tomada.",
    },
    ...over,
  },
  diagnostics: { riskScore: 0.82, threshold: 0.55, path: "graph", latencyMs: 12 },
  session: { id: "t", actionsSinceLastIntervention: 0, recentSkills: [] },
  schemaVersion: 1,
});

async function gotoDemo(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem("educaptcha-intro-seen", "true");
  });
  await page.goto("/demo");
}

/** Answer prefetches (dryRun) quietly; let the test control the click request. */
async function stub(page: Page, body: unknown, opts: { delayMs?: number } = {}) {
  await page.route(ANALYZE, async (route) => {
    const payload = route.request().postDataJSON();
    if (payload?.dryRun) {
      await route.fulfill({ json: { decision: { outcome: "continue", shouldIntervene: false } } });
      return;
    }
    if (opts.delayMs) await new Promise((r) => setTimeout(r, opts.delayMs));
    await route.fulfill({ json: body });
  });
}

test("a remote intercept opens the challenge the service chose", async ({ page }) => {
  await gotoDemo(page);
  // ep-spot, deliberately NOT what the local engine would pick for this post.
  await stub(page, intercept({ challengeId: "ep-spot", skill: "emotional-pressure" }));

  await page.locator("#share-p-flood-live").click();

  const dialog = page.locator("dialog[open]");
  await expect(dialog).toHaveCount(1);
  await expect(dialog).toContainText(/urgency|urgencia|signal|señal/i);
});

test("shouldIntervene:false lets the share through with no dialog", async ({ page }) => {
  await gotoDemo(page);
  await stub(page, { decision: { outcome: "continue", shouldIntervene: false } });

  // Three shares would normally clear the local cooldown and interrupt.
  for (let i = 0; i < 3; i++) {
    await page.locator("#share-p-flood-live").click();
    await page.waitForTimeout(150);
  }
  await expect(page.locator("dialog[open]")).toHaveCount(0);
});

test("an unknown challengeId falls back to local and still opens a dialog", async ({
  page,
}) => {
  // The anti-wedge regression: an id outside experienceMinigames must never
  // leave the user stuck with a pending action and no dialog.
  await gotoDemo(page);
  await stub(page, intercept({ challengeId: "definitely-not-a-real-challenge" }));

  for (let i = 0; i < 3; i++) {
    await page.locator("#share-p-flood-live").click();
    await page.waitForTimeout(200);
  }
  await expect(page.locator("dialog[open]")).toHaveCount(1);
});

test("a slow service falls back to the local decision", async ({ page }) => {
  await gotoDemo(page);
  // Well past the 1500ms client budget.
  await stub(page, intercept({ challengeId: "ep-spot" }), { delayMs: 3000 });

  for (let i = 0; i < 3; i++) {
    await page.locator("#share-p-flood-live").click();
    await page.waitForTimeout(250);
  }
  // Local engine picked ic-match for this post, not the service's ep-spot.
  const dialog = page.locator("dialog[open]");
  await expect(dialog).toHaveCount(1);
  await expect(dialog).toContainText(/when and where|cuándo y dónde/i);
});

test("a 500 from the service is invisible to the user", async ({ page }) => {
  await gotoDemo(page);
  await page.route(ANALYZE, (route) => route.fulfill({ status: 500, body: "boom" }));

  for (let i = 0; i < 3; i++) {
    await page.locator("#share-p-flood-live").click();
    await page.waitForTimeout(150);
  }
  await expect(page.locator("dialog[open]")).toHaveCount(1);
  await expect(page.locator("body")).not.toContainText(/error|failed|500/i);
});

test("a malformed body falls back rather than crashing", async ({ page }) => {
  await gotoDemo(page);
  await stub(page, { decision: { outcome: "intercept", shouldIntervene: true } }); // no challengeId

  for (let i = 0; i < 3; i++) {
    await page.locator("#share-p-flood-live").click();
    await page.waitForTimeout(150);
  }
  await expect(page.locator("dialog[open]")).toHaveCount(1);
});

test("guided scenarios never call the service", async ({ page }) => {
  let clickCalls = 0;
  await page.addInitScript(() => {
    localStorage.setItem("educaptcha-intro-seen", "true");
  });
  await page.route(ANALYZE, async (route) => {
    if (!route.request().postDataJSON()?.dryRun) clickCalls += 1;
    await route.fulfill({ json: { decision: { outcome: "continue", shouldIntervene: false } } });
  });

  await page.goto("/demo/scenario/image-context");
  await page.locator("#share-p-flood-live").click();

  await expect(page.locator("dialog[open]")).toHaveCount(1);
  expect(clickCalls, "guided path must stay local so the pitch never depends on the network").toBe(0);
});

test("rapid double-click Share posts analyze once and opens one dialog", async ({
  page,
}) => {
  await gotoDemo(page);
  let clickPosts = 0;
  await page.route(ANALYZE, async (route) => {
    const payload = route.request().postDataJSON();
    if (payload?.dryRun) {
      await route.fulfill({
        json: { decision: { outcome: "continue", shouldIntervene: false } },
      });
      return;
    }
    clickPosts += 1;
    await page.waitForTimeout(400);
    await route.fulfill({ json: intercept() });
  });

  const before = await page.locator("#share-p-flood-live").textContent();
  await page.locator("#share-p-flood-live").dblclick({ delay: 30 });
  await expect(page.locator("dialog[open]")).toHaveCount(1);
  expect(clickPosts).toBe(1);
  // Share count must not have advanced before the remote decision (dialog open).
  await expect(page.locator("#share-p-flood-live")).toHaveText(before ?? "");
});

test("rapid double-click image posts analyze once and opens one dialog", async ({
  page,
}) => {
  await gotoDemo(page);
  let clickPosts = 0;
  await page.route(ANALYZE, async (route) => {
    const payload = route.request().postDataJSON();
    if (payload?.dryRun) {
      await route.fulfill({
        json: { decision: { outcome: "continue", shouldIntervene: false } },
      });
      return;
    }
    clickPosts += 1;
    await page.waitForTimeout(400);
    await route.fulfill({ json: intercept() });
  });

  await page.locator("#repost-p-flood-live").dblclick({ delay: 30 });
  await expect(page.locator("dialog[open]")).toHaveCount(1);
  expect(clickPosts).toBe(1);
});

test("share A then immediately share B posts analyze once; B does not share", async ({
  page,
}) => {
  await gotoDemo(page);
  let clickPosts = 0;
  const actions: string[] = [];
  await page.route(ANALYZE, async (route) => {
    const payload = route.request().postDataJSON();
    if (payload?.dryRun) {
      await route.fulfill({
        json: { decision: { outcome: "continue", shouldIntervene: false } },
      });
      return;
    }
    clickPosts += 1;
    actions.push(`${payload.action}:${payload.post.id}`);
    await page.waitForTimeout(500);
    await route.fulfill({ json: intercept() });
  });

  const shareB = page.locator("#share-p-wildfire");
  const beforeB = await shareB.textContent();
  await page.locator("#share-p-flood-live").click();
  await shareB.click({ force: true });
  await expect(page.locator("dialog[open]")).toHaveCount(1);
  expect(clickPosts).toBe(1);
  expect(actions).toEqual(["share:p-flood-live"]);
  await expect(shareB).toHaveText(beforeB ?? "");
});

test("image A then share B is one interactive request and at most one dialog", async ({
  page,
}) => {
  await gotoDemo(page);
  let clickPosts = 0;
  const actions: string[] = [];
  await page.route(ANALYZE, async (route) => {
    const payload = route.request().postDataJSON();
    if (payload?.dryRun) {
      await route.fulfill({
        json: { decision: { outcome: "continue", shouldIntervene: false } },
      });
      return;
    }
    clickPosts += 1;
    actions.push(`${payload.action}:${payload.post.id}`);
    await page.waitForTimeout(500);
    await route.fulfill({ json: intercept() });
  });

  const shareB = page.locator("#share-p-wildfire");
  const beforeB = await shareB.textContent();
  await page.locator("#repost-p-flood-live").click();
  await shareB.click({ force: true });
  await expect(page.locator("dialog[open]")).toHaveCount(1);
  expect(clickPosts).toBe(1);
  expect(actions).toEqual(["repost-image:p-flood-live"]);
  await expect(shareB).toHaveText(beforeB ?? "");
});
