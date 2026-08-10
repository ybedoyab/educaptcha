import { describe, expect, it } from "vitest";
import {
  createTriggerEngine,
  isAffirmingComment,
  isSourceSeekingComment,
} from "../lib/LearningTriggerEngine";
import { openFeedPosts } from "../data/openFeedPosts";
import type { PendingIntent } from "../lib/demoFlow";

const flood = openFeedPosts.find((p) => p.id === "p-flood-live")!;

function shareIntent(postId = flood.id): PendingIntent {
  return { type: "share", postId, returnElementId: `share-${postId}` };
}

describe("LearningTriggerEngine", () => {
  it("forceScenario activates on first guided share", () => {
    const engine = createTriggerEngine();
    const decision = engine.forceScenario(flood, shareIntent());
    expect(decision.type).toBe("intercept");
    if (decision.type === "intercept") {
      expect(decision.challengeId).toBe("ic-match");
      expect(decision.reason.en).toMatch(/AI found|date|place|archived/i);
    }
  });

  it("first risky share opens EduCAPTCHA (no warm-up continues)", () => {
    const engine = createTriggerEngine({ actionsSinceLast: 0 });
    const first = engine.decideFreeBrowse("share", flood, shareIntent());
    expect(first.type).toBe("intercept");
  });

  it("free browse respects cooldown after an intervention", () => {
    const engine = createTriggerEngine({
      actionsSinceLast: 0,
      lastSkill: "emotional-pressure",
    });
    const first = engine.decideFreeBrowse("share", flood, shareIntent());
    expect(first.type).toBe("continue");
    const second = engine.decideFreeBrowse("share", flood, shareIntent());
    expect(second.type).toBe("continue");
    const third = engine.decideFreeBrowse("share", flood, shareIntent());
    expect(third.type).toBe("intercept");
  });

  it("does not repeat the same skill immediately", () => {
    const engine = createTriggerEngine({
      actionsSinceLast: 3,
      lastSkill: "image-context",
    });
    const decision = engine.decideFreeBrowse("share", flood, shareIntent());
    expect(decision.type).toBe("continue");
  });

  it("source-seeking comments do not trigger affirming warning", () => {
    expect(isSourceSeekingComment("Does anyone have the original source?")).toBe(
      true,
    );
    expect(isAffirmingComment("Does anyone have the original source?")).toBe(
      false,
    );
    expect(isAffirmingComment("This needs verification.")).toBe(false);
    expect(isAffirmingComment("I found a 2019 archive photo.")).toBe(false);
  });

  it("affirming comments can trigger", () => {
    expect(isAffirmingComment("I saw this in several groups, so it must be true.")).toBe(
      true,
    );
    const engine = createTriggerEngine({ actionsSinceLast: 3 });
    const intent: PendingIntent = {
      type: "comment",
      postId: flood.id,
      body: "It must be true",
      returnElementId: "c",
    };
    const decision = engine.decideFreeBrowse(
      "comment",
      flood,
      intent,
      "It must be true",
    );
    expect(decision.type).toBe("intercept");
  });

  it("verify does not block desired behavior", () => {
    const engine = createTriggerEngine({ actionsSinceLast: 10 });
    const decision = engine.decideFreeBrowse(
      "verify-link",
      flood,
      shareIntent(),
    );
    expect(decision.type).toBe("verify-ack");
  });
});
