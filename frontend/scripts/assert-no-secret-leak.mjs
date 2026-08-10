#!/usr/bin/env node
/**
 * Fails if the Vite client bundle contains canary secret values that must
 * never leak through `import.meta.env` / define inlining.
 *
 * Usage (after `npm run build`, optionally with canaries set in the env):
 *   BACKEND_SECRET_DO_NOT_LEAK=… LANGSMITH_SECRET_DO_NOT_LEAK=… npm run build
 *   npm run test:secrets
 *
 * When those env vars are unset, the script still greps for the canary
 * *names* as literal substrings — a mistaken `define: { ...process.env }`
 * would still fail the check.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, "../dist");

const CANARIES = [
  "BACKEND_SECRET_DO_NOT_LEAK",
  "LANGSMITH_SECRET_DO_NOT_LEAK",
];

function walk(dir) {
  /** @type {string[]} */
  const files = [];
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) files.push(...walk(full));
    else files.push(full);
  }
  return files;
}

function main() {
  let st;
  try {
    st = statSync(distDir);
  } catch {
    console.error(`assert-no-secret-leak: missing dist at ${distDir} (run build first)`);
    process.exit(1);
  }
  if (!st.isDirectory()) {
    console.error(`assert-no-secret-leak: ${distDir} is not a directory`);
    process.exit(1);
  }

  const setCanaries = CANARIES.filter((name) => {
    const v = process.env[name];
    return typeof v === "string" && v.length > 0;
  });

  // Prefer scanning for the env *values* when present (exact leak of a secret).
  // Always also scan for the canary names themselves.
  const needles = new Set(CANARIES);
  for (const name of setCanaries) {
    needles.add(process.env[name]);
  }

  const hits = [];
  for (const file of walk(distDir)) {
    if (!/\.(js|css|html|map|json)$/i.test(file)) continue;
    let text;
    try {
      text = readFileSync(file, "utf8");
    } catch {
      continue;
    }
    for (const needle of needles) {
      if (needle && text.includes(needle)) {
        hits.push({ file: path.relative(distDir, file), needle });
      }
    }
  }

  if (hits.length > 0) {
    console.error("assert-no-secret-leak: secret material found in dist:");
    for (const h of hits) {
      console.error(`  ${h.file} contains ${JSON.stringify(h.needle)}`);
    }
    process.exit(1);
  }

  console.log(
    `assert-no-secret-leak: ok (${[...needles].length} needle(s) checked in ${distDir})`,
  );
}

main();
