import { expect, test, type Page } from "@playwright/test";

async function bypassIntro(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem("educaptcha-intro-seen", JSON.stringify(true));
  });
}

async function completeSpotCheckDecide(page: Page) {
  await page
    .getByRole("button", { name: /check the source|revisar la fuente/i })
    .click();
  await expect(page.getByText(/Lagos, Nigeria/i)).toBeVisible();
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

test("Y and Bookface share the same educational logic for image-context", async ({
  page,
}) => {
  await bypassIntro(page);

  await page.goto("/demo/scenario/image-context");
  await expect(page.locator("#post-p-flood-live")).toBeVisible();
  await page.locator("#share-p-flood-live").click();
  await expect(page.locator("dialog[open]")).toHaveCount(1);
  await completeSpotCheckDecide(page);
  await expect(
    page.getByRole("button", {
      name: /cancel and check source|cancelar y revisar fuente/i,
    }),
  ).toBeVisible();

  await page.goto("/demo/bookface/scenario/image-context");
  await expect(page.locator("#post-p-flood-live")).toBeVisible();
  await page.locator("#share-p-flood-live").click();
  await expect(page.locator("dialog[open]")).toHaveCount(1);
  await completeSpotCheckDecide(page);
  await expect(
    page.getByRole("button", {
      name: /cancel and check source|cancelar y revisar fuente/i,
    }),
  ).toBeVisible();
});
