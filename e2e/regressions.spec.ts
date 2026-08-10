import { expect, test } from "@playwright/test";

test("cached feed photo becomes visible again inside the challenge", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem("educaptcha-intro-seen", JSON.stringify(true));
  });
  await page.goto("/demo/scenario/image-context");

  const feedImg = page.locator("#post-p-flood-live img").first();
  await expect(feedImg).toBeVisible();
  await expect
    .poll(async () => feedImg.evaluate((el: HTMLImageElement) => el.complete && el.naturalHeight > 0))
    .toBe(true);

  await page.locator("#share-p-flood-live").click();
  const dialog = page.locator("dialog[open]");
  await expect(dialog).toHaveCount(1);
  const challengeImg = dialog.locator("img").first();
  await expect(challengeImg).toBeVisible();
  await expect
    .poll(async () =>
      challengeImg.evaluate((el: HTMLImageElement) => el.complete && el.naturalHeight > 0),
    )
    .toBe(true);
  await expect(dialog.getByText(/photo could not be loaded|no se pudo cargar/i)).toHaveCount(0);
});

test("chart repair bars have non-zero visual height", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.removeItem("educaptcha-progress-v2");
    localStorage.setItem("educaptcha-index-v2", "0");
  });
  await page.goto("/practice");

  for (let i = 0; i < 10; i++) {
    if (
      await page
        .locator('[data-testid="chart-bar"], .bg-gradient-to-t.from-teal')
        .first()
        .isVisible()
        .catch(() => false)
    ) {
      break;
    }
    const skip = page.getByRole("button", { name: /skip|omitir/i });
    if (await skip.first().isVisible().catch(() => false)) {
      await skip.first().click();
      await page.waitForTimeout(150);
    } else {
      break;
    }
  }

  const bars = page.locator(".bg-gradient-to-t.from-teal");
  await expect(bars.first()).toBeVisible({ timeout: 15000 });
  const count = await bars.count();
  expect(count).toBeGreaterThanOrEqual(2);
  for (let i = 0; i < count; i++) {
    const box = await bars.nth(i).boundingBox();
    expect(box, `bar ${i} missing box`).toBeTruthy();
    expect(box!.height).toBeGreaterThan(2);
  }
});
