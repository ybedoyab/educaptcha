import fs from "fs";

const p = "src/data/openFeedPosts.ts";
let s = fs.readFileSync(p, "utf8");

const map = {
  "/demo-assets/neutral-news-report.svg": "neutral-news-report",
  "/demo-assets/source-document.svg": "source-document",
  "/demo-assets/viral-health-alert.svg": "viral-health-alert",
  "/demo-assets/photos/flood-lagos-2019.jpg": "flood-lagos-2019",
  "/demo-assets/photos/wildfire-washington-dc.jpg": "wildfire-washington-dc",
  "/demo-assets/photos/vaccine-vial-2024.jpg": "vaccine-vial-2024",
  "/demo-assets/photos/protest-2024.jpg": "protest-2024",
  "/demo-assets/misleading-chart-preview.svg": "misleading-chart-preview",
  "/demo-assets/photos/flood-response-2015.jpg": "flood-response-2015",
};

for (const [path, id] of Object.entries(map)) {
  s = s.split(`imageSrc: "${path}"`).join(`mediaAssetId: "${id}"`);
}

const transfers = [
  ["p-flood-live", "ic-transfer", "p-flood-today"],
  ["p-alert-urgent", "ep-transfer", "p-inside"],
  ["p-wildfire", "wf-transfer", "p-flood-today"],
  ["p-vaccine", "vx-transfer", "p-health-tips"],
  ["p-protest", "pr-transfer", "p-flood-today"],
  ["p-chart", "ch-transfer", "p-tech"],
];

for (const [postId, transferId, transferPost] of transfers) {
  const needle = `transferMinigameId: "${transferId}",`;
  // only first occurrence after post id — approximate by unique transfer ids
  if (s.includes(needle) && !s.includes(`transferPostId: "${transferPost}"`)) {
    // insert after transferMinigameId for this specific game if not already present near post
  }
}

// Safer: insert transferPostId after each unique transferMinigameId line once
const inserts = {
  'transferMinigameId: "ic-transfer",':
    'transferMinigameId: "ic-transfer",\n    transferPostId: "p-flood-today",',
  'transferMinigameId: "ep-transfer",':
    'transferMinigameId: "ep-transfer",\n    transferPostId: "p-inside",',
  'transferMinigameId: "wf-transfer",':
    'transferMinigameId: "wf-transfer",\n    transferPostId: "p-flood-today",',
  'transferMinigameId: "vx-transfer",':
    'transferMinigameId: "vx-transfer",\n    transferPostId: "p-health-tips",',
  'transferMinigameId: "pr-transfer",':
    'transferMinigameId: "pr-transfer",\n    transferPostId: "p-flood-today",',
  'transferMinigameId: "ch-transfer",':
    'transferMinigameId: "ch-transfer",\n    transferPostId: "p-tech",',
};

for (const [from, to] of Object.entries(inserts)) {
  if (!s.includes("transferPostId:") || s.split(from).length > 1) {
    s = s.replace(from, to);
  }
}

fs.writeFileSync(p, s);
console.log("openFeedPosts migrated", (s.match(/mediaAssetId:/g) || []).length);
