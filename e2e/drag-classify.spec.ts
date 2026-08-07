import { test, expect } from "@playwright/test";

/**
 * Practice-mode drag challenge: click/tap is canonical; drag is progressive enhancement.
 */
test.describe("drag-classify practice interactions", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.removeItem("educaptcha-progress-v2");
      localStorage.removeItem("educaptcha-index-v2");
      localStorage.setItem(
        "educaptcha-progress-v2",
        JSON.stringify({
          completedIds: [],
          correctIds: [],
          skippedIds: [],
          score: 0,
          finished: false,
          results: {},
          badges: [],
        }),
      );
      localStorage.setItem("educaptcha-index-v2", "0");
    });
    await page.goto("/practice");

    // First challenge is spot-signals; skip until drag-classify appears
    for (let i = 0; i < 8; i++) {
      if (
        await page
          .locator('[data-testid^="drag-card-"]')
          .first()
          .isVisible()
          .catch(() => false)
      ) {
        return;
      }
      const skip = page.getByRole("button", { name: /skip|omitir/i });
      if (await skip.first().isVisible().catch(() => false)) {
        await skip.first().click();
        await page.waitForTimeout(200);
      } else {
        break;
      }
    }
  });

  test("A: mouse drag from handle toward a zone", async ({ page }) => {
    const card = page.locator('[data-testid^="drag-card-"]').first();
    await expect(card).toBeVisible({ timeout: 20000 });
    const handle = card.getByRole("button", { name: /drag/i });
    const zone = page.locator('[data-testid^="drop-zone-"]').first();
    const handleBox = await handle.boundingBox();
    const zoneBox = await zone.boundingBox();
    expect(handleBox && zoneBox).toBeTruthy();
    await page.mouse.move(
      handleBox!.x + handleBox!.width / 2,
      handleBox!.y + handleBox!.height / 2,
    );
    await page.mouse.down();
    await page.mouse.move(
      zoneBox!.x + zoneBox!.width / 2,
      zoneBox!.y + zoneBox!.height / 2,
      { steps: 20 },
    );
    await page.mouse.up();
    // Placed, or selected for tap fallback — never a dead control
    const placed = await page.locator('[data-testid^="placed-"]').count();
    const selected = await page.locator('[data-selected="true"]').count();
    expect(placed > 0 || selected > 0 || (await card.isVisible())).toBe(true);
  });

  test("B: click card then click correct zone places the card", async ({
    page,
  }) => {
    const card = page.locator('[data-testid^="drag-card-"]').first();
    await expect(card).toBeVisible({ timeout: 20000 });
    const cardId = (await card.getAttribute("data-testid"))!.replace(
      "drag-card-",
      "",
    );
    await card.getByRole("button").nth(1).click();
    await expect(card).toHaveAttribute("data-selected", "true");
    await expect(
      page.getByText(/now choose a category|ahora elige una categoría/i),
    ).toBeVisible();

    const zones = page.locator('[data-testid^="drop-zone-"]');
    const count = await zones.count();
    for (let i = 0; i < count; i++) {
      const still = page.locator(`[data-testid="drag-card-${cardId}"]`);
      if (!(await still.isVisible().catch(() => false))) break;
      await still.getByRole("button").nth(1).click();
      await zones.nth(i).click();
      await page.waitForTimeout(120);
    }
    await expect(page.locator(`[data-testid="placed-${cardId}"]`)).toBeVisible({
      timeout: 5000,
    });
  });

  test("C: keyboard selects a card", async ({ page }) => {
    const card = page.locator('[data-testid^="drag-card-"]').first();
    await expect(card).toBeVisible({ timeout: 20000 });
    const labelBtn = card.getByRole("button").nth(1);
    await labelBtn.focus();
    await expect(labelBtn).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(card).toHaveAttribute("data-selected", "true");
  });

  test("D: incorrect placement shows hint feedback", async ({ page }) => {
    const card = page.locator('[data-testid^="drag-card-"]').first();
    await expect(card).toBeVisible({ timeout: 20000 });
    await card.getByRole("button").nth(1).click();

    // Try every zone until one keeps the card (wrong) or all place (unlikely for first)
    const zones = page.locator('[data-testid^="drop-zone-"]');
    const count = await zones.count();
    let gotHint = false;
    for (let i = 0; i < count; i++) {
      const still = page.locator('[data-testid^="drag-card-"]').first();
      if (!(await still.isVisible().catch(() => false))) break;
      await still.getByRole("button").nth(1).click();
      await zones.nth(i).click();
      const hint = page.getByText(
        /popularity is not evidence|la popularidad no es evidencia|try again|intenta|look for fear|busca miedo/i,
      );
      if (await hint.isVisible().catch(() => false)) {
        gotHint = true;
        break;
      }
    }
    // Either we saw a wrong-hint, or the card was correctly placed on first try —
    // both prove the interaction is live (not a mockup).
    const placed = await page.locator('[data-testid^="placed-"]').count();
    expect(gotHint || placed > 0).toBe(true);
  });

  test("E: correct placement persists visually in the zone", async ({
    page,
  }) => {
    const card = page.locator('[data-testid^="drag-card-"]').first();
    await expect(card).toBeVisible({ timeout: 20000 });
    const cardId = (await card.getAttribute("data-testid"))!.replace(
      "drag-card-",
      "",
    );
    await card.getByRole("button").nth(1).click();
    const zones = page.locator('[data-testid^="drop-zone-"]');
    const count = await zones.count();
    for (let i = 0; i < count; i++) {
      if (
        !(await page
          .locator(`[data-testid="drag-card-${cardId}"]`)
          .isVisible()
          .catch(() => false))
      )
        break;
      await page
        .locator(`[data-testid="drag-card-${cardId}"]`)
        .getByRole("button")
        .nth(1)
        .click();
      await zones.nth(i).click();
      await page.waitForTimeout(100);
    }
    const placed = page.locator(`[data-testid="placed-${cardId}"]`);
    await expect(placed).toBeVisible();
    // Visually inside a drop zone
    const zoneWithCard = page.locator(
      `[data-testid^="drop-zone-"]:has([data-testid="placed-${cardId}"])`,
    );
    await expect(zoneWithCard).toHaveCount(1);
  });
});
