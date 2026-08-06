interface ProgressIndicatorProps {
  current: number;
  total: number;
  label: string;
  ofLabel: string;
}

export function ProgressIndicator({
  current,
  total,
  label,
  ofLabel,
}: ProgressIndicatorProps) {
  const pct = Math.round((current / total) * 100);

  return (
    <div className="w-full">
      <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-navy/60">
        <span>{label}</span>
        <span>
          {current} {ofLabel} {total}
        </span>
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-navy/10"
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={`${label}: ${current} ${ofLabel} ${total}`}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-teal to-sky transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
