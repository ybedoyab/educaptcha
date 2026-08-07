import { useState } from "react";
import type { Language } from "../../types";
import type {
  ChallengeResult,
  ContextMatchInteraction,
} from "../../types/minigame";
import { useI18n } from "../../i18n/I18nContext";
import { DemoPhoto } from "./DemoPhoto";
import { SourceTrace } from "./SourceTrace";

interface Props {
  interaction: ContextMatchInteraction;
  language: Language;
  onSolved: (result: Omit<ChallengeResult, "durationMs" | "completed">) => void;
  onHint: (hint: string | null) => void;
  mode?: "play" | "review";
  reviewResult?: ChallengeResult | null;
}

type Phase = "spot" | "check" | "decide" | "feedback";

const DEFAULT_DECISIONS = [
  {
    id: "current",
    label: { en: "Current local event", es: "Evento local actual" },
    correct: false,
  },
  {
    id: "wrong-context",
    label: {
      en: "Real image, wrong context",
      es: "Imagen real, contexto incorrecto",
    },
    correct: true,
  },
  {
    id: "ai",
    label: { en: "AI-generated image", es: "Imagen generada por IA" },
    correct: false,
  },
];

export function ContextMatchGame({
  interaction,
  language,
  onSolved,
  onHint,
  mode = "play",
  reviewResult,
}: Props) {
  const { copy } = useI18n();
  const [phase, setPhase] = useState<Phase>(
    mode === "review" ? "feedback" : "spot",
  );
  const [choice, setChoice] = useState<string | null>(
    reviewResult?.selectedIds[0] ?? null,
  );
  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(mode === "review");

  if (!interaction.sourceTrace?.length) {
    if (import.meta.env.DEV) {
      console.error(
        `[EduCAPTCHA] context-match requires sourceTrace (media=${interaction.mediaAssetId ?? "unknown"})`,
      );
    }
  }

  const decisions =
    interaction.conclusions && interaction.conclusions.length > 0
      ? interaction.conclusions
      : DEFAULT_DECISIONS;
  const correctId =
    decisions.find((d) => d.correct)?.id ?? "wrong-context";
  const assetId = interaction.mediaAssetId;
  const trace = interaction.sourceTrace ?? [];

  const submit = (id: string) => {
    const ok = id === correctId;
    const next = attempts + 1;
    setAttempts(next);
    setChoice(id);
    if (ok || next >= interaction.maxAttempts) {
      setLocked(true);
      setPhase("feedback");
      onHint(null);
      onSolved({
        correct: ok,
        score: ok ? 1 : 0,
        attempts: next,
        selectedIds: [id],
        hintsUsed: ok ? 0 : 1,
      });
    } else {
      onHint(
        language === "es"
          ? "Mira la fecha y el lugar originales."
          : "Look at the original date and place.",
      );
    }
  };

  const steps = [
    { id: "spot", label: language === "es" ? "Mirar" : "Spot" },
    { id: "check", label: language === "es" ? "Revisar" : "Check" },
    { id: "decide", label: language === "es" ? "Decidir" : "Decide" },
  ];
  const stepIndex = phase === "spot" ? 0 : phase === "check" ? 1 : 2;

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <ol className="flex gap-2" aria-label="Progress">
        {steps.map((s, i) => (
          <li
            key={s.id}
            className={`inline-flex min-h-9 flex-1 items-center justify-center rounded-lg px-2 text-xs font-semibold ${
              i === stepIndex
                ? "bg-teal/15 text-teal"
                : i < stepIndex
                  ? "bg-navy/5 text-navy/55"
                  : "bg-off-white text-navy/30"
            }`}
          >
            {i + 1}. {s.label}
          </li>
        ))}
      </ol>

      {(phase === "spot" || phase === "feedback") && (
        <div className="space-y-3">
          {phase === "spot" && (
            <p className="text-base font-semibold text-navy">
              {language === "es"
                ? "Antes de compartir, revisa una cosa."
                : "Before you share, check one thing."}
            </p>
          )}
          <p className="rounded-xl bg-amber/10 px-3 py-2 text-sm font-medium text-navy">
            {interaction.claim[language]}
          </p>
          <DemoPhoto
            assetId={assetId}
            src={interaction.imageSrc}
            alt={interaction.imageAlt[language]}
            eager
          />
          {phase === "spot" && (
            <button
              type="button"
              data-primary-cta="true"
              onClick={() => setPhase("check")}
              className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-teal px-4 text-sm font-semibold text-white"
            >
              {language === "es" ? "Revisar la fuente" : "Check the source"}
            </button>
          )}
        </div>
      )}

      {phase === "check" && (
        <div className="space-y-3">
          <p className="text-base font-semibold text-navy">
            {language === "es" ? "¿De dónde sale?" : "Where is it from?"}
          </p>
          {trace.length > 0 ? (
            <SourceTrace steps={trace} />
          ) : (
            <p className="rounded-xl border border-amber/40 bg-amber/10 px-3 py-3 text-sm text-navy" role="alert">
              {language === "es"
                ? "Falta el rastro de fuente para este reto."
                : "Source trace is missing for this challenge."}
            </p>
          )}
          <button
            type="button"
            data-primary-cta="true"
            onClick={() => setPhase("decide")}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-teal px-4 text-sm font-semibold text-white"
          >
            {language === "es"
              ? "Elegir qué significa"
              : "Choose what this means"}
          </button>
        </div>
      )}

      {phase === "decide" && (
        <div className="space-y-3">
          <p className="text-base font-semibold text-navy">
            {language === "es" ? "¿Qué encontraste?" : "What did you find?"}
          </p>
          <ul className="space-y-2">
            {decisions.map((d) => (
              <li key={d.id}>
                <button
                  type="button"
                  disabled={locked}
                  onClick={() => setChoice(d.id)}
                  className={`min-h-11 w-full rounded-xl border-2 px-3 py-2.5 text-left text-sm font-medium ${
                    choice === d.id
                      ? "border-teal bg-teal/10 text-navy"
                      : "border-navy/10 bg-white text-navy hover:border-sky"
                  }`}
                >
                  {d.label[language]}
                </button>
              </li>
            ))}
          </ul>
          {choice && !locked && (
            <button
              type="button"
              data-primary-cta="true"
              onClick={() => submit(choice)}
              className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-navy px-4 text-sm font-semibold text-white"
            >
              {copy.minigame.check}
            </button>
          )}
        </div>
      )}

      {phase === "feedback" && (
        <div className="space-y-3 rounded-xl border border-navy/10 bg-off-white p-4">
          <DemoPhoto
            assetId={assetId}
            src={interaction.imageSrc}
            alt={interaction.imageAlt[language]}
            className="max-h-40"
          />
          {/* When reviewResult is set, MinigameFeedback owns the Continue CTA + explanation */}
          {!reviewResult && (
            <p className="text-sm font-semibold text-navy">
              {choice === correctId
                ? interaction.conclusion?.[language] ??
                  (language === "es"
                    ? "Correcto. La imagen es real, pero se cambiaron su fecha y lugar originales."
                    : "Correct. The image is real, but its original date and location were changed.")
                : language === "es"
                  ? "La imagen es real, pero el contexto no coincide."
                  : "The image is real, but the context does not match."}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
