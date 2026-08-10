interface FeedAvatarProps {
  author: string;
  hue: number;
  size?: "sm" | "md";
}

const AVATAR_SIZE_CLASSES = {
  sm: "h-9 w-9 text-xs",
  md: "h-10 w-10 text-sm",
} as const;

export function FeedAvatar({ author, hue, size = "md" }: FeedAvatarProps) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-bold text-white ${AVATAR_SIZE_CLASSES[size]}`}
      style={{ backgroundColor: `hsl(${hue} 45% 42%)` }}
      aria-hidden="true"
    >
      {author.slice(0, 1)}
    </div>
  );
}

