interface YMarkProps {
  className?: string;
  label: string;
}

export function YMark({ className = "h-8 w-8", label }: YMarkProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={label}
    >
      <title>{label}</title>
      <path
        d="M6 5.5 16 16m10-10.5L16 16m0 0v10.5"
        stroke="currentColor"
        strokeWidth="4.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

