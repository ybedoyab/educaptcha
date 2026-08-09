interface BookfaceMarkProps {
  className?: string;
  label: string;
}

/**
 * Original wordless mark for the simulated network: a filled disc carrying a
 * geometric lowercase "b". Drawn from primitives on purpose — the skin imitates
 * a layout, never a real company's logo.
 */
export function BookfaceMark({ className = "h-10 w-10", label }: BookfaceMarkProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 40 40"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={label}
    >
      <title>{label}</title>
      <circle cx="20" cy="20" r="20" fill="currentColor" />
      <g
        fill="none"
        stroke="#ffffff"
        strokeWidth="3.5"
        strokeLinecap="round"
      >
        <path d="M15 10.5v19" />
        <circle cx="20.5" cy="24" r="5.5" />
      </g>
    </svg>
  );
}
