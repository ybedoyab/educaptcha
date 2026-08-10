/**
 * Bookface remote-mode coverage (chromium-remote / E2E_REMOTE).
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

async function gotoBookface(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem("educaptcha-intro-seen", "true");
  });
  await page.goto("/demo/bookface");
}

async function stub(page: Page, body: unknown, opts: { delayMs?: number } = {}) {
  await page.route(ANALYZE, async (route) => {
    const payload = route.request().postDataJSON();
    if (payload?.dryRun) {
      await route.fulfill({
        json: { decision: { outcome: "continue", shouldIntervene: false } },
      });
      return;
    }
    if (opts.delayMs) await new Promise((r) => setTimeout(r, opts.delayMs));
    await route.fulfill({ json: body });
  });
}

test("A: remote intercept opens EduCAPTCHA on Bookface", async ({ page }) => {
  await gotoBookface(page);
  await stub(page, intercept({ challengeId: "ep-spot", skill: "emotional-pressure" }));
  await page.locator("#share-p-flood-live").click();
  const dialog = page.locator("dialog[open]");
  await expect(dialog).toHaveCount(1);
  await expect(dialog).toContainText(/urgency|urgencia|signal|señal/i);
});

test("B: remote continue shares without dialog", async ({ page }) => {
  await gotoBookface(page);
  await stub(page, { decision: { outcome: "continue", shouldIntervene: false } });
  for (let i = 0; i < 3; i++) {
    await page.locator("#share-p-flood-live").click();
    await page.waitForTimeout(150);
  }
  await expect(page.locator("dialog[open]")).toHaveCount(0);
});

test("C: remote timeout falls back and stays usable", async ({ page }) => {
  test.setTimeout(60_000);
  await gotoBookface(page);
  await stub(page, intercept({ challengeId: "ep-spot" }), { delayMs: 6000 });
  await page.locator("#share-p-flood-live").click();
  await expect(page.locator("dialog[open]")).toHaveCount(1);
});

test("D: malformed challenge falls back without wedging", async ({ page }) => {
  await gotoBookface(page);
  await stub(page, intercept({ challengeId: "definitely-not-a-real-challenge" }));
  await page.locator("#share-p-flood-live").click();
  await expect(page.locator("dialog[open]")).toHaveCount(1);
});

test("E: double click Share posts analyze once and opens one dialog", async ({
  page,
}) => {
  await gotoBookface(page);
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

  const share = page.locator("#share-p-flood-live");
  await share.dblclick({ delay: 30 });
  await expect(page.locator("dialog[open]")).toHaveCount(1);
  expect(clickPosts).toBe(1);
});

test("F: double click image posts analyze once and opens one dialog", async ({
  page,
}) => {
  await gotoBookface(page);
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

test("G: share A then share B posts analyze once; B does not share", async ({
  page,
}) => {
  await gotoBookface(page);
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

  const postB = page.locator("#post-p-wildfire");
  const beforeEngagement = await postB.locator(".text-bf-muted").last().textContent();
  await page.locator("#share-p-flood-live").click();
  await page.locator("#share-p-wildfire").click({ force: true });
  await expect(page.locator("dialog[open]")).toHaveCount(1);
  expect(clickPosts).toBe(1);
  expect(actions).toEqual(["share:p-flood-live"]);
  await expect(postB.locator(".text-bf-muted").last()).toHaveText(
    beforeEngagement ?? "",
  );
});

test("H: image A then share B is one interactive request and at most one dialog", async ({
  page,
}) => {
  await gotoBookface(page);
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

  const postB = page.locator("#post-p-wildfire");
  const beforeEngagement = await postB.locator(".text-bf-muted").last().textContent();
  await page.locator("#repost-p-flood-live").click();
  await page.locator("#share-p-wildfire").click({ force: true });
  await expect(page.locator("dialog[open]")).toHaveCount(1);
  expect(clickPosts).toBe(1);
  expect(actions).toEqual(["repost-image:p-flood-live"]);
  await expect(postB.locator(".text-bf-muted").last()).toHaveText(
    beforeEngagement ?? "",
  );
});
