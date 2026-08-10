import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nProvider } from "../i18n/I18nContext";
import { ContextMatchGame } from "../components/minigames/ContextMatchGame";
import { experienceMinigames } from "../data/experienceMinigames";
import type { ContextMatchInteraction } from "../types/minigame";

const interaction = experienceMinigames["ic-match"]
  .interaction as ContextMatchInteraction;

describe("ContextMatchGame primary CTA invariant", () => {
  it("exposes exactly one primary CTA in intercept and check", async () => {
    const user = userEvent.setup();
    render(
      <I18nProvider>
        <ContextMatchGame
          interaction={interaction}
          language="en"
          onSolved={() => undefined}
          onHint={() => undefined}
        />
      </I18nProvider>,
    );

    expect(document.querySelectorAll('[data-primary-cta="true"]')).toHaveLength(
      1,
    );
    expect(
      screen.getByRole("button", { name: /check photo/i }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /check photo/i }));
    expect(document.querySelectorAll('[data-primary-cta="true"]')).toHaveLength(
      1,
    );
    expect(
      screen.getByRole("button", { name: /what does this mean/i }),
    ).toBeInTheDocument();
  });

  it("keeps a single See result CTA after selecting a decision", async () => {
    const user = userEvent.setup();
    render(
      <I18nProvider>
        <ContextMatchGame
          interaction={interaction}
          language="en"
          onSolved={() => undefined}
          onHint={() => undefined}
        />
      </I18nProvider>,
    );
    await user.click(screen.getByRole("button", { name: /check photo/i }));
    await user.click(
      screen.getByRole("button", { name: /what does this mean/i }),
    );
    expect(document.querySelectorAll('[data-primary-cta="true"]')).toHaveLength(
      0,
    );
    await user.click(
      screen.getByRole("button", {
        name: /real image used in the wrong context/i,
      }),
    );
    expect(document.querySelectorAll('[data-primary-cta="true"]')).toHaveLength(
      1,
    );
    expect(
      screen.getByRole("button", { name: /see result/i }),
    ).toBeInTheDocument();
  });
});
