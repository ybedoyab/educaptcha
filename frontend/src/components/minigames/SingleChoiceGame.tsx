import { useMemo, useState } from "react";
import { Check, CircleHelp, Share2, Sparkles } from "lucide-react";
import type { Language } from "../../types";
import type {
  ChallengeResult,
  SingleChoiceInteraction,
} from "../../types/minigame";
import { ChallengeOption } from "../ChallengeOption";
import { ListenControl } from "./ListenControl";

interface Props {
  interaction: SingleChoiceInteraction;
  language: Language;
  onSolved: (result: Omit<ChallengeResult, "durationMs" | "completed">) => void;
  onSkip?: () => void;
  mode?: "play" | "review";
  reviewResult?: ChallengeResult | null;
  interceptReason?: string | null;
}

type Phase = "pause" | "decide" | "result";

/**
 * Transfer / follow-up quizzes. Still single-choice, but framed as a
 * verification pause with an AI reason and the claim in view.
 */
export function SingleChoiceGame({
  interaction,
  language,
  onSolved,
  onSkip,
  mode = "play",
  reviewResult,
  interceptReason,
}: Props) {
  const [phase, setPhase] = useState<Phase>(
    mode === "review" ? "result" : "pause",
  );
  const [selected, setSelected] = useState<string | null>(
    reviewResult?.selectedIds[0] ?? null,
  );
  const [revealed, setRevealed] = useState(mode === "review");

  const question =
    interaction.prompt?.[language] ?? interaction.instruction[language];
  const whyPaused =
    interceptReason?.trim() ||
    (language === "es"
      ? "La IA marcó otro riesgo de verificación. Completa este chequeo breve."
      : "AI flagged another verification risk. Complete this short check.");
  const claim = interaction.claim?.[language];

  const listenText = useMemo(() => {
    if (phase === "pause") {
      return language === "es"
        ? `${whyPaused} ${claim ? `Afirmación: ${claim}. ` : ""}${question}`
        : `${whyPaused} ${claim ? `Claim: ${claim}. ` : ""}${question}`;
    }
    return question;
  }, [phase, language, whyPaused, claim, question]);

  const finish = () => {
    if (!selected) return;
    setRevealed(true);
    setPhase("result");
    const correct = selected === interaction.correctOptionId;
    onSolved({
      correct,
      score: correct ? 1 : 0,
      attempts: 1,
      selectedIds: [selected],
      hintsUsed: 0,
    });
  };

  return (
    <div className="mx-auto max-w-lg space-y-4">
      {phase === "pause" && (
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-lg font-bold leading-snug text-navy">
              {language === "es"
                ? "Otra verificación rápida"
                : "Another quick check"}
            </h3>
            <ListenControl text={listenText} compact className="shrink-0" />
          </div>
          <div className="rounded-xl border border-teal/25 bg-teal/[0.06] px-3 py-2.5">
            <p className="flex items-start gap-2 text-sm font-semibold leading-snug text-navy">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-teal" aria-hidden />
              <span>{whyPaused}</span>
            </p>
            <p className="mt-1.5 pl-6 text-xs font-medium text-navy/60">
              {language === "es"
                ? "Por eso debes responder antes de continuar."
                : "That’s why you need to answer before continuing."}
            </p>
          </div>
          {claim ? (
            <p className="rounded-xl bg-amber/10 px-3 py-2.5 text-sm font-medium text-navy">
              {claim}
            </p>
          ) : null}
          <p className="text-sm font-semibold text-navy">{question}</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              data-primary-cta="true"
              onClick={() => setPhase("decide")}
              className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-teal px-4 text-sm font-semibold text-white"
            >
              <CircleHelp className="h-4 w-4" aria-hidden />
              {language === "es" ? "Elegir respuesta" : "Choose answer"}
            </button>
            {onSkip && (
              <button
                type="button"
                onClick={onSkip}
                className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-navy/15 bg-white px-4 text-sm font-semibold text-navy"
              >
                <Share2 className="h-4 w-4" aria-hidden />
                {language === "es" ? "Omitir" : "Skip"}
              </button>
            )}
          </div>
        </div>
      )}

      {phase === "decide" && (
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-lg font-bold text-navy">{question}</h3>
            <ListenControl text={listenText} compact className="shrink-0" />
          </div>
          {claim ? (
            <p className="rounded-xl bg-amber/10 px-3 py-2 text-sm text-navy">
              {claim}
            </p>
          ) : null}
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
              data-primary-cta="true"
              disabled={!selected}
              onClick={finish}
              className="inline-flex min-h-11 cursor-pointer items-center rounded-xl bg-teal px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              {language === "es" ? "Ver resultado" : "See result"}
            </button>
          )}
        </div>
      )}

      {phase === "result" && (
        <div className="space-y-3">
          <h3 className="flex items-center gap-2 text-lg font-bold text-navy">
            <Check className="h-5 w-5 text-teal" aria-hidden />
            {selected === interaction.correctOptionId || reviewResult?.correct
              ? language === "es"
                ? "Buen ojo"
                : "Good catch"
              : language === "es"
                ? "Casi"
                : "Close"}
          </h3>
          <div role="radiogroup" className="space-y-2">
            {interaction.options.map((opt, i) => (
              <ChallengeOption
                key={opt.id}
                id={opt.id}
                label={opt.label[language]}
                selected={selected === opt.id}
                revealed
                isCorrect={opt.id === interaction.correctOptionId}
                disabled
                onSelect={() => undefined}
                index={i}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
