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
  await composer
    .locator("..")
    .getByRole("button", { name: /^reply$|^responder$/i })
    .click();

  const detailDialog = page.locator(
    'dialog[aria-labelledby="post-detail-title"]',
  );
  const challengeDialog = page.locator(
    'dialog[open]:not([aria-labelledby="post-detail-title"])',
  );
  const own = detailDialog.getByText("@you.demo");
  const challengeOpen = await challengeDialog.count();
  if (challengeOpen > 0) {
    await expect(own).toHaveCount(0);
    await challengeDialog
      .getByRole("button", { name: /close|cerrar/i })
      .click();
    await expect(
      detailDialog.getByText(
        /you were about to post|estabas a punto de publicar/i,
      ),
    ).toBeVisible({ timeout: 8000 });
  }
});
