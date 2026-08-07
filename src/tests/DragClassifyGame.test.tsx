import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nProvider } from "../i18n/I18nContext";
import { DragClassifyGame } from "../components/minigames/DragClassifyGame";
import type { DragClassifyInteraction } from "../types/minigame";

const interaction: DragClassifyInteraction = {
  type: "drag-classify",
  instruction: {
    en: "Choose a card, then choose where it belongs.",
    es: "Elige una tarjeta y luego dónde pertenece.",
  },
  maxAttempts: 3,
  prompt: { en: "Test prompt", es: "Prompt de prueba" },
  wrongHint: { en: "Try again", es: "Intenta de nuevo" },
  zones: [
    { id: "a", label: { en: "Category A", es: "Categoría A" } },
    { id: "b", label: { en: "Category B", es: "Categoría B" } },
  ],
  items: [
    {
      id: "item1",
      label: { en: "Card one", es: "Tarjeta uno" },
      correctZoneId: "a",
    },
    {
      id: "item2",
      label: { en: "Card two", es: "Tarjeta dos" },
      correctZoneId: "b",
    },
  ],
};

describe("DragClassifyGame click-first interaction", () => {
  it("selects a card then places it in the correct zone", async () => {
    const user = userEvent.setup();
    const onSolved = vi.fn();
    render(
      <I18nProvider>
        <DragClassifyGame
          interaction={interaction}
          language="en"
          onSolved={onSolved}
          onHint={() => undefined}
        />
      </I18nProvider>,
    );

    const card = screen.getByTestId("drag-card-item1");
    await user.click(within(card).getByRole("button", { name: /card one/i }));
    expect(card).toHaveAttribute("data-selected", "true");
    expect(screen.getByText(/now choose a category/i)).toBeInTheDocument();

    await user.click(screen.getByTestId("drop-zone-a"));
    expect(screen.getByTestId("placed-item1")).toBeInTheDocument();
    expect(screen.queryByTestId("drag-card-item1")).not.toBeInTheDocument();
  });

  it("wrong zone shows hint and keeps card available", async () => {
    const user = userEvent.setup();
    const onHint = vi.fn();
    render(
      <I18nProvider>
        <DragClassifyGame
          interaction={interaction}
          language="en"
          onSolved={() => undefined}
          onHint={onHint}
        />
      </I18nProvider>,
    );

    const card = screen.getByTestId("drag-card-item1");
    await user.click(within(card).getByRole("button", { name: /card one/i }));
    await user.click(screen.getByTestId("drop-zone-b"));
    expect(onHint).toHaveBeenCalled();
    expect(screen.getByTestId("drag-card-item1")).toBeInTheDocument();
  });

  it("shows grip affordance and click-first copy", () => {
    render(
      <I18nProvider>
        <DragClassifyGame
          interaction={interaction}
          language="en"
          onSolved={() => undefined}
          onHint={() => undefined}
        />
      </I18nProvider>,
    );
    expect(
      screen.getByText(/choose a card, then choose where it belongs/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/you can also drag it/i)).toBeInTheDocument();
  });
});
