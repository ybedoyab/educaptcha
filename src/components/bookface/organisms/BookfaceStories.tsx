import { openFeedPosts } from "../../../data/openFeedPosts";
import { useI18n } from "../../../i18n/I18nContext";
import { BookfaceStoryCard } from "../molecules/BookfaceStoryCard";
import { BOOKFACE_LIMITS } from "../bookface.constants";
import { feedPeople } from "../bookface.utils";

export function BookfaceStories() {
  const { copy, language } = useI18n();
  const people = feedPeople(openFeedPosts, language, BOOKFACE_LIMITS.stories);

  return (
    <section
      className="rounded-lg bg-white px-2 py-3 shadow-sm"
      aria-labelledby="bf-stories-title"
    >
      <h2 id="bf-stories-title" className="sr-only">
        {copy.experience.bfStoriesTitle}
      </h2>
      {/* The scroller is focusable so the rail can be panned from the keyboard
          — a horizontally scrolling region with no focusable content is a
          serious axe failure. */}
      <div
        className="overflow-x-auto px-1 pb-1"
        tabIndex={0}
        aria-labelledby="bf-stories-title"
      >
        <ul className="flex gap-2">
          {people.map((person) => (
            <BookfaceStoryCard
              key={person.id}
              name={person.name}
              hue={person.hue}
            />
          ))}
        </ul>
      </div>
    </section>
  );
}
