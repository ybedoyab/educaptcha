import { test, expect } from "@playwright/test";

test("main routes navigate without 404", async ({ page }) => {
  for (const route of [
    "/",
    "/demo",
    "/demo/bookface",
    "/practice",
    "/dashboard",
    "/integration",
    "/demo/test-session",
  ]) {
    const res = await page.goto(route);
    expect(res?.ok()).toBeTruthy();
  }
});
