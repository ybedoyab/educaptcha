interface PostMetaProps {
  author: string;
  handle: string;
  time: string;
  highlighted: boolean;
  highlightedLabel: string;
}

export function PostMeta({
  author,
  handle,
  time,
  highlighted,
  highlightedLabel,
}: PostMetaProps) {
  return (
    <header className="flex min-w-0 items-center gap-1 text-[15px] leading-5">
      <h3 className="truncate font-bold text-social-text hover:underline">
        {author}
      </h3>
      <span className="truncate text-social-muted">{handle}</span>
      <span className="shrink-0 text-social-muted" aria-hidden="true">
        ·
      </span>
      <span className="shrink-0 text-social-muted">{time}</span>
      {highlighted ? (
        <span className="ml-1 shrink-0 rounded-full bg-social-blue/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-social-blue">
          {highlightedLabel}
        </span>
      ) : null}
    </header>
  );
}

