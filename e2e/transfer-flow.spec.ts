import { test, expect } from "@playwright/test";

test("transfer appears only after resolving pending intent", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem("educaptcha-intro-seen", JSON.stringify(true));
  });
  await page.goto("/demo/scenario/image-context");

  await page.locator("#share-p-flood-live").click();
  await expect(page.locator("dialog[open]")).toHaveCount(1);
  await page.locator("dialog[open]").getByRole("button", { name: /close|cerrar/i }).click();
  await expect(
    page.getByRole("button", {
      name: /cancel & check source|cancelar y revisar fuente/i,
    }),
  ).toBeVisible();
  await expect(page.locator("dialog[open]")).toHaveCount(0);
  await page
    .getByRole("button", {
      name: /cancel & check source|cancelar y revisar fuente/i,
    })
    .click();
  await expect(page.locator("#post-p-flood-today")).toBeVisible();
});
