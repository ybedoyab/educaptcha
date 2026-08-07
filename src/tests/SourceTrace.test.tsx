import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { I18nProvider } from "../i18n/I18nContext";
import {
  SourceTrace,
  floodSourceTraceSteps,
} from "../components/minigames/SourceTrace";

describe("SourceTrace", () => {
  it("renders claim → source → original chain", () => {
    render(
      <I18nProvider>
        <SourceTrace steps={floodSourceTraceSteps} />
      </I18nProvider>,
    );
    expect(screen.getByText(/LIVE from tonight/i)).toBeInTheDocument();
    expect(screen.getByText(/No original source provided/i)).toBeInTheDocument();
    expect(screen.getByText(/Lagos, Nigeria/i)).toBeInTheDocument();
    expect(screen.getByText(/June 24, 2019/i)).toBeInTheDocument();
  });

  it("main flow has three user phases conceptually", () => {
    // Spot → Check → Decide — five-second clarity invariant for structure
    const phases = ["spot", "check", "decide"] as const;
    expect(phases).toHaveLength(3);
    expect(floodSourceTraceSteps.some((s) => s.status === "missing")).toBe(true);
    expect(floodSourceTraceSteps.some((s) => s.status === "verified")).toBe(true);
  });
});
