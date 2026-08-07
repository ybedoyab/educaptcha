import { test, expect } from "@playwright/test";

/** Skip OpenFeed onboarding for interaction tests */
async function bypassIntro(page: import("@playwright/test").Page) {
  await page.addInitScript(() => {
    localStorage.setItem("educaptcha-intro-seen", JSON.stringify(true));
  });
}

test("landing has no critical axe violations", async ({ page }) => {
  const AxeBuilder = (await import("@axe-core/playwright")).default;
  await page.goto("/");
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .disableRules(["color-contrast"])
    .analyze();
  const critical = results.violations.filter((v) => v.impact === "critical");
  expect(critical, JSON.stringify(critical, null, 2)).toEqual([]);
});

test("challenge dialog closes with Escape", async ({ page }) => {
  await bypassIntro(page);
  await page.goto("/demo/scenario/image-context");
  await page.locator("#share-p-flood-live").click();
  await expect(page.locator("dialog[open]")).toHaveCount(1);
  await page.keyboard.press("Escape");
  await expect(page.locator("dialog[open]")).toHaveCount(0);
});
