import { test, expect } from "@playwright/test";

test("transfer appears only after resolving pending intent", async ({
  page,
}) => {
  await page.goto("/demo/scenario/image-context");
  for (const label of [/next|siguiente/i, /start browsing|empezar/i]) {
    const btn = page.getByRole("button", { name: label });
    if (await btn.isVisible().catch(() => false)) await btn.click();
  }

  await page.locator("#share-p-flood-live").click();
  await expect(page.locator("dialog[open]")).toHaveCount(1);
  await page.getByRole("button", { name: /skip|omitir/i }).first().click();
  await expect(
    page.getByRole("button", { name: /share anyway|compartir de todos modos/i }),
  ).toBeVisible();
  // transfer toast should not force a second dialog yet
  await expect(page.locator("dialog[open]")).toHaveCount(0);
  await page.getByRole("button", { name: /cancel share|cancelar envío/i }).click();
  // after cancel, transfer highlight may appear
  await expect(page.locator("#post-p-flood-today")).toBeVisible();
});
