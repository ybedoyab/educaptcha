/**
 * Copy helper for the "why this pause opened" callout.
 *
 * The pause heading and the risk reason are authored independently: the heading
 * lives in the minigame, while the reason comes from `reasonFor()` /
 * `app.policy.reasons` and also renders standalone outside the game, so it is
 * written as a full sentence that opens with the same imperative the heading
 * already shows ("Before you share, check this photo. This image may be old or
 * out of context."). Printed as-is under the heading it reads as a doubled
 * title.
 */

/** Punctuation that can close the heading clause inside a longer reason. */
const SENTENCE_BREAK = /^[.!?:;—-]+\s+/;

/**
 * The part of `reason` that says something `heading` has not already said.
 *
 * Returns `reason` unchanged when it does not open with the heading, and when
 * the heading is all it says (so the callout never collapses to empty).
 */
export function riskDetail(reason: string, heading: string): string {
  const trimmed = reason.trim();
  const prefix = heading.trim();
  if (!prefix) return trimmed;
  if (trimmed.slice(0, prefix.length).toLowerCase() !== prefix.toLowerCase()) {
    return trimmed;
  }

  const rest = trimmed.slice(prefix.length);
  if (!SENTENCE_BREAK.test(rest)) return trimmed;

  return rest.replace(SENTENCE_BREAK, "").trim() || trimmed;
}
