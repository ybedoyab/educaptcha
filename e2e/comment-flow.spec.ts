import { test, expect } from "@playwright/test";

test("comment draft is not published before challenge resolves", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem("educaptcha-intro-seen", JSON.stringify(true));
  });
  await page.goto("/demo");

  await page.locator("#post-p-flood-live #comment-p-flood-live").click();
  const composer = page.locator("#composer-p-flood-live-root");
  await expect(composer).toBeVisible();
  await composer.fill("I saw this in several groups, so it must be true.");
  await page.getByRole("button", { name: /^post$|^publicar$/i }).click();

  const own = page.getByText("@you.demo");
  const dialogOpen = await page.locator("dialog[open]").count();
  if (dialogOpen > 0) {
    await expect(own).toHaveCount(0);
    await page
      .locator("dialog[open]")
      .getByRole("button", { name: /close|cerrar/i })
      .click();
    await expect(
      page.getByText(/you were about to post|estabas a punto de publicar/i),
    ).toBeVisible({ timeout: 8000 });
  }
});
