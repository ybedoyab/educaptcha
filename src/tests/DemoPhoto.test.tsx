import { afterEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { I18nProvider } from "../i18n/I18nContext";
import { DemoPhoto } from "../components/minigames/DemoPhoto";

/**
 * jsdom never loads images, so `complete` is stubbed to stand in for a photo the
 * browser already has cached — the case the minigames hit constantly, because
 * every challenge re-shows an image the feed displayed a moment earlier.
 */
function stubComplete(value: boolean, naturalWidth = 640) {
  const proto = HTMLImageElement.prototype;
  const complete = Object.getOwnPropertyDescriptor(proto, "complete");
  const width = Object.getOwnPropertyDescriptor(proto, "naturalWidth");
  Object.defineProperty(proto, "complete", { configurable: true, get: () => value });
  Object.defineProperty(proto, "naturalWidth", {
    configurable: true,
    get: () => naturalWidth,
  });
  return () => {
    if (complete) Object.defineProperty(proto, "complete", complete);
    else delete (proto as unknown as Record<string, unknown>).complete;
    if (width) Object.defineProperty(proto, "naturalWidth", width);
    else delete (proto as unknown as Record<string, unknown>).naturalWidth;
  };
}

let restore: (() => void) | null = null;

afterEach(() => {
  restore?.();
  restore = null;
});

describe("DemoPhoto", () => {
  it("shows an already-cached photo instead of stranding it behind the skeleton", () => {
    restore = stubComplete(true);
    render(
      <I18nProvider>
        <DemoPhoto assetId="viral-health-alert" />
      </I18nProvider>,
    );

    const img = screen.getByRole("img");
    expect(img.className).toContain("opacity-100");
    expect(img.className).not.toContain("opacity-0");
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("keeps the skeleton while a photo is still loading", () => {
    restore = stubComplete(false, 0);
    render(
      <I18nProvider>
        <DemoPhoto assetId="viral-health-alert" />
      </I18nProvider>,
    );

    expect(screen.getByRole("img").className).toContain("opacity-0");
    expect(screen.getByRole("status")).toBeInTheDocument();
  });
});
