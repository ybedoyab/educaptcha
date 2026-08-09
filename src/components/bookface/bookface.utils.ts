import type { OpenFeedPost } from "../../data/openFeedPosts";
import type { Language } from "../../types";

/** Fills `{name}` placeholders in an already-localized template string. */
export function fillTemplate(
  template: string,
  values: Readonly<Record<string, string | number>>,
): string {
  return Object.entries(values).reduce(
    (result, [name, value]) => result.replace(`{${name}}`, String(value)),
    template,
  );
}

/** Facebook shows counts compactly once they grow ("1.2K"). */
export function compactCount(value: number, language: Language): string {
  return new Intl.NumberFormat(language, {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export type BookfacePerson = {
  id: string;
  name: string;
  hue: number;
};

/**
 * The rails (stories, contacts) are populated from the feed authors rather than
 * from invented people, so both locales stay in sync with the post data and no
 * new content needs translating.
 */
export function feedPeople(
  posts: readonly OpenFeedPost[],
  language: Language,
  limit: number,
): BookfacePerson[] {
  const people = new Map<string, BookfacePerson>();

  for (const post of posts) {
    const name = post.author[language];
    if (people.has(name)) continue;
    people.set(name, { id: post.id, name, hue: post.avatarHue });
    if (people.size === limit) break;
  }

  return [...people.values()];
}
