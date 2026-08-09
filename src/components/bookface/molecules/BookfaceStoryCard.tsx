import { useI18n } from "../../../i18n/I18nContext";
import { fillTemplate } from "../bookface.utils";

interface BookfaceStoryCardProps {
  name: string;
  hue: number;
}

/**
 * Decorative on purpose: the stories rail sells the layout, but opening a story
 * is not part of the prototype, so these are list items rather than dead
 * buttons.
 */
export function BookfaceStoryCard({ name, hue }: BookfaceStoryCardProps) {
  const { copy } = useI18n();

  return (
    <li
      className="relative h-[180px] w-[104px] shrink-0 overflow-hidden rounded-xl"
      style={{
        background: `linear-gradient(165deg, hsl(${hue} 45% 58%), hsl(${hue} 48% 28%))`,
      }}
    >
      <span
        className="absolute left-2 top-2 grid h-9 w-9 place-items-center rounded-full text-sm font-bold text-white ring-[3px] ring-bf-blue"
        style={{ backgroundColor: `hsl(${hue} 45% 42%)` }}
        aria-hidden="true"
      >
        {name.slice(0, 1)}
      </span>
      <span
        className="absolute inset-x-2 bottom-2 line-clamp-2 text-[13px] font-semibold leading-4 text-white drop-shadow"
        aria-hidden="true"
      >
        {name}
      </span>
      <span className="sr-only">
        {fillTemplate(copy.experience.bfStoryFrom, { author: name })}
      </span>
    </li>
  );
}
