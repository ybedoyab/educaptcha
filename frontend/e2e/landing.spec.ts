import { test, expect } from "@playwright/test";

test("landing shows Y and Bookface demo CTAs", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("link", { name: /try y demo|probar demo y/i }).first(),
  ).toBeVisible();
  await expect(
    page
      .getByRole("link", { name: /try bookface demo|probar demo bookface/i })
      .first(),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /see how it works|ver c[oó]mo funciona/i }).first(),
  ).toBeVisible();
  await expect(page.getByText(/verify\. think\. learn\./i).first()).toBeVisible();
  await expect(
    page.getByText(/share\s*[→\-]\s*check\s*[→\-]\s*decide|compartir\s*[→\-]\s*revisar\s*[→\-]\s*decidir/i).first(),
  ).toBeVisible();

  await page.getByRole("link", { name: /try y demo|probar demo y/i }).first().click();
  await expect(page).toHaveURL(/\/demo\/?$/);

  await page.goto("/");
  await page
    .getByRole("link", { name: /try bookface demo|probar demo bookface/i })
    .first()
    .click();
  await expect(page).toHaveURL(/\/demo\/bookface\/?/);
});
