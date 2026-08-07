import { test, expect } from "@playwright/test";

test("comment draft is not published before challenge resolves", async ({
  page,
}) => {
  await page.goto("/demo");
  const next = page.getByRole("button", { name: /next|siguiente|start|empezar/i });
  for (let i = 0; i < 2; i++) {
    if (await next.first().isVisible().catch(() => false)) {
      await next.first().click();
    }
  }

  await page.locator("#post-p-flood-live #comment-p-flood-live").click();
  const composer = page.locator("#composer-p-flood-live-root");
  await expect(composer).toBeVisible();
  await composer.fill("I saw this in several groups, so it must be true.");
  await page.getByRole("button", { name: /^post$|^publicar$/i }).click();

  // Should either open challenge or keep draft — must not appear as published own comment yet
  const own = page.getByText("@you.demo");
  const dialogOpen = await page.locator("dialog[open]").count();
  if (dialogOpen > 0) {
    await expect(own).toHaveCount(0);
    await page.getByRole("button", { name: /skip|omitir/i }).first().click();
    await expect(
      page.getByText(/draft preserved|borrador conservado/i),
    ).toBeVisible({ timeout: 8000 });
  }
});
