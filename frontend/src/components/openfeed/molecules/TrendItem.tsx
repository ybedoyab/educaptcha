interface TrendItemProps {
  context: string;
  title: string;
}

export function TrendItem({ context, title }: TrendItemProps) {
  return (
    <li className="px-4 py-3 transition-colors hover:bg-social-text/[0.03]">
      <p className="text-[13px] leading-4 text-social-muted">{context}</p>
      <p className="mt-0.5 text-[15px] font-bold leading-5 text-social-text">
        {title}
      </p>
    </li>
  );
}

