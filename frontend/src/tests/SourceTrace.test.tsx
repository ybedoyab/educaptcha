import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { I18nProvider } from "../i18n/I18nContext";
import { SourceTrace } from "../components/minigames/SourceTrace";
import { lagosFloodSourceTrace } from "../data/sourceTraces";

describe("SourceTrace", () => {
  it("renders claim → source → merged original chain from data", () => {
    render(
      <I18nProvider>
        <SourceTrace steps={lagosFloodSourceTrace} />
      </I18nProvider>,
    );
    expect(screen.getByText(/LIVE from tonight/i)).toBeInTheDocument();
    expect(screen.getByText(/No original source provided/i)).toBeInTheDocument();
    expect(screen.getByText(/Original source & photo|Fuente y foto originales/i)).toBeInTheDocument();
    expect(screen.getByText(/Wikimedia Commons/i)).toBeInTheDocument();
    expect(screen.getByText(/Lagos, Nigeria/i)).toBeInTheDocument();
    expect(screen.getAllByText(/June 24, 2019/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Is it from today/i)).toBeInTheDocument();
    // archive + original collapsed → one Open source control
    expect(
      screen.getAllByRole("link", { name: /open source|abrir fuente/i }),
    ).toHaveLength(1);
  });

  it("exposes an Open source action when archive href is present", () => {
    render(
      <I18nProvider>
        <SourceTrace steps={lagosFloodSourceTrace} />
      </I18nProvider>,
    );
    const link = screen.getByRole("link", { name: /open source|abrir fuente/i });
    expect(link).toHaveAttribute("href", expect.stringContaining("wikimedia.org"));
  });
});
