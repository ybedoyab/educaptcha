import { test, expect } from "@playwright/test";

test.use({ viewport: { width: 390, height: 844 } });

test("mobile demo has no horizontal overflow and usable dialog", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem("educaptcha-intro-seen", JSON.stringify(true));
  });
  await page.goto("/demo/scenario/image-context");

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
  const close = dialog.getByRole("button", { name: /close|cerrar/i });
  const closeBox = await close.boundingBox();
  expect(closeBox?.height).toBeGreaterThanOrEqual(40);
});
