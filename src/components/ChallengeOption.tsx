import { Check, Circle } from "lucide-react";

interface ChallengeOptionProps {
  id: string;
  label: string;
  selected: boolean;
  revealed: boolean;
  isCorrect: boolean;
  disabled: boolean;
  onSelect: (id: string) => void;
  index: number;
}

export function ChallengeOption({
  id,
  label,
  selected,
  revealed,
  isCorrect,
  disabled,
  onSelect,
  index,
}: ChallengeOptionProps) {
  const letter = String.fromCharCode(65 + index);

  let styles =
    "border-navy/15 bg-white hover:border-teal/50 hover:bg-teal/5";
  if (revealed && isCorrect) {
    styles = "border-teal bg-teal/10";
  } else if (revealed && selected && !isCorrect) {
    styles = "border-amber bg-amber/10";
  } else if (selected && !revealed) {
    styles = "border-sky bg-sky/10";
  }

  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      disabled={disabled}
      onClick={() => onSelect(id)}
      className={`flex w-full items-start gap-3 rounded-xl border-2 px-3.5 py-3 text-left text-sm transition ${styles} disabled:cursor-default`}
    >
      <span
        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
          revealed && isCorrect
            ? "bg-teal text-white"
            : selected
              ? "bg-sky text-navy"
              : "bg-navy/5 text-navy/60"
        }`}
        aria-hidden
      >
        {revealed && isCorrect ? <Check className="h-3.5 w-3.5" /> : letter}
      </span>
      <span className="flex-1 leading-snug text-navy">{label}</span>
      {revealed && isCorrect && (
        <span className="sr-only">Correct answer</span>
      )}
      {!revealed && selected && (
        <Circle className="mt-1 h-3.5 w-3.5 shrink-0 fill-sky text-sky" aria-hidden />
      )}
    </button>
  );
}
