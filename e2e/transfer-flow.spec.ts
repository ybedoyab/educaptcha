import { test, expect } from "@playwright/test";

async function finishFromDecide(page: import("@playwright/test").Page) {
  await page
    .getByRole("button", {
      name: /choose what this means|elegir qué significa/i,
    })
    .click();
  await page
    .getByRole("button", {
      name: /real image, wrong context|imagen real, contexto incorrecto/i,
    })
    .click();
  await page.getByRole("button", { name: /check|comprobar/i }).click();
  await page.getByRole("button", { name: /continue|continuar/i }).first().click();
}

test("transfer flow uses West Columbia metadata, not Lagos", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem("educaptcha-intro-seen", JSON.stringify(true));
  });
  await page.goto("/demo/scenario/image-context");

  // Open and complete Lagos challenge
  await page.locator("#share-p-flood-live").click();
  await expect(page.locator("dialog[open]")).toHaveCount(1);
  await page
    .getByRole("button", { name: /check the source|revisar la fuente/i })
    .click();
  await expect(page.getByText(/Lagos, Nigeria/i)).toBeVisible();
  await finishFromDecide(page);

  // Return to feed → Cancel & check source
  await expect(
    page.getByRole("button", {
      name: /cancel & check source|cancelar y revisar fuente/i,
    }),
  ).toBeVisible();
  await page
    .getByRole("button", {
      name: /cancel & check source|cancelar y revisar fuente/i,
    })
    .click();

  // Transfer post → share opens second EduCAPTCHA
  await expect(page.locator("#post-p-flood-today")).toBeVisible();
  await page.locator("#share-p-flood-today").click();
  await expect(page.locator("dialog[open]")).toHaveCount(1);

  await page
    .getByRole("button", { name: /check the source|revisar la fuente/i })
    .click();
  await expect(page.getByText(/West Columbia/i)).toBeVisible();
  await expect(page.getByText(/2015/)).toBeVisible();
  await expect(page.locator("dialog[open]").getByText(/Lagos/i)).toHaveCount(0);

  await finishFromDecide(page);
  await expect(page.locator("dialog[open]")).toHaveCount(0);
});
