import { test, expect } from "@playwright/test";

const BRAND = /Bookface, (simulated social network|red social simulada)/i;

async function bypassIntro(page: import("@playwright/test").Page) {
  await page.addInitScript(() => {
    localStorage.setItem("educaptcha-intro-seen", JSON.stringify(true));
  });
}

test("desktop bookface uses the three-column card layout", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await bypassIntro(page);
  await page.goto("/demo/bookface");

  await expect(page.getByRole("img", { name: BRAND })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /sponsored|publicidad/i }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /contacts|contactos/i }),
  ).toBeVisible();

  // Feed cards sit in a narrow centre column, as on the real layout.
  const card = page.locator("article").first();
  const cardBox = await card.boundingBox();
  expect(cardBox?.width).toBeGreaterThan(480);
  expect(cardBox?.width).toBeLessThanOrEqual(590);
});

test("mobile bookface drops the rails and keeps tap targets", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await bypassIntro(page);
  await page.goto("/demo/bookface");

  await expect(
    page.getByRole("heading", { name: /contacts|contactos/i }),
  ).toBeHidden();

  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth + 1,
  );
  expect(overflow).toBe(false);

  const tabs = page.getByRole("navigation", { name: BRAND }).getByRole("button");
  await expect(tabs).toHaveCount(5);
  const count = await tabs.count();
  for (let index = 0; index < count; index += 1) {
    const box = await tabs.nth(index).boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);
  }
});

test("post menu holds save and the source check, and Escape restores focus", async ({
  page,
}) => {
  await bypassIntro(page);
  await page.goto("/demo/bookface");

  // A post with media, so the menu carries the source check as well as Save.
  const trigger = page
    .locator("#post-p-flood-live")
    .getByRole("button", {
      name: /more options for the post|más opciones de la publicación/i,
    });
  await trigger.click();

  const menu = page.getByRole("menu").first();
  await expect(menu).toBeVisible();
  await expect(
    menu.getByRole("menuitem", { name: /save post|guardar publicación/i }),
  ).toBeVisible();
  await expect(
    menu.getByRole("menuitem", { name: /check the source|comprobar la fuente/i }),
  ).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(menu).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test("bookface intercepts a share with the same pipeline as the Y skin", async ({
  page,
}) => {
  await bypassIntro(page);
  await page.goto("/demo/bookface/scenario/image-context");

  await page.locator("#share-p-flood-live").click();
  await expect(page.locator("dialog[open]")).toHaveCount(1);

  await page.keyboard.press("Escape");
  await expect(page.locator("dialog[open]")).toHaveCount(0);
});

test("bookface post detail opens from Comment and closes with Escape", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await bypassIntro(page);
  await page.goto("/demo/bookface");

  const commentAction = page
    .getByRole("button", { name: /^(comment|comentar)$/i })
    .first();
  await commentAction.click();

  const detail = page.locator(
    'dialog[open][aria-labelledby="bookface-post-detail-title"]',
  );
  await expect(detail).toBeVisible();
  await expect(detail.locator('input[id^="composer-"]')).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(detail).toHaveCount(0);
  await expect(commentAction).toBeFocused();
});
