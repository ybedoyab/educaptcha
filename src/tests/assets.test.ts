import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { mediaAssets, getMediaAsset } from "../data/mediaAssets";
import { imageCredits } from "../data/imageCredits";
import { openFeedPosts } from "../data/openFeedPosts";
import { experienceMinigames } from "../data/experienceMinigames";
import { challenges } from "../data/challenges";

const root = path.resolve(process.cwd());

function publicFile(publicPath: string) {
  return path.join(root, "public", publicPath.replace(/^\//, ""));
}

function fileSignature(buf: Buffer): "jpg" | "png" | "webp" | "svg" | "html" | "unknown" {
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return "jpg";
  }
  if (
    buf.length >= 8 &&
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47
  ) {
    return "png";
  }
  if (
    buf.length >= 12 &&
    buf.toString("ascii", 0, 4) === "RIFF" &&
    buf.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "webp";
  }
  const head = buf.subarray(0, Math.min(buf.length, 200)).toString("utf8").trim();
  if (head.startsWith("<!DOCTYPE html") || head.startsWith("<html")) return "html";
  if (head.includes("<svg")) return "svg";
  return "unknown";
}

describe("media assets", () => {
  it("every registered asset exists with valid signature", () => {
    for (const asset of Object.values(mediaAssets)) {
      const file = publicFile(asset.publicPath);
      expect(fs.existsSync(file), `missing ${asset.id}`).toBe(true);
      const buf = fs.readFileSync(file);
      expect(buf.length, asset.id).toBeGreaterThan(0);
      const sig = fileSignature(buf);
      expect(sig, asset.id).not.toBe("html");
      expect(sig, asset.id).not.toBe("unknown");
      if (asset.type === "svg") {
        expect(sig).toBe("svg");
        expect(buf.toString("utf8")).toContain("<svg");
      } else if (asset.type === "jpg") {
        expect(sig).toBe("jpg");
      }
    }
  });

  it("getMediaAsset throws for unknown ids", () => {
    expect(() => getMediaAsset("nope")).toThrow(/Unknown media asset/);
  });

  it("posts reference known assets and no remote urls", () => {
    for (const post of openFeedPosts) {
      if (post.mediaAssetId) {
        expect(mediaAssets[post.mediaAssetId], post.id).toBeTruthy();
      }
      if (post.imageSrc) {
        expect(post.imageSrc.startsWith("http")).toBe(false);
      }
    }
  });

  it("minigames and challenges reference known assets", () => {
    const games = [
      ...Object.values(experienceMinigames),
      ...challenges,
    ];
    for (const game of games) {
      const interaction = game.interaction as {
        mediaAssetId?: string;
        imageSrc?: string;
        cards?: { mediaAssetId?: string; thumbSrc?: string }[];
      };
      if (interaction.mediaAssetId) {
        expect(mediaAssets[interaction.mediaAssetId], game.id).toBeTruthy();
      }
      if (interaction.imageSrc) {
        expect(interaction.imageSrc.startsWith("http"), game.id).toBe(false);
      }
      interaction.cards?.forEach((card) => {
        if (card.mediaAssetId) {
          expect(mediaAssets[card.mediaAssetId]).toBeTruthy();
        }
        if (card.thumbSrc) {
          expect(card.thumbSrc.length).toBeGreaterThan(0);
          expect(card.thumbSrc.startsWith("http")).toBe(false);
        }
      });
    }
  });

  it("image credits referenced by assets exist", () => {
    const creditIds = new Set(imageCredits.map((c) => c.id));
    for (const asset of Object.values(mediaAssets)) {
      if (asset.creditId) {
        expect(creditIds.has(asset.creditId), asset.id).toBe(true);
      }
    }
  });
});
