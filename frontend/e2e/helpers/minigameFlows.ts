import { expect, type Locator, type Page } from "@playwright/test";

export async function dismissIntro(page: Page) {
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

export async function sharePost(page: Page, postId: string) {
  await page.locator(`#share-${postId}`).click();
  await expect(dialog(page)).toHaveCount(1, { timeout: 15_000 });
}

export async function continueAfterResult(page: Page) {
  await clickInDialog(page, /continue|continuar/i);
  await expect(page.locator("dialog[open]")).toHaveCount(0, {
    timeout: 15_000,
  });
}

/** Context-match (flood / wildfire / protest). */
export async function completeContextMatchFlow(page: Page) {
  await expect(dialog(page).getByText(/AI found|La IA encontró/i)).toBeVisible();
  await clickInDialog(page, /check photo|revisar foto/i);
  await expect(
    dialog(page).getByText(/Original source & photo|Fuente y foto originales/i),
  ).toBeVisible();
  await expect(
    dialog(page).getByRole("link", { name: /open source|abrir fuente/i }),
  ).toHaveCount(1);
  await clickInDialog(page, /what does this mean|qué significa/i);
  await clickInDialog(
    page,
    /real image used in the wrong context|imagen real usada en el contexto equivocado/i,
  );
  await clickInDialog(page, /see result|ver resultado/i);
  await continueAfterResult(page);
}

/** Emotional pressure spot-signals. */
export async function completeSpotSignalsFlow(page: Page) {
  await expect(dialog(page).getByText(/AI found|La IA encontró/i)).toBeVisible();
  await clickInDialog(page, /find signals|buscar señales/i);
  await clickInDialog(page, /^URGENT$|^URGENTE$/i);
  await clickInDialog(
    page,
    /before it disappears|antes de que desaparezca/i,
  );
  await clickInDialog(page, /^Share it NOW$|^Compártela YA$/i);
  await clickInDialog(page, /what does this mean|qué significa/i);
  await clickInDialog(
    page,
    /urgency, fear, and a share command|urgencia, miedo y una orden/i,
  );
  await continueAfterResult(page);
}

/** Vaccine photo-vs-claim. */
export async function completeImageInspectionFlow(page: Page) {
  await expect(dialog(page).getByText(/AI found|La IA encontró/i)).toBeVisible();
  await clickInDialog(page, /check photo|revisar foto/i);

  const root = dialog(page);
  // Classify three statements: vial in photo; unsafe + ban = caption only.
  const groups = root.getByRole("radiogroup");
  await expect(groups).toHaveCount(3, { timeout: 15_000 });
  await groups.nth(0).getByRole("radio", { name: /Visible in the photo|Se ve en la foto/i }).click({ force: true });
  await groups.nth(1).getByRole("radio", { name: /Only claimed in the caption|Solo lo afirma el texto/i }).click({ force: true });
  await groups.nth(2).getByRole("radio", { name: /Only claimed in the caption|Solo lo afirma el texto/i }).click({ force: true });

  await clickInDialog(page, /choose a conclusion|elige una conclusión/i);
  await clickInDialog(
    page,
    /not proven by the image|no la prueba la imagen/i,
  );
  await continueAfterResult(page);
}

async function setRangeValue(slider: Locator, value: string) {
  await slider.evaluate((el, v) => {
    const input = el as HTMLInputElement;
    const setter = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )?.set;
    setter?.call(input, v);
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }, value);
}

/** Misleading chart repair. */
export async function completeChartRepairFlow(page: Page) {
  await expect(dialog(page).getByText(/AI found|La IA encontró/i)).toBeVisible();
  await clickInDialog(page, /check chart|revisar gráfica/i);
  const slider = dialog(page).locator('input[type="range"]');
  await expect(slider).toBeVisible();
  await setRangeValue(slider, "0");
  await clickInDialog(page, /apply scale|aplicar escala/i);
  await clickInDialog(
    page,
    /truncated axis made a small change|eje truncado hizo/i,
  );
  await continueAfterResult(page);
}

export async function expectReturnBar(page: Page) {
  await expect(
    page.getByRole("button", {
      name: /cancel share|cancelar compartir/i,
    }),
  ).toBeVisible({ timeout: 15_000 });
  await expect(
    page.getByRole("button", {
      name: /share anyway|compartir igual/i,
    }),
  ).toBeVisible();
}

export async function expectVerificationCollapsed(page: Page) {
  const toggle = page.getByRole("button", {
    name: /see verification|ver verificación/i,
  });
  await expect(toggle).toBeVisible({ timeout: 15_000 });
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
}
