import { test, expect } from "@playwright/test";

async function dismissIntro(page: import("@playwright/test").Page) {
  await page.addInitScript(() => {
    localStorage.setItem("educaptcha-intro-seen", JSON.stringify(true));
  });
}

test.describe("image-context simplified flow", () => {
  test("spot → check source → decide → return", async ({ page }) => {
    await dismissIntro(page);
    await page.goto("/demo/scenario/image-context");

    await expect(page.locator("dialog[open]")).toHaveCount(0);
    await page.locator("#share-p-flood-live").click();
    await expect(page.locator("dialog[open]")).toHaveCount(1);

    // Exactly one primary CTA at spot
    await expect(
      page.getByRole("button", { name: /check the source|revisar la fuente/i }),
    ).toBeVisible();
    await expect(page.getByText(/before you share, check one thing|antes de compartir, revisa una cosa/i)).toBeVisible();

    await page.getByRole("button", { name: /check the source|revisar la fuente/i }).click();

    // Source trace visible
    await expect(page.getByText(/no original source provided|sin fuente original/i)).toBeVisible();
    await expect(page.getByText(/lagos, nigeria/i)).toBeVisible();
    await page.getByRole("button", { name: /choose what this means|elegir qué significa/i }).click();

    await page.getByRole("button", { name: /real image, wrong context|imagen real, contexto incorrecto/i }).click();
    await page.getByRole("button", { name: /check|comprobar/i }).click();

    await page.getByRole("button", { name: /continue|continuar/i }).first().click();

    await expect(
      page.getByRole("button", { name: /cancel & check source|cancelar y revisar fuente/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /share anyway|compartir de todos modos/i }),
    ).toBeVisible();
    // No third open-source button
    await expect(page.getByRole("button", { name: /^open source$|^abrir fuente$/i })).toHaveCount(0);
  });
});
