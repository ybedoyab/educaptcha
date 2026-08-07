import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nProvider } from "../i18n/I18nContext";
import { MinigameRenderer } from "../components/minigames/MinigameRenderer";
import { experienceMinigames } from "../data/experienceMinigames";

function wrap(ui: React.ReactNode) {
  return render(<I18nProvider>{ui}</I18nProvider>);
}

describe("MinigameRenderer", () => {
  it("does not show Why before answering context-match", () => {
    wrap(
      <MinigameRenderer
        challenge={experienceMinigames["ic-match"]}
        onComplete={() => undefined}
        onSkip={() => undefined}
        embedded
        compactFeedback
      />,
    );
    expect(screen.queryByText("Why?")).toBeNull();
    expect(
      screen.getByRole("button", { name: /check the source/i }),
    ).toBeInTheDocument();
  });

  it("skip is available when not embedded", async () => {
    const user = userEvent.setup();
    let skipped = false;
    wrap(
      <MinigameRenderer
        challenge={experienceMinigames["ic-match"]}
        onComplete={() => undefined}
        onSkip={() => {
          skipped = true;
        }}
      />,
    );
    await user.click(screen.getByRole("button", { name: /skip/i }));
    expect(skipped).toBe(true);
  });

  it("has exactly one primary CTA on the first screen", () => {
    wrap(
      <MinigameRenderer
        challenge={experienceMinigames["ic-match"]}
        onComplete={() => undefined}
        onSkip={() => undefined}
        embedded
        compactFeedback
      />,
    );
    expect(screen.getAllByRole("button", { name: /check the source/i })).toHaveLength(
      1,
    );
  });
});
