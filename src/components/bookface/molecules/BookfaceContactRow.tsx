import { FeedAvatar } from "../../openfeed/atoms/FeedAvatar";

interface BookfaceContactRowProps {
  name: string;
  hue: number;
}

export function BookfaceContactRow({ name, hue }: BookfaceContactRowProps) {
  return (
    <li className="flex min-h-11 items-center gap-3 rounded-lg px-2 py-1">
      <span className="relative shrink-0">
        <FeedAvatar author={name} hue={hue} size="sm" />
        <span
          className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-bf-green ring-2 ring-bf-bg"
          aria-hidden="true"
        />
      </span>
      <span className="min-w-0 flex-1 truncate text-[15px] font-medium text-bf-text">
        {name}
      </span>
    </li>
  );
}
