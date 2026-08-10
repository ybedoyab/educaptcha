import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { I18nProvider } from "../i18n/I18nContext";
import { SourceTrace } from "../components/minigames/SourceTrace";
import { lagosFloodSourceTrace } from "../data/sourceTraces";

describe("SourceTrace", () => {
  it("renders claim → source → original chain from data", () => {
    render(
      <I18nProvider>
        <SourceTrace steps={lagosFloodSourceTrace} />
      </I18nProvider>,
    );
    expect(screen.getByText(/LIVE from tonight/i)).toBeInTheDocument();
    expect(screen.getByText(/No original source provided/i)).toBeInTheDocument();
    expect(screen.getByText(/Lagos, Nigeria/i)).toBeInTheDocument();
    expect(screen.getByText(/June 24, 2019/i)).toBeInTheDocument();
  });

  it("is presentation-only (no scenario exports)", async () => {
    const mod = await import("../components/minigames/SourceTrace");
    expect(mod.SourceTrace).toBeTypeOf("function");
    expect("floodSourceTraceSteps" in mod).toBe(false);
  });
});
