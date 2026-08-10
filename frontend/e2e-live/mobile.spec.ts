import { expect, test } from "@playwright/test";

test("mobile 390x844: no horizontal overflow and usable challenge modal", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem("educaptcha-intro-seen", JSON.stringify(true));
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/demo/scenario/image-context");

  const overflow = await page.evaluate(() => {
    const doc = document.documentElement;
    return doc.scrollWidth > doc.clientWidth + 1;
  });
  expect(overflow).toBe(false);

  await page.locator("#share-p-flood-live").click();
  const dialog = page.locator("dialog[open]");
  await expect(dialog).toHaveCount(1, { timeout: 20_000 });
  await expect(
    dialog.getByRole("button", { name: /^Check photo$|^Revisar foto$/i }),
  ).toBeVisible();
  const box = await dialog.boundingBox();
  expect(box).toBeTruthy();
  expect(box!.width).toBeLessThanOrEqual(390);
  expect(box!.height).toBeGreaterThan(80);
});
