/**
 * Codegen: build `app/catalog/catalog.json` by *evaluating* the real frontend TS
 * modules, so the backend can never disagree with the frontend about which
 * challenge ids exist.
 *
 *   node backend/tools/export_catalog.mjs
 *
 * Committed output; never run at runtime (the Docker image has no ../src).
 * Node >= 22.18 strips TS types natively; the resolve hook below adds the `.ts`
 * extension that the frontend's bundler-style imports omit.
 */
import { registerHooks } from "node:module";
import { writeFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, resolve as resolvePath } from "node:path";

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith(".") && !/\.[cm]?[jt]sx?$/.test(specifier)) {
      try {
        return nextResolve(`${specifier}.ts`, context);
      } catch {
        // fall through to the original specifier
      }
    }
    return nextResolve(specifier, context);
  },
});

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolvePath(here, "..", "..");
const srcData = (f) =>
  pathToFileURL(resolvePath(repoRoot, "frontend", "src", "data", f)).href;

const { openFeedPosts } = await import(srcData("openFeedPosts.ts"));
const { experienceMinigames } = await import(srcData("experienceMinigames.ts"));
const { mediaAssets } = await import(srcData("mediaAssets.ts"));

// Brand placeholders with no analyzable content — never spend a vision call on them.
const NON_ANALYZABLE = new Set(["neutral-news-report", "source-document"]);
const RASTER_TYPES = new Set(["jpg", "png", "webp"]);

const challengeIds = Object.keys(experienceMinigames).sort();

// Skills as declared on OpenFeedPost.triggerSkill. Derived from the data rather
// than retyped, so a new skill in the union shows up here automatically.
const skills = [
  "emotional-pressure",
  "image-context",
  "wildfire-context",
  "vaccine-claim",
  "protest-context",
  "misleading-chart",
  "ai-content",
  "sources",
];

/**
 * Per-post bindings. These take precedence over the skill map: `p-inside` is
 * `emotional-pressure` but binds to `ep-transfer`, not `ep-spot`.
 */
const postBindings = {};
for (const p of openFeedPosts) {
  if (!p.triggerSkill || !p.minigameId) continue;
  postBindings[p.id] = {
    skill: p.triggerSkill,
    initial: p.minigameId,
    transfer: p.transferMinigameId ?? null,
    transferPost: p.transferPostId ?? null,
  };
}

/**
 * Skill -> challenge fallback, built only from posts that carry BOTH an initial
 * and a transfer challenge (the six primary trigger posts). Transfer-target
 * posts reuse a skill with a different minigameId and must not overwrite it.
 */
const skillToChallenge = {};
for (const p of openFeedPosts) {
  if (!p.triggerSkill || !p.minigameId || !p.transferMinigameId) continue;
  skillToChallenge[p.triggerSkill] = {
    initial: p.minigameId,
    transfer: p.transferMinigameId,
    transferPost: p.transferPostId ?? null,
  };
}
const actionableSkills = Object.keys(skillToChallenge).sort();

const media = {};
for (const [id, a] of Object.entries(mediaAssets)) {
  media[id] = {
    publicPath: a.publicPath,
    type: a.type,
    isSvg: a.type === "svg",
    hasRaster: RASTER_TYPES.has(a.type),
    analyzable: !NON_ANALYZABLE.has(id),
  };
}

// Only what the agents legitimately get to see. `tone`, `triggerSkill` and
// `minigameId` are deliberately excluded — they are curated answers.
const corpus = openFeedPosts.map((p) => ({
  id: p.id,
  body: p.body,
  handle: p.handle,
  category: p.category,
  tags: p.tags ?? [],
  mediaKind: p.mediaKind,
  mediaAssetId: p.mediaAssetId ?? null,
  reactions: p.reactions,
  comments: p.comments,
  shares: p.shares,
  time: p.time,
  topComments: (p.seedComments ?? []).slice(0, 5).map((c) => c.body.en),
  // Kept OUT of the request payload; used only by the replay scorecard.
  _tone: p.tone,
  _expectedSkill: p.triggerSkill ?? null,
  _expectedChallenge: p.minigameId ?? null,
}));

const catalog = {
  catalogVersion: 1,
  generatedFrom: [
    "frontend/src/data/openFeedPosts.ts",
    "frontend/src/data/experienceMinigames.ts",
    "frontend/src/data/mediaAssets.ts",
  ],
  challengeIds,
  skills,
  actionableSkills,
  skillToChallenge,
  postBindings,
  media,
};

const out = resolvePath(here, "..", "app", "catalog", "catalog.json");
writeFileSync(out, `${JSON.stringify(catalog, null, 2)}\n`);

const corpusOut = resolvePath(here, "..", "tests", "fixtures", "corpus.json");
writeFileSync(corpusOut, `${JSON.stringify(corpus, null, 2)}\n`);

console.log(`catalog  -> ${out}`);
console.log(`  ${challengeIds.length} challenges, ${actionableSkills.length}/${skills.length} actionable skills, ${Object.keys(postBindings).length} post bindings, ${Object.keys(media).length} media assets`);
console.log(`corpus   -> ${corpusOut}  (${corpus.length} posts)`);
