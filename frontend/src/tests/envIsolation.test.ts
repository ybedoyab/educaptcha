import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const viteConfigPath = path.resolve(__dirname, "../../vite.config.ts");

/**
 * Documents the client env contract: Vite's default `envPrefix` is `VITE_`,
 * so only `VITE_*` values are inlined into the browser bundle. Backend secrets
 * loaded via `envDir` (monorepo root `.env`) must never appear in `dist`.
 *
 * Runtime enforcement lives in `scripts/assert-no-secret-leak.mjs`
 * (`npm run test:secrets`) after a build that deliberately sets canary secrets.
 */
describe("env isolation", () => {
  it("keeps the default VITE_ envPrefix (no custom override that would leak)", () => {
    const source = readFileSync(viteConfigPath, "utf8");
    // A custom envPrefix of "" would expose every process.env key to the client.
    expect(source).not.toMatch(/envPrefix\s*:\s*['"]{2}/);
    expect(source).not.toMatch(/envPrefix\s*:\s*\[\s*\]/);
    expect(source).toMatch(/envPrefix\s*:\s*["']VITE_["']/);
    // Document the intentional root envDir + VITE-only comment.
    expect(source).toMatch(/envDir/);
    expect(source).toMatch(/never expose non-VITE secrets/i);
  });
});
