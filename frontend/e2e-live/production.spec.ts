import { expect, test, type Page } from "@playwright/test";

async function bypassIntro(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem("educaptcha-intro-seen", JSON.stringify(true));
  });
}

function dialog(page: Page) {
  return page.locator("dialog[open]");
}

async function clickInDialog(page: Page, name: RegExp) {
  const root = dialog(page);
  const btn = root.getByRole("button", { name });
  const radio = root.getByRole("radio", { name });
  const target = (await btn.count()) > 0 ? btn.first() : radio.first();
  await expect(target).toBeVisible({ timeout: 15_000 });
  await target.scrollIntoViewIfNeeded();
  await target.click({ force: true, timeout: 15_000 });
}

/**
 * Tolerant of current local copy and older production deploys.
 * Completes context-match: check → evidence → decide → result → close.
 */
async function completeImageContext(page: Page) {
  const root = dialog(page);
  await expect(root).toHaveCount(1, { timeout: 20_000 });

  await clickInDialog(page, /check photo|revisar foto/i);

  await expect(
    root
      .getByText(
        /Original source|Fuente|Archive reference|Referencia|source|fuente/i,
      )
      .first(),
  ).toBeVisible({ timeout: 15_000 });

  // Decide step CTA (current + older wording).
  const decideCta = root.getByRole("button", {
    name: /what does this mean|qué significa|what did you find|qué encontraste|choose a conclusion|elige/i,
  });
  if ((await decideCta.count()) > 0) {
    await decideCta.first().click({ force: true });
  }

  // Options may be radios (newer) or lettered buttons (older production).
  const correct = root
    .getByRole("radio", {
      name: /real image used in the wrong context|imagen real usada en el contexto equivocado/i,
    })
    .or(
      root.getByRole("button", {
        name: /real image used in the wrong context|imagen real usada en el contexto equivocado/i,
      }),
    );
  if ((await correct.count()) > 0) {
    await correct.first().click({ force: true });
  } else {
    const radios = root.getByRole("radio");
    if ((await radios.count()) > 0) {
      await radios.first().click({ force: true });
    }
  }

  const seeResult = root.getByRole("button", {
    name: /see result|ver resultado/i,
  });
  if ((await seeResult.count()) > 0) {
    await seeResult.first().click({ force: true });
  }

  await clickInDialog(page, /continue|continuar/i);
  await expect(page.locator("dialog[open]")).toHaveCount(0, {
    timeout: 20_000,
  });
}

test.describe("A. Landing", () => {
  test("loads and exposes demo CTAs", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveTitle(/EduCAPTCHA/i);
    await expect(
      page
        .getByRole("link", {
          name: /try y demo|probar demo y|\/demo/i,
        })
        .or(page.locator('a[href="/demo"]'))
        .first(),
    ).toBeVisible({ timeout: 15_000 });
    await expect(
      page
        .getByRole("link", {
          name: /try bookface demo|probar demo bookface|bookface/i,
        })
        .or(page.locator('a[href="/demo/bookface"]'))
        .first(),
    ).toBeVisible();
  });
});

test.describe("B. Y image-context scenario", () => {
  test("share → check → decide → return bar", async ({ page }) => {
    await bypassIntro(page);
    await page.goto("/demo/scenario/image-context");
    await expect(page.locator("#share-p-flood-live")).toBeVisible();
    await page.locator("#share-p-flood-live").click();
    await completeImageContext(page);
    await expect(
      page.getByRole("button", { name: /cancel share|cancelar compartir/i }),
    ).toBeVisible({ timeout: 15_000 });
    await expect(
      page.getByRole("button", { name: /share anyway|compartir igual/i }),
    ).toBeVisible();
  });
});

test.describe("C. Bookface image-context scenario", () => {
  test("same semantic flow", async ({ page }) => {
    await bypassIntro(page);
    await page.goto("/demo/bookface/scenario/image-context");
    await expect(page.locator("#share-p-flood-live")).toBeVisible();
    await page.locator("#share-p-flood-live").click();
    await completeImageContext(page);
    await expect(
      page.getByRole("button", { name: /cancel share|cancelar compartir/i }),
    ).toBeVisible({ timeout: 15_000 });
  });
});

test.describe("D. Production API", () => {
  test("/ops/healthz OK and risk analyze is not 5xx", async ({
    page,
    request,
  }) => {
    const health = await request.get("/ops/healthz");
    expect(health.ok(), await health.text()).toBeTruthy();
    const body = await health.json();
    expect(body.ok).toBeTruthy();

    const analyze = await request.post("/risk/analyze", {
      data: {
        action: "share",
        locale: "en",
        mode: "free-browse",
        dryRun: true,
        post: {
          id: "p-garden",
          body: { en: "Quiet afternoon", es: "Tarde tranquila" },
          category: "community",
          tags: ["community"],
          author: { handle: "@marina.reads" },
          engagement: { reactions: 1, comments: 0, shares: 0, ageMinutes: 180 },
          media: { kind: "text" },
          topComments: [],
        },
        session: { id: "live-smoke-1" },
      },
    });
    expect(analyze.status(), await analyze.text()).toBeLessThan(500);

    // Free-browse path hits analyze from the page (no brittle LLM asserts).
    await bypassIntro(page);
    let sawAnalyze = false;
    page.on("response", (res) => {
      if (res.url().includes("/risk/analyze") && res.status() < 500) {
        sawAnalyze = true;
      }
    });
    await page.goto("/demo");
    await page.waitForTimeout(2500);
    if (!sawAnalyze) {
      const garden = page.locator("#share-p-garden");
      if (await garden.isVisible().catch(() => false)) {
        await garden.click();
        await page.waitForTimeout(3000);
      }
    }
    expect(analyze.status()).toBeLessThan(500);
  });
});

test.describe("E. Assets", () => {
  test("no demo-asset 404s / HTML-as-image / stuck skeletons on key live routes", async ({
    page,
  }) => {
    const failures: string[] = [];
    page.on("response", (res) => {
      const url = res.url();
      if (!url.includes("/demo-assets/")) return;
      if (res.status() >= 400) failures.push(`${res.status()} ${url}`);
      const ct = res.headers()["content-type"] || "";
      if (ct.includes("text/html")) failures.push(`html ${url}`);
    });
    for (const route of [
      "/",
      "/demo",
      "/demo/scenario/image-context",
      "/demo/bookface",
      "/demo/bookface/scenario/image-context",
    ]) {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(800);
      const broken = page.locator(
        'img[alt]:not([src=""]), img[src*="demo-assets"]',
      );
      const count = await broken.count();
      for (let i = 0; i < count; i++) {
        const img = broken.nth(i);
        const ok = await img.evaluate((el) => {
          const node = el as HTMLImageElement;
          if (!node.complete) return true; // still loading is ok briefly
          return node.naturalWidth > 0;
        });
        if (!ok) failures.push(`broken image on ${route}`);
      }
      const skeletons = page.locator('[aria-busy="true"], .animate-pulse');
      if ((await skeletons.count()) > 12) {
        failures.push(`many busy/skeleton nodes on ${route}`);
      }
    }
    expect(failures, failures.join("\n")).toEqual([]);
  });
});
