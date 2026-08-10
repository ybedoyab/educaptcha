import { describe, expect, it } from "vitest";
import { misleadingShareDetail } from "../lib/misleadingShareCopy";

const details = {
  default: "default",
  chart: "chart",
  photoClaim: "photo",
  context: "context",
  pressure: "pressure",
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
