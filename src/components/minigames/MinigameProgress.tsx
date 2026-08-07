interface MinigameProgressProps {
  current: number;
  total: number;
  label: string;
}

export function MinigameProgress({ current, total, label }: MinigameProgressProps) {
  const pct = Math.round((current / Math.max(total, 1)) * 100);
  return (
    <div className="w-full">
      <div className="mb-1 flex justify-between text-xs font-medium text-navy/60">
        <span>{label}</span>
        <span>
          {current}/{total}
        </span>
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-navy/10"
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={total}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-teal to-sky transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
