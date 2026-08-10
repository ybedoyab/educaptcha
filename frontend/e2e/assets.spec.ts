import { test, expect } from "@playwright/test";

const routes = [
  "/",
  "/demo",
  "/demo/scenario/image-context",
  "/demo/scenario/emotional-pressure",
  "/demo/scenario/wildfire-context",
  "/demo/bookface",
  "/demo/bookface/scenario/image-context",
  "/practice",
  "/dashboard",
  "/integration",
];

test("no broken demo-asset network responses on key routes", async ({
  page,
}) => {
  const failures: string[] = [];
  page.on("response", (res) => {
    const url = res.url();
    if (!url.includes("/demo-assets/")) return;
    if (res.status() >= 400) {
      failures.push(`${res.status()} ${url}`);
      return;
    }
    const ct = res.headers()["content-type"] || "";
    if (ct.includes("text/html")) {
      failures.push(`html content-type ${url}`);
    }
  });

  for (const route of routes) {
    await page.goto(route, { waitUntil: "domcontentloaded" });
    const next = page.getByRole("button", {
      name: /next|siguiente|start browsing|empezar/i,
    });
    if (await next.first().isVisible().catch(() => false)) {
      await next.first().click();
      if (await next.first().isVisible().catch(() => false)) {
        await next.first().click();
      }
    }
    await page.waitForTimeout(800);
  }

  expect(failures, failures.join("\n")).toEqual([]);
});
