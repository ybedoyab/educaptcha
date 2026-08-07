import { test, expect } from "@playwright/test";

async function bypassIntro(page: import("@playwright/test").Page) {
  await page.addInitScript(() => {
    localStorage.setItem("educaptcha-intro-seen", JSON.stringify(true));
  });
}

async function analyzeSerious(
  page: import("@playwright/test").Page,
  label: string,
) {
  const AxeBuilder = (await import("@axe-core/playwright")).default;
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .disableRules(["color-contrast"])
    .analyze();
  const bad = results.violations.filter(
    (v) => v.impact === "critical" || v.impact === "serious",
  );
  expect(bad, `${label}: ${JSON.stringify(bad, null, 2)}`).toEqual([]);
}

test("landing has no critical/serious axe violations", async ({ page }) => {
  await page.goto("/");
  await analyzeSerious(page, "landing");
});

test("demo feed has no critical/serious axe violations", async ({ page }) => {
  await bypassIntro(page);
  await page.goto("/demo/scenario/image-context");
  await analyzeSerious(page, "demo-feed");
});

test("open challenge has no critical/serious axe violations", async ({
  page,
}) => {
  await bypassIntro(page);
  await page.goto("/demo/scenario/image-context");
  await page.locator("#share-p-flood-live").click();
  await expect(page.locator("dialog[open]")).toHaveCount(1);
  await analyzeSerious(page, "challenge-open");
});

test("practice mode has no critical/serious axe violations", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.removeItem("educaptcha-progress-v2");
    localStorage.setItem("educaptcha-index-v2", "0");
  });
  await page.goto("/practice");
  await analyzeSerious(page, "practice");
});

test("challenge dialog closes with Escape", async ({ page }) => {
  await bypassIntro(page);
  await page.goto("/demo/scenario/image-context");
  await page.locator("#share-p-flood-live").click();
  await expect(page.locator("dialog[open]")).toHaveCount(1);
  await page.keyboard.press("Escape");
  await expect(page.locator("dialog[open]")).toHaveCount(0);
});
