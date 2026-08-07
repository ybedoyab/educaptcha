import { useState } from "react";
import type { Language } from "../../types";
import type {
  ChallengeResult,
  ImageInspectionInteraction,
} from "../../types/minigame";
import { useI18n } from "../../i18n/I18nContext";
import { MinigameProgress } from "./MinigameProgress";
import { DemoPhoto } from "./DemoPhoto";

interface Props {
  interaction: ImageInspectionInteraction;
  language: Language;
  onSolved: (result: Omit<ChallengeResult, "durationMs" | "completed">) => void;
  onHint: (hint: string | null) => void;
  mode?: "play" | "review";
}

export function ImageInspectionGame({
  interaction,
  language,
  onSolved,
  onHint,
  mode = "play",
}: Props) {
  const { copy } = useI18n();
  const [marks, setMarks] = useState<string[]>([]);
  const [conclusion, setConclusion] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [phase, setPhase] = useState<"mark" | "conclude">(
    mode === "review" ? "conclude" : "mark",
  );

  const toggleMark = (id: string) => {
    if (phase !== "mark") return;
    setMarks((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= interaction.maxMarks) return prev;
      return [...prev, id];
    });
  };

  const submitConclusion = (id: string) => {
    setConclusion(id);
    const correct = interaction.conclusions.find((c) => c.id === id)?.correct;
    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);
    if (correct || nextAttempts >= interaction.maxAttempts) {
      onHint(null);
      onSolved({
        correct: Boolean(correct),
        score: correct ? 1 : 0,
        attempts: nextAttempts,
        selectedIds: [...marks, id],
        hintsUsed: correct ? 0 : 1,
        signalsFound: marks.length,
        signalsTotal: interaction.maxMarks,
      });
    } else {
      onHint(copy.minigame.hintInspect);
      setConclusion(null);
    }
  };

  return (
    <div className="space-y-3">
      {phase === "mark" && (
        <MinigameProgress
          current={marks.length}
          total={interaction.maxMarks}
          label={copy.minigame.marksProgress}
        />
      )}

      <div className="relative overflow-hidden rounded-xl border border-navy/10">
        <DemoPhoto
          assetId={interaction.mediaAssetId}
          src={interaction.imageSrc}
          alt={interaction.imageAlt[language]}
        />
        {interaction.hotspots.map((h) => {
          const active = marks.includes(h.id);
          return (
            <button
              key={h.id}
              type="button"
              aria-label={h.label[language]}
              aria-pressed={active}
              onClick={() => toggleMark(h.id)}
              disabled={mode === "review"}
              className={`absolute min-h-11 min-w-11 rounded-lg border-2 transition ${
                active
                  ? "border-amber bg-amber/30"
                  : "border-white/70 bg-white/10 hover:bg-teal/30"
              }`}
              style={{
                left: `${h.x}%`,
                top: `${h.y}%`,
                width: `${h.w}%`,
                height: `${h.h}%`,
              }}
            />
          );
        })}
      </div>

      {phase === "mark" && (
        <button
          type="button"
          disabled={marks.length === 0}
          onClick={() => setPhase("conclude")}
          className="inline-flex min-h-11 items-center rounded-xl bg-navy px-4 text-sm font-semibold text-white disabled:opacity-40"
        >
          {copy.minigame.chooseConclusion}
        </button>
      )}

      {phase === "conclude" && (
        <div className="grid gap-2" role="radiogroup" aria-label={copy.minigame.chooseConclusion}>
          {interaction.conclusions.map((c) => (
            <button
              key={c.id}
              type="button"
              role="radio"
              aria-checked={conclusion === c.id}
              onClick={() => submitConclusion(c.id)}
              className={`min-h-11 rounded-xl border-2 px-3 py-2.5 text-left text-sm font-medium ${
                conclusion === c.id
                  ? "border-teal bg-teal/10"
                  : "border-navy/15 bg-white hover:border-sky"
              }`}
            >
              {c.label[language]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
