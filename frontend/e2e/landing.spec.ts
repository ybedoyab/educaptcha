import { test, expect } from "@playwright/test";

test("landing shows demo CTA and does not embed full OpenFeed", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page
      .getByRole("link", {
        name: /launch the interactive demo|abrir la demo interactiva/i,
      })
      .first(),
  ).toBeVisible();
  await expect(page.getByText(/verify\. think\. learn\./i).first()).toBeVisible();
});
