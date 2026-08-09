import { test, expect } from "@playwright/test";

async function bypassIntro(page: import("@playwright/test").Page) {
  await page.addInitScript(() => {
    localStorage.setItem("educaptcha-intro-seen", JSON.stringify(true));
  });
}

test("desktop demo uses the Y three-column layout", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await bypassIntro(page);
  await page.goto("/demo");

  await expect(
    page.getByRole("img", { name: /Y, (simulated social network|red social simulada)/i }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: /home|inicio/i })).toBeVisible();

  const main = page.getByTestId("open-feed-main");
  const mainBox = await main.boundingBox();
  expect(mainBox?.width).toBeGreaterThanOrEqual(590);
  expect(mainBox?.width).toBeLessThanOrEqual(601);
  await expect(page.getByRole("heading", { name: /trending now|tendencias/i })).toBeVisible();
});

test("mobile demo uses the Y header and bottom navigation", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await bypassIntro(page);
  await page.goto("/demo");

  const bottomNavigation = page.locator("nav.fixed.bottom-0");
  await expect(bottomNavigation).toBeVisible();
  await expect(page.getByRole("heading", { name: /trending now|tendencias/i })).toBeHidden();

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  );
  expect(overflow).toBe(false);

  const navigationButtons = bottomNavigation.getByRole("button");
  const count = await navigationButtons.count();
  for (let index = 0; index < count; index += 1) {
    const box = await navigationButtons.nth(index).boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);
  }
});

test("post detail closes with Escape and restores focus", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await bypassIntro(page);
  await page.goto("/demo");

  const commentAction = page.getByRole("button", { name: /comment|comentar/i }).first();
  await commentAction.click();

  const detail = page.locator(
    'dialog[open][aria-labelledby="post-detail-title"]',
  );
  await expect(detail).toBeVisible();
  await expect(detail.locator('input[id^="composer-"]')).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(detail).toHaveCount(0);
  await expect(commentAction).toBeFocused();
});
