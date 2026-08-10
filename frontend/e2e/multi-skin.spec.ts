import { expect, test, type Page } from "@playwright/test";
import {
  completeImageContextFlow,
  expectCancelShareVisible,
} from "./helpers/imageContextFlow";

async function bypassIntro(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem("educaptcha-intro-seen", JSON.stringify(true));
  });
}

test("Y and Bookface share the same educational logic for image-context", async ({
  page,
}) => {
  await bypassIntro(page);

  await page.goto("/demo/scenario/image-context");
  await expect(page.locator("#post-p-flood-live")).toBeVisible();
  await page.locator("#share-p-flood-live").click();
  await expect(page.locator("dialog[open]")).toHaveCount(1);
  await completeImageContextFlow(page);
  await expectCancelShareVisible(page);

  await page.goto("/demo/bookface/scenario/image-context");
  await expect(page.locator("#post-p-flood-live")).toBeVisible();
  await page.locator("#share-p-flood-live").click();
  await expect(page.locator("dialog[open]")).toHaveCount(1);
  await completeImageContextFlow(page);
  await expectCancelShareVisible(page);
});
