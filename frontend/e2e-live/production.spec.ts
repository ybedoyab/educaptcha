import { expect, test, type Page } from "@playwright/test";

const VALID_OUTCOMES = new Set(["continue", "intercept", "verify-ack"]);

const FORBIDDEN_TRUTH_CLAIMS =
  /AI verified|Verificado por IA|confirmed misleading|confirmado como engañoso/i;

const FORBIDDEN_AI_FOUND = /AI found|La IA encontró/i;

async function bypassIntro(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem("educaptcha-intro-seen", JSON.stringify(true));
  });
}

function openDialog(page: Page) {
  return page.locator("dialog[open]");
}

async function clickDialogButton(page: Page, name: RegExp) {
  const btn = openDialog(page).getByRole("button", { name });
  await expect(btn).toBeVisible({ timeout: 15_000 });
  await btn.scrollIntoViewIfNeeded();
  await btn.click({ force: true, timeout: 15_000 });
}

/** Current image-context flow only. Missing step = fail. */
async function completeImageContextCurrent(page: Page) {
  const root = openDialog(page);
  await expect(root).toHaveCount(1, { timeout: 20_000 });

  await expect(root.getByText(FORBIDDEN_TRUTH_CLAIMS)).toHaveCount(0);
  await expect(root.getByText(FORBIDDEN_AI_FOUND)).toHaveCount(0);
  await expect(
    root
      .getByText(
        /Before you share, check this photo|Antes de compartir, revisa esta foto/i,
      )
      .first(),
  ).toBeVisible({ timeout: 15_000 });

  await clickDialogButton(page, /^Check photo$|^Revisar foto$/i);

  await expect(
    root.getByText(/Original source & photo|Fuente y foto originales/i),
  ).toBeVisible({ timeout: 15_000 });
  await expect(
    root.getByRole("link", { name: /Open source|Abrir fuente/i }),
  ).toBeVisible();

  await clickDialogButton(page, /^What does this mean\?$|^¿Qué significa\?$/i);

  await clickDialogButton(
    page,
    /This is a real image used in the wrong context|imagen real usada en el contexto equivocado/i,
  );

  await clickDialogButton(page, /^See result$|^Ver resultado$/i);

  await expect(
    root.getByText(/Good catch|Buen ojo/i).first(),
  ).toBeVisible({ timeout: 15_000 });
  await expect(
    root
      .getByText(
        /wrong date and location|fecha y lugar incorrectos/i,
      )
      .first(),
  ).toBeVisible();
  await expect(root.getByText(FORBIDDEN_TRUTH_CLAIMS)).toHaveCount(0);

  await clickDialogButton(page, /^Continue$|^Continuar$/i);
  await expect(page.locator("dialog[open]")).toHaveCount(0, {
    timeout: 20_000,
  });
}

async function assertReturnBar(page: Page) {
  await expect(
    page.getByRole("button", { name: /Cancel share|Cancelar compartir/i }),
  ).toBeVisible({ timeout: 15_000 });
  await expect(
    page.getByRole("button", { name: /Share anyway|Compartir igual/i }),
  ).toBeVisible();
  await expect(page.getByText(FORBIDDEN_TRUTH_CLAIMS)).toHaveCount(0);
  await expect(
    page.getByText(/confirmed misleading|confirmado como engañoso/i),
  ).toHaveCount(0);
}

test.describe("A. Landing", () => {
  test("loads and exposes Try Y / Try Bookface demo CTAs", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveTitle(/EduCAPTCHA/i);
    await expect(
      page.getByRole("link", { name: /Try Y demo|Probar demo Y/i }).first(),
    ).toBeVisible({ timeout: 15_000 });
    await expect(
      page
        .getByRole("link", {
          name: /Try Bookface demo|Probar demo Bookface/i,
        })
        .first(),
    ).toBeVisible();
  });
});

test.describe("B. Y image-context scenario", () => {
  test("strict share → check → decide → result → return bar", async ({
    page,
  }) => {
    await bypassIntro(page);
    await page.goto("/demo/scenario/image-context");
    await expect(page.locator("#share-p-flood-live")).toBeVisible();
    await page.locator("#share-p-flood-live").click();
    await completeImageContextCurrent(page);
    await assertReturnBar(page);
  });
});

test.describe("C. Bookface image-context scenario", () => {
  test("strict share → check → decide → result → return bar", async ({
    page,
  }) => {
    await bypassIntro(page);
    await page.goto("/demo/bookface/scenario/image-context");
    await expect(page.locator("#share-p-flood-live")).toBeVisible();
    await page.locator("#share-p-flood-live").click();
    await completeImageContextCurrent(page);
    await assertReturnBar(page);
  });
});

test.describe("D. Production API", () => {
  test("/ops/healthz OK and /risk/analyze returns 200 decision", async ({
    page,
    request,
  }) => {
    const health = await request.get("/ops/healthz");
    expect(health.status(), await health.text()).toBe(200);
    const healthBody = await health.json();
    expect(healthBody.ok).toBeTruthy();

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
    const analyzeText = await analyze.text();
    expect(analyze.status(), analyzeText).toBe(200);
    const analyzeBody = JSON.parse(analyzeText) as {
      decision?: { outcome?: string };
      session?: unknown;
    };
    expect(analyzeBody.decision).toBeTruthy();
    expect(analyzeBody.session).toBeTruthy();
    expect(VALID_OUTCOMES.has(String(analyzeBody.decision?.outcome))).toBe(
      true,
    );

    await bypassIntro(page);
    let sawAnalyze = false;
    page.on("response", (res) => {
      if (!res.url().includes("/risk/analyze")) return;
      const status = res.status();
      if (status >= 200 && status < 300) {
        sawAnalyze = true;
      }
    });
    await page.goto("/demo");
    await expect(page.locator("#share-p-garden")).toBeVisible({
      timeout: 15_000,
    });
    await page.locator("#share-p-garden").click();
    await expect.poll(() => sawAnalyze, { timeout: 20_000 }).toBe(true);
    expect(sawAnalyze).toBe(true);
  });
});

test.describe("E. Assets", () => {
  test("no demo-asset >=400 and no broken images on key live routes", async ({
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
      const imgs = page.locator('img[src*="demo-assets"]');
      const count = await imgs.count();
      for (let i = 0; i < count; i++) {
        const img = imgs.nth(i);
        await img.scrollIntoViewIfNeeded();
        await expect
          .poll(
            async () =>
              img.evaluate((el) => {
                const node = el as HTMLImageElement;
                return node.complete && node.naturalWidth > 0;
              }),
            { timeout: 15_000 },
          )
          .toBe(true);
      }
    }
    expect(failures, failures.join("\n")).toEqual([]);
  });
});
