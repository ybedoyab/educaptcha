import type { Language } from "../../types";
import type {
  ChallengeResult,
  SortSequenceInteraction,
} from "../../types/minigame";

/** Placeholder for sortable sequences — not used in current six minigames. */
export function SortSequenceGame({
  onSolved,
}: {
  interaction: SortSequenceInteraction;
  language: Language;
  onSolved: (result: Omit<ChallengeResult, "durationMs" | "completed">) => void;
}) {
  return (
    <button
      type="button"
      className="text-sm text-navy"
      onClick={() =>
        onSolved({
          correct: true,
          score: 1,
          attempts: 1,
          selectedIds: [],
          hintsUsed: 0,
        })
      }
    >
      Sort sequence unavailable
    </button>
  );
}
