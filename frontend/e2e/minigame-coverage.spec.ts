import { test, expect } from "@playwright/test";
import {
  completeChartRepairFlow,
  completeContextMatchFlow,
  completeImageInspectionFlow,
  completeSpotSignalsFlow,
  dismissIntro,
  expectReturnBar,
  expectVerificationCollapsed,
  sharePost,
} from "./helpers/minigameFlows";

/**
 * Human-like critical pass: every initial minigame type must open with a
 * verification reason, complete Pause→Check→Decide, return to the feed, and leave
 * “See verification” collapsed by default.
 */
test.describe("minigame coverage (critical QA)", () => {
  // Independent scenarios — run in parallel; do not abort siblings on one failure.
  test.describe.configure({ timeout: 60_000 });

  test.beforeEach(async ({ page }) => {
    await dismissIntro(page);
  });

  test("image-context: merged source card + collapsed verification", async ({
    page,
  }) => {
    await page.goto("/demo/scenario/image-context");
    await sharePost(page, "p-flood-live");
    await completeContextMatchFlow(page);
    await expectReturnBar(page);
    await page
      .getByRole("button", { name: /cancel share|cancelar compartir/i })
      .click();
    await expect(
      page.getByText(/misleading|engañoso/i).first(),
    ).toBeVisible();
    await expectVerificationCollapsed(page);
  });

  test("emotional-pressure: spot signals flow", async ({ page }) => {
    await page.goto("/demo/scenario/emotional-pressure");
    await sharePost(page, "p-alert-urgent");
    await completeSpotSignalsFlow(page);
    await expectReturnBar(page);
  });

  test("wildfire-context: context-match place mismatch", async ({ page }) => {
    await page.goto("/demo/scenario/wildfire-context");
    await sharePost(page, "p-wildfire");
    await completeContextMatchFlow(page);
    await expectReturnBar(page);
  });

  test("vaccine-claim: photo vs claim", async ({ page }) => {
    await page.goto("/demo/scenario/vaccine-claim");
    await sharePost(page, "p-vaccine");
    await completeImageInspectionFlow(page);
    await expectReturnBar(page);
  });

  test("protest-context: reused crowd photo", async ({ page }) => {
    await page.goto("/demo/scenario/protest-context");
    await sharePost(page, "p-protest");
    await completeContextMatchFlow(page);
    await expectReturnBar(page);
  });

  test("misleading-chart: repair axis then decide", async ({ page }) => {
    await page.goto("/demo/scenario/misleading-chart");
    await sharePost(page, "p-chart");
    await completeChartRepairFlow(page);
    await expectReturnBar(page);
  });

  test("safe garden post shares with Shared toast only", async ({
    page,
  }) => {
    await page.goto("/demo");
    await page.locator("#share-p-garden").click();
    await expect(page.locator("dialog[open]")).toHaveCount(0);
    await expect(
      page.getByText(/Shared\.|Compartido\./i).first(),
    ).toBeVisible();
    await expect(
      page.getByText(/AI verified|Verificado por IA/i),
    ).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: /see verification|ver verificación/i }),
    ).toHaveCount(0);
  });
});
