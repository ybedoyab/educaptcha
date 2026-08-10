import { expect, test } from "@playwright/test";

test("Check source / verify controls acknowledge without claiming a source opened", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem("educaptcha-intro-seen", JSON.stringify(true));
  });
  await page.goto("/demo/scenario/image-context");

  await page.locator("#share-p-flood-live").click();
  await page
    .getByRole("button", { name: /check the source|revisar la fuente/i })
    .click();
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

  const cancel = page.getByRole("button", {
    name: /cancel and check source|cancelar y revisar fuente/i,
  });
  await expect(cancel).toBeVisible();
  await cancel.click();

  await expect(
    page.getByText(/verify the original source|verifica la fuente original/i),
  ).toBeVisible();
  await expect(page.getByText(/source opened|fuente abierta/i)).toHaveCount(0);
});
