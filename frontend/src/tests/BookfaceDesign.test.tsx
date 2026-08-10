import { render, screen } from "@testing-library/react";
import { ThumbsUp } from "lucide-react";
import { describe, expect, it } from "vitest";
import { BookfaceActionButton } from "../components/bookface/atoms/BookfaceActionButton";
import { BookfaceMark } from "../components/bookface/atoms/BookfaceMark";
import { ReactionSummary } from "../components/bookface/atoms/ReactionSummary";
import {
  BOOKFACE_MESSAGES,
  BOOKFACE_NAV_ITEMS,
  BOOKFACE_NAV_TITLE_KEYS,
} from "../components/bookface/bookface.constants";
import {
  compactCount,
  feedPeople,
  fillTemplate,
} from "../components/bookface/bookface.utils";
import {
  OPEN_FEED_MESSAGES,
  OPEN_FEED_NAV_ITEMS,
} from "../components/openfeed/openFeed.constants";
import { openFeedPosts } from "../data/openFeedPosts";
import { translations } from "../i18n/translations";

describe("Bookface visual system", () => {
  it("renders an original mark with an accessible name", () => {
    const { container } = render(
      <BookfaceMark label="Bookface, simulated social network" />,
    );

    expect(
      screen.getByRole("img", { name: "Bookface, simulated social network" }),
    ).toBeInTheDocument();
    // Drawn from primitives — never an embedded third-party logo.
    expect(container.querySelector("image")).not.toBeInTheDocument();
  });

  it("labels the wide action button and exposes its states", () => {
    render(
      <BookfaceActionButton
        icon={ThumbsUp}
        label="Like"
        tone="like"
        active
        aria-pressed="true"
      />,
    );

    const action = screen.getByRole("button", { name: "Like" });
    expect(action).toHaveAttribute("aria-pressed", "true");
    // Unlike the icon-only Y actions, Bookface always shows the word.
    expect(action).toHaveTextContent("Like");
  });

  it("keeps the reaction total readable by screen readers", () => {
    render(<ReactionSummary count="1.2K" label="1,240 reactions" />);

    expect(screen.getByText("1,240 reactions")).toBeInTheDocument();
    expect(screen.getByText("1.2K")).toBeInTheDocument();
  });

  it("maps every shared feed view onto a Bookface label", () => {
    const bookfaceViews = BOOKFACE_NAV_ITEMS.map((item) => item.id);
    const openFeedViews = OPEN_FEED_NAV_ITEMS.map((item) => item.id);

    // Both skins drive the same FeedNav union, so a view added to one must be
    // renderable by the other.
    expect([...bookfaceViews].sort()).toEqual([...openFeedViews].sort());
    for (const view of bookfaceViews) {
      expect(BOOKFACE_NAV_TITLE_KEYS[view]).toBeTruthy();
    }
  });

  it("overrides only the copy that names the share action", () => {
    expect(Object.keys(BOOKFACE_MESSAGES).sort()).toEqual([
      "repostToast",
      "scenarioGuide",
      "sharedToast",
      "sharedToastAiVerified",
    ]);
    for (const key of Object.keys(BOOKFACE_MESSAGES)) {
      expect(key in OPEN_FEED_MESSAGES).toBe(true);
    }
    expect(BOOKFACE_MESSAGES.sharedToast).toEqual({
      en: translations.en.experience.bfSharedToast,
      es: translations.es.experience.bfSharedToast,
    });
  });

  it("fills templates and formats counts per locale", () => {
    expect(fillTemplate("{count} reactions", { count: 12 })).toBe(
      "12 reactions",
    );
    expect(compactCount(1240, "en")).toBe("1.2K");
    expect(compactCount(24, "es")).toBe("24");
  });

  it("derives rail people from feed authors without duplicates", () => {
    const people = feedPeople(openFeedPosts, "en", 6);

    expect(people).toHaveLength(6);
    expect(new Set(people.map((person) => person.name)).size).toBe(6);
  });
});
