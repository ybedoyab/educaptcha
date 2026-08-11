import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { I18nProvider } from "../i18n/I18nContext";
import { MinigameRenderer } from "../components/minigames/MinigameRenderer";
import { riskDetail } from "../lib/interceptCopy";
import { experienceMinigames } from "../data/experienceMinigames";
import { createTriggerEngine } from "../lib/LearningTriggerEngine";
import { openFeedPosts } from "../data/openFeedPosts";

describe("riskDetail", () => {
  it("drops a leading clause that repeats the heading", () => {
    expect(
      riskDetail(
        "Before you share, check this photo. This image may be old or out of context.",
        "Before you share, check this photo",
      ),
    ).toBe("This image may be old or out of context.");
  });

  it("keeps reasons that say something new up front", () => {
    const reason = "Before you share, check how this chart is scaled.";
    expect(riskDetail(reason, "Before you share, check the chart")).toBe(reason);
  });

  it("keeps the reason when the heading is all it says", () => {
    const reason = "Before you share, check this photo";
    expect(riskDetail(reason, "Before you share, check this photo")).toBe(
      reason,
    );
  });

  it("only strips on a sentence boundary, not mid-word", () => {
    const reason = "Check this photographer's archive first.";
    expect(riskDetail(reason, "Check this photo")).toBe(reason);
  });
});

describe("intercept screen copy", () => {
  it("does not print the pause heading twice", () => {
    const post = openFeedPosts.find((p) => p.id === "p-flood-live");
    if (!post) throw new Error("fixture post p-flood-live is missing");
    // Go through the engine so this stays pinned to the real intercept reason.
    const decision = createTriggerEngine().forceScenario(post, {
      type: "share",
      postId: post.id,
      returnElementId: `share-${post.id}`,
    });
    if (decision.type !== "intercept") {
      throw new Error(`expected an intercept, got ${decision.type}`);
    }
    const reason = decision.reason.en;

    render(
      <I18nProvider>
        <MinigameRenderer
          challenge={experienceMinigames["ic-match"]}
          embedded
          compactFeedback
          interceptReason={reason}
          onComplete={() => undefined}
          onSkip={() => undefined}
        />
      </I18nProvider>,
    );

    expect(
      screen.getAllByText(/before you share, check this photo/i),
    ).toHaveLength(1);
  });

  it("shows the instruction once when the shell is not embedded", () => {
    render(
      <I18nProvider>
        <MinigameRenderer
          challenge={experienceMinigames["ic-match"]}
          onComplete={() => undefined}
          onSkip={() => undefined}
        />
      </I18nProvider>,
    );

    expect(
      screen.getAllByText(/this image may be old or out of context/i),
    ).toHaveLength(1);
  });
});
