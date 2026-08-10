import { expect, type Page } from "@playwright/test";

function dialog(page: Page) {
  return page.locator("dialog[open]");
}

async function clickInDialog(page: Page, name: RegExp) {
  const btn = dialog(page).getByRole("button", { name }).first();
  await expect(btn).toBeVisible({ timeout: 15_000 });
  await btn.scrollIntoViewIfNeeded();
  await btn.click({ force: true, timeout: 15_000 });
}

/** Complete INTERCEPT → CHECK → DECIDE → RESULT → Continue (return-to-context). */
export async function completeImageContextFlow(page: Page) {
  await clickInDialog(page, /check photo|revisar foto/i);
  await clickInDialog(page, /what does this mean|qué significa/i);
  await clickInDialog(
    page,
    /real image used in the wrong context|imagen real usada en el contexto equivocado/i,
  );
  await clickInDialog(page, /see result|ver resultado/i);
  await clickInDialog(page, /continue|continuar/i);
  await expect(page.locator("dialog[open]")).toHaveCount(0, {
    timeout: 15_000,
  });
}

export async function expectCancelShareVisible(page: Page) {
  await expect(
    page.getByRole("button", {
      name: /cancel share|cancelar compartir/i,
    }),
  ).toBeVisible({ timeout: 15_000 });
}
