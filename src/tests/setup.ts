import "@testing-library/jest-dom/vitest";
import { beforeEach, vi } from "vitest";

/**
 * With `VITE_RISK_API_URL` unset — the default, and what CI builds — the app
 * must make no network calls at all. Stubbing fetch to throw turns any
 * accidental request into a loud failure, and actively proves the local path
 * stays offline rather than just assuming it.
 *
 * Tests that exercise the remote client override this with their own
 * `vi.stubGlobal("fetch", ...)`.
 */
beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: unknown) => {
      throw new Error(
        `unexpected network call in a unit test: ${String(input)}. ` +
          `Stub fetch explicitly if the test intends to exercise the risk client.`,
      );
    }),
  );
});
