import { test, expect } from "@playwright/test";

test.use({ viewport: { width: 390, height: 844 } });

test("mobile demo has no horizontal overflow and usable dialog", async ({
  page,
}) => {
  await page.goto("/demo/scenario/image-context");
  for (const label of [/next|siguiente/i, /start browsing|empezar/i]) {
    const btn = page.getByRole("button", { name: label });
    if (await btn.isVisible().catch(() => false)) await btn.click();
  }

  const overflow = await page.evaluate(() => {
    return (
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth + 1
    );
  });
  expect(overflow).toBe(false);

  await page.locator("#share-p-flood-live").click();
  const dialog = page.locator("dialog[open]");
  await expect(dialog).toHaveCount(1);
  const skip = dialog.getByRole("button", { name: /skip|omitir/i }).first();
  const skipBox = await skip.boundingBox();
  expect(skipBox?.height).toBeGreaterThanOrEqual(40);
});
