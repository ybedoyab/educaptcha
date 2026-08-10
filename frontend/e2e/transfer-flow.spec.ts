import { test, expect } from "@playwright/test";
import { completeImageContextFlow } from "./helpers/imageContextFlow";

test("transfer flow uses West Columbia metadata, not Lagos", async ({
  page,
}) => {
  test.setTimeout(90_000);
  await page.addInitScript(() => {
    localStorage.setItem("educaptcha-intro-seen", JSON.stringify(true));
  });
  await page.goto("/demo/scenario/image-context");

  await page.locator("#share-p-flood-live").click();
  await expect(page.locator("dialog[open]")).toHaveCount(1);
  await completeImageContextFlow(page);

  await expect(
    page.getByRole("button", {
      name: /cancel share|cancelar compartir/i,
    }),
  ).toBeVisible();
  await page
    .getByRole("button", {
      name: /cancel share|cancelar compartir/i,
    })
    .click();

  await expect(page.locator("#post-p-flood-today")).toBeVisible();
  await page.locator("#share-p-flood-today").click();
  await expect(page.locator("dialog[open]")).toHaveCount(1);

  const d = page.locator("dialog[open]");
  await d.getByRole("button", { name: /check photo|revisar foto/i }).click({
    force: true,
  });
  await expect(d.getByText(/West Columbia/i)).toBeVisible();
  await expect(d.getByText(/October 11, 2015/i).first()).toBeVisible();
  await expect(d.getByText(/Lagos/i)).toHaveCount(0);

  // Already on Check — finish Decide → Result → Continue
  await d
    .getByRole("button", { name: /what does this mean|qué significa/i })
    .click({ force: true });
  await d
    .getByRole("button", {
      name: /real image used in the wrong context|imagen real usada en el contexto equivocado/i,
    })
    .click({ force: true });
  await d
    .getByRole("button", { name: /see result|ver resultado/i })
    .click({ force: true });
  await d
    .getByRole("button", { name: /continue|continuar/i })
    .first()
    .click({ force: true });
  await expect(page.locator("dialog[open]")).toHaveCount(0);
});
