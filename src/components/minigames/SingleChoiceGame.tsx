import { useState } from "react";
import type { Language } from "../../types";
import type {
  ChallengeResult,
  SingleChoiceInteraction,
} from "../../types/minigame";
import { ChallengeOption } from "../ChallengeOption";
import { useI18n } from "../../i18n/I18nContext";

interface Props {
  interaction: SingleChoiceInteraction;
  language: Language;
  onSolved: (result: Omit<ChallengeResult, "durationMs" | "completed">) => void;
  mode?: "play" | "review";
  reviewResult?: ChallengeResult | null;
}

export function SingleChoiceGame({
  interaction,
  language,
  onSolved,
  mode = "play",
  reviewResult,
}: Props) {
  const { copy } = useI18n();
  const [selected, setSelected] = useState<string | null>(
    reviewResult?.selectedIds[0] ?? null,
  );
  const [revealed, setRevealed] = useState(mode === "review");

  return (
    <div className="space-y-3">
      <div role="radiogroup" className="space-y-2">
        {interaction.options.map((opt, i) => (
          <ChallengeOption
            key={opt.id}
            id={opt.id}
            label={opt.label[language]}
            selected={selected === opt.id}
            revealed={revealed}
            isCorrect={opt.id === interaction.correctOptionId}
            disabled={revealed}
            onSelect={setSelected}
            index={i}
          />
        ))}
      </div>
      {!revealed && (
        <button
          type="button"
          disabled={!selected}
          onClick={() => {
            if (!selected) return;
            setRevealed(true);
            const correct = selected === interaction.correctOptionId;
            onSolved({
              correct,
              score: correct ? 1 : 0,
              attempts: 1,
              selectedIds: [selected],
              hintsUsed: 0,
            });
          }}
          className="inline-flex min-h-11 items-center rounded-xl bg-navy px-4 text-sm font-semibold text-white disabled:opacity-40"
        >
          {copy.minigame.check}
        </button>
      )}
    </div>
  );
}
