import { render, screen } from "@testing-library/react";
import { Heart } from "lucide-react";
import { describe, expect, it } from "vitest";
import { ActionButton } from "../components/openfeed/atoms/ActionButton";
import { YMark } from "../components/openfeed/atoms/YMark";
import { OPEN_FEED_IDS } from "../components/openfeed/openFeed.constants";
import { FEED_NAV } from "../components/openfeed/openFeed.types";
import { selectVisiblePosts } from "../components/openfeed/openFeed.utils";
import { openFeedPosts } from "../data/openFeedPosts";
import { translations } from "../i18n/translations";

describe("OpenFeed visual system", () => {
  it("renders the original Y mark with an accessible name", () => {
    const { container } = render(<YMark label="Y, simulated social network" />);

    expect(
      screen.getByRole("img", { name: "Y, simulated social network" }),
    ).toBeInTheDocument();
    expect(container.querySelector("image")).not.toBeInTheDocument();
    expect(container.querySelectorAll("path")).toHaveLength(1);
  });

  it("exposes active and busy action states accessibly", () => {
    render(
      <ActionButton
        icon={Heart}
        label="Like"
        count={10}
        tone="like"
        active
        busy
        aria-pressed="true"
      />,
    );

    const action = screen.getByRole("button", { name: "Like" });
    expect(action).toHaveAttribute("aria-pressed", "true");
    expect(action).toHaveAttribute("aria-busy", "true");
    expect(screen.getByText("10")).toBeInTheDocument();
  });

  it("keeps navigation filters deterministic", () => {
    const savedPostId = openFeedPosts[0].id;
    const saved = selectVisiblePosts(
      openFeedPosts,
      FEED_NAV.SAVED,
      new Set([savedPostId]),
      "",
    );
    const searched = selectVisiblePosts(
      openFeedPosts,
      FEED_NAV.HOME,
      new Set(),
      openFeedPosts[0].handle,
    );

    expect(saved.map((post) => post.id)).toEqual([savedPostId]);
    expect(searched.some((post) => post.id === savedPostId)).toBe(true);
  });

  it("keeps stable DOM ids used by educational flows", () => {
    expect(OPEN_FEED_IDS.post("p-demo")).toBe("post-p-demo");
    expect(OPEN_FEED_IDS.share("p-demo")).toBe("share-p-demo");
    expect(OPEN_FEED_IDS.composer("p-demo")).toBe("composer-p-demo-root");
  });

  it("keeps social translations aligned", () => {
    expect(Object.keys(translations.es.experience).sort()).toEqual(
      Object.keys(translations.en.experience).sort(),
    );
  });
});

