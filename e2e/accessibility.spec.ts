import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("landing has no critical axe violations", async ({ page }) => {
  await page.goto("/");
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .disableRules(["color-contrast"])
    .analyze();
  const critical = results.violations.filter((v) => v.impact === "critical");
  expect(critical, JSON.stringify(critical, null, 2)).toEqual([]);
});

test("challenge dialog closes with Escape", async ({ page }) => {
  await page.goto("/demo/scenario/image-context");
  for (const label of [/next|siguiente/i, /start browsing|empezar/i]) {
    const btn = page.getByRole("button", { name: label });
    if (await btn.isVisible().catch(() => false)) await btn.click();
  }
  const share = page.locator("#share-p-flood-live");
  await share.click();
  await expect(page.locator("dialog[open]")).toHaveCount(1);
  await page.keyboard.press("Escape");
  await expect(page.locator("dialog[open]")).toHaveCount(0);
});
