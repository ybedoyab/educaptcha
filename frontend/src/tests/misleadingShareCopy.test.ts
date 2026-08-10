import { describe, expect, it } from "vitest";
import {
  misleadingShareDetail,
  misleadingShareTitle,
} from "../lib/misleadingShareCopy";

const details = {
  default: "default",
  chart: "chart",
  photoClaim: "photo",
  context: "context",
  pressure: "pressure",
};

const titles = {
  default: "title-default",
  chart: "title-chart",
  photoClaim: "title-photo",
  context: "title-context",
  pressure: "title-pressure",
};

describe("misleadingShareDetail", () => {
  it("uses chart copy for truncated-axis posts", () => {
    expect(misleadingShareDetail("misleading-chart", details)).toBe("chart");
  });

  it("uses photo-vs-claim copy for vaccine posts", () => {
    expect(misleadingShareDetail("vaccine-claim", details)).toBe("photo");
  });

  it("uses context copy for reused-image skills", () => {
    expect(misleadingShareDetail("image-context", details)).toBe("context");
    expect(misleadingShareDetail("wildfire-context", details)).toBe("context");
  });

  it("falls back to the generic line", () => {
    expect(misleadingShareDetail(undefined, details)).toBe("default");
    expect(misleadingShareDetail("unknown", details)).toBe("default");
  });
});

describe("misleadingShareTitle", () => {
  it("maps skills to title variants", () => {
    expect(misleadingShareTitle("misleading-chart", titles)).toBe(
      "title-chart",
    );
    expect(misleadingShareTitle("vaccine-claim", titles)).toBe("title-photo");
    expect(misleadingShareTitle("emotional-pressure", titles)).toBe(
      "title-pressure",
    );
    expect(misleadingShareTitle("image-context", titles)).toBe(
      "title-context",
    );
    expect(misleadingShareTitle(undefined, titles)).toBe("title-default");
  });
});
