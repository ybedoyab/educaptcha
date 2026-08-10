import { test, expect } from "@playwright/test";
import {
  completeImageContextFlow,
  expectCancelShareVisible,
} from "./helpers/imageContextFlow";

async function dismissIntro(page: import("@playwright/test").Page) {
  await page.addInitScript(() => {
    localStorage.setItem("educaptcha-intro-seen", JSON.stringify(true));
  });
}

test.describe("image-context simplified flow", () => {
  test("intercept → check → decide → result → return", async ({ page }) => {
    test.setTimeout(60_000);
    await dismissIntro(page);
    await page.goto("/demo/scenario/image-context");

    await expect(page.locator("dialog[open]")).toHaveCount(0);
    await page.locator("#share-p-flood-live").click();
    await expect(page.locator("dialog[open]")).toHaveCount(1);

    await expect(
      page
        .locator("dialog[open]")
        .getByRole("button", { name: /check photo|revisar foto/i }),
    ).toBeVisible();
    await expect(
      page
        .locator("dialog[open]")
        .getByText(
          /before you share, check this photo|antes de compartir, revisa esta foto/i,
        ),
    ).toBeVisible();

    await completeImageContextFlow(page);

    await expectCancelShareVisible(page);
    await expect(
      page.getByRole("button", {
        name: /share anyway|compartir igual/i,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /^open source$|^abrir fuente$/i }),
    ).toHaveCount(0);
  });
});
