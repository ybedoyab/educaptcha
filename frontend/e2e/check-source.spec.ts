import { expect, test } from "@playwright/test";
import { completeImageContextFlow } from "./helpers/imageContextFlow";

test("Cancel share acknowledges verification without claiming a source opened", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem("educaptcha-intro-seen", JSON.stringify(true));
  });
  await page.goto("/demo/scenario/image-context");

  await page.locator("#share-p-flood-live").click();
  await completeImageContextFlow(page);

  const cancel = page.getByRole("button", {
    name: /cancel share|cancelar compartir/i,
  });
  await expect(cancel).toBeVisible();
  await cancel.click();

  await expect(
    page.getByText(/verify the original source|verifica la fuente original/i),
  ).toBeVisible();
  await expect(page.getByText(/source opened|fuente abierta/i)).toHaveCount(0);
});
