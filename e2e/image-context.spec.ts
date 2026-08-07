import { test, expect } from "@playwright/test";

test.describe("image-context scenario", () => {
  test("guided share flow without auto-modal", async ({ page }) => {
    await page.goto("/demo/scenario/image-context");
    // dismiss intro if present
    const start = page.getByRole("button", { name: /start browsing|empezar|next|siguiente/i });
    if (await start.first().isVisible().catch(() => false)) {
      await start.first().click();
      const start2 = page.getByRole("button", { name: /start browsing|empezar/i });
      if (await start2.isVisible().catch(() => false)) await start2.click();
    }

    await expect(page.locator("dialog[open]")).toHaveCount(0);
    const post = page.locator("#post-p-flood-live");
    await expect(post).toBeVisible();
    await expect(post).toHaveClass(/ring-teal|ring-2/);

    const sharesBefore = await post.locator("#share-p-flood-live").innerText();
    await post.locator("#share-p-flood-live").click();

    await expect(page.locator("dialog[open]")).toHaveCount(1);
    // single header branding — Logo once in dialog header
    const logos = page.locator("dialog[open]").getByLabel("EduCAPTCHA home").or(
      page.locator("dialog[open] svg").first(),
    );
    await expect(page.locator("dialog[open]")).toContainText(/EduCAPTCHA|visual context|contexto/i);

    await page.getByRole("button", { name: /check this image|revisar esta imagen/i }).click();
    await page.getByRole("tab", { name: /source|fuente/i }).click();
    await page.getByRole("tab", { name: /date and location|fecha y ubicación/i }).click();
    await page.getByRole("tab", { name: /archive matches|coincidencias de archivo/i }).click();

    // select wrong then correct archive if visible
    const archiveButtons = page.locator("dialog[open] li button");
    const count = await archiveButtons.count();
    if (count >= 2) {
      await archiveButtons.nth(1).click();
      await page.getByRole("button", { name: /continue to decide|continuar a decidir/i }).click();
      await page.getByRole("button", { name: /current local photo|foto local actual/i }).click();
      await page.getByRole("button", { name: /check|comprobar/i }).click();
      // may get hint; try correct path
      const wrongContext = page.getByRole("button", {
        name: /authentic photo used in the wrong context|foto auténtica usada/i,
      });
      if (await wrongContext.isVisible().catch(() => false)) {
        await wrongContext.click();
        await page.getByRole("button", { name: /check|comprobar/i }).click();
      }
    }

    const continueBtn = page.getByRole("button", { name: /continue|continuar/i });
    if (await continueBtn.first().isVisible().catch(() => false)) {
      await continueBtn.first().click();
    }

    // return options
    await expect(
      page.getByRole("button", { name: /share anyway|compartir de todos modos/i }),
    ).toBeVisible({ timeout: 10000 });
    await expect(
      page.getByRole("button", { name: /cancel share|cancelar envío/i }),
    ).toBeVisible();

    // share count should not have increased yet
    const sharesAfter = await post.locator("#share-p-flood-live").innerText();
    expect(sharesAfter.replace(/\D/g, "")).toBe(sharesBefore.replace(/\D/g, ""));
  });
});
