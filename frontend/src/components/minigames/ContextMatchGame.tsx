import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  CircleHelp,
  ImageIcon,
  Search,
  Share2,
  Sparkles,
} from "lucide-react";
import type { Language } from "../../types";
import type {
  ChallengeResult,
  ContextMatchInteraction,
} from "../../types/minigame";
import { DemoPhoto } from "./DemoPhoto";
import { SourceTrace } from "./SourceTrace";
import { ListenControl } from "./ListenControl";

interface Props {
  interaction: ContextMatchInteraction;
  language: Language;
  onSolved: (result: Omit<ChallengeResult, "durationMs" | "completed">) => void;
  onHint: (hint: string | null) => void;
  onSkip?: () => void;
  mode?: "play" | "review";
  reviewResult?: ChallengeResult | null;
  /** Why this pause opened — “AI found…” from the risk decision. */
  interceptReason?: string | null;
}

type Phase = "intercept" | "check" | "decide" | "result";

const DEFAULT_DECISIONS = [
  {
    id: "current",
    label: {
      en: "This is a current local event",
      es: "Es un evento local de hoy",
    },
    correct: false,
  },
  {
    id: "wrong-context",
    label: {
      en: "This is a real image used in the wrong context",
      es: "Es una imagen real usada en el contexto equivocado",
    },
    correct: true,
  },
  {
    id: "ai",
    label: {
      en: "This is an AI-generated image",
      es: "Es una imagen generada por IA",
    },
    correct: false,
  },
];

const OPTION_LETTERS = ["A", "B", "C", "D"];

function originalSummary(
  interaction: ContextMatchInteraction,
  language: Language,
): string {
  const original = interaction.sourceTrace?.find((s) => s.kind === "original");
  if (!original) return "";
  return original.detail
    ? `${original.value[language]} — ${original.detail[language]}`
    : original.value[language];
}

function sourceFoundSummary(
  interaction: ContextMatchInteraction,
  language: Language,
): string {
  const archive = interaction.sourceTrace?.find((s) => s.kind === "archive");
  return archive?.value[language] ?? "";
}

export function ContextMatchGame({
  interaction,
  language,
  onSolved,
  onHint,
  onSkip,
  mode = "play",
  reviewResult,
  interceptReason,
}: Props) {
  const [phase, setPhase] = useState<Phase>(
    mode === "review" ? "result" : "intercept",
  );
  const [choice, setChoice] = useState<string | null>(
    reviewResult?.selectedIds[0] ?? null,
  );
  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(mode === "review");

  const decisions =
    interaction.conclusions && interaction.conclusions.length > 0
      ? interaction.conclusions
      : DEFAULT_DECISIONS;
  const correctId =
    decisions.find((d) => d.correct)?.id ?? "wrong-context";
  const assetId = interaction.mediaAssetId;
  const trace = interaction.sourceTrace ?? [];
  const original = originalSummary(interaction, language);
  const sourceFound = sourceFoundSummary(interaction, language);
  const claim = interaction.claim[language];
  const whyPaused =
    interceptReason?.trim() ||
    interaction.instruction[language] ||
    (language === "es"
      ? "La IA encontró un riesgo de verificación en esta foto. Completa el chequeo."
      : "AI found a verification risk on this photo. Complete the check.");

  const listenText = useMemo(() => {
    if (phase === "intercept") {
      return language === "es"
        ? `Antes de compartir, revisa esta foto. ${whyPaused} Afirmación: ${claim}`
        : `Before you share, check this photo. ${whyPaused} Claim: ${claim}`;
    }
    if (phase === "check") {
      const bits = trace
        .map((s) => {
          const v = s.detail
            ? `${s.value[language]} — ${s.detail[language]}`
            : s.value[language];
          return `${s.label[language]}: ${v}`;
        })
        .join(". ");
      return language === "es"
        ? `Revisa la fuente original. ${bits}`
        : `Check the original source. ${bits}`;
    }
    if (phase === "decide") {
      const opts = decisions
        .map((d, i) => `${OPTION_LETTERS[i]}. ${d.label[language]}`)
        .join(". ");
      return language === "es"
        ? `¿Qué encontraste? Afirmación: ${claim}. Original: ${original}. Opciones: ${opts}`
        : `What did you find? Claim: ${claim}. Original: ${original}. Options: ${opts}`;
    }
    return language === "es"
      ? `Buen ojo. Es una imagen real, pero se reutilizó con fecha y lugar incorrectos. Fuente: ${sourceFound}. Foto: ${original}. Revisaste la fuente antes de compartir.`
      : `Good catch. This is a real image, but it was reused with the wrong date and location. Source: ${sourceFound}. Photo: ${original}. You checked the source before sharing.`;
  }, [phase, language, claim, original, sourceFound, trace, decisions, whyPaused]);

  const submit = (id: string) => {
    const ok = id === correctId;
    const next = attempts + 1;
    setAttempts(next);
    setChoice(id);
    if (ok || next >= interaction.maxAttempts) {
      setLocked(true);
      setPhase("result");
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
          ? "Compara la fecha y el lugar originales con el post."
          : "Compare the original date and place with the post.",
      );
    }
  };

  const steps = [
    { id: "intercept", label: language === "es" ? "Pausa" : "Pause" },
    { id: "check", label: language === "es" ? "Revisar" : "Check" },
    { id: "decide", label: language === "es" ? "Decidir" : "Decide" },
  ];
  const stepIndex =
    phase === "intercept" ? 0 : phase === "check" ? 1 : phase === "decide" ? 2 : 2;

  const titleForPhase = (() => {
    if (phase === "intercept") {
      return language === "es"
        ? "Antes de compartir, revisa esta foto"
        : "Before you share, check this photo";
    }
    if (phase === "check") {
      return language === "es"
        ? "Revisa la fuente original"
        : "Check the original source";
    }
    if (phase === "decide") {
      return language === "es" ? "¿Qué encontraste?" : "What did you find?";
    }
    return choice === correctId || reviewResult?.correct
      ? language === "es"
        ? "Buen ojo"
        : "Good catch"
      : language === "es"
        ? "Casi"
        : "Close";
  })();

  return (
    <div className="mx-auto max-w-lg space-y-4">
      {phase !== "result" && (
        <ol className="flex gap-2" aria-label={language === "es" ? "Progreso" : "Progress"}>
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
      )}

      {phase === "intercept" && (
        <div className="space-y-3">
          <div>
            <div className="flex items-start justify-between gap-3">
              <h3 className="flex min-w-0 flex-1 items-start gap-2 text-lg font-bold leading-snug text-navy">
                <ImageIcon className="mt-0.5 h-5 w-5 shrink-0 text-teal" aria-hidden />
                <span>{titleForPhase}</span>
              </h3>
              <ListenControl text={listenText} compact className="shrink-0" />
            </div>
            <div className="mt-2 rounded-xl border border-teal/25 bg-teal/[0.06] px-3 py-2.5">
              <p className="flex items-start gap-2 text-sm font-semibold leading-snug text-navy">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-teal" aria-hidden />
                <span>{whyPaused}</span>
              </p>
              <p className="mt-1.5 pl-6 text-xs font-medium text-navy/60">
                {language === "es"
                  ? "Por eso debes completar esta verificación antes de compartir."
                  : "That’s why you need to complete this check before sharing."}
              </p>
            </div>
          </div>
          <p className="rounded-xl bg-amber/10 px-3 py-2.5 text-sm font-medium text-navy">
            {claim}
          </p>
          <DemoPhoto
            assetId={assetId}
            src={interaction.imageSrc}
            alt={interaction.imageAlt[language]}
            eager
          />
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              data-primary-cta="true"
              onClick={() => setPhase("check")}
              className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-teal px-4 text-sm font-semibold text-white"
            >
              <Search className="h-4 w-4" aria-hidden />
              {language === "es" ? "Revisar foto" : "Check photo"}
            </button>
            {onSkip && (
              <button
                type="button"
                onClick={onSkip}
                className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-navy/15 bg-white px-4 text-sm font-semibold text-navy"
              >
                <Share2 className="h-4 w-4" aria-hidden />
                {language === "es" ? "Compartir igual" : "Share anyway"}
              </button>
            )}
          </div>
        </div>
      )}

      {phase === "check" && (
        <div className="space-y-3">
          <div>
            <div className="flex items-start justify-between gap-3">
              <h3 className="flex min-w-0 flex-1 items-start gap-2 text-lg font-bold leading-snug text-navy">
                <Search className="mt-0.5 h-5 w-5 shrink-0 text-teal" aria-hidden />
                <span>{titleForPhase}</span>
              </h3>
              <ListenControl text={listenText} compact className="shrink-0" />
            </div>
            <p className="mt-1 text-sm text-navy/65">
              {language === "es"
                ? "Este post dice que la imagen es de hoy. Esto es lo que encontramos."
                : "This post claims the image is from today. Here’s what we found."}
            </p>
          </div>
          {trace.length > 0 ? (
            <SourceTrace steps={trace} />
          ) : (
            <p
              className="rounded-xl border border-amber/40 bg-amber/10 px-3 py-3 text-sm text-navy"
              role="alert"
            >
              {language === "es"
                ? "Falta la evidencia de fuente para este caso."
                : "Source evidence is missing for this case."}
            </p>
          )}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <button
              type="button"
              data-primary-cta="true"
              onClick={() => setPhase("decide")}
              className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-teal px-4 text-sm font-semibold text-white"
            >
              <CircleHelp className="h-4 w-4" aria-hidden />
              {language === "es" ? "¿Qué significa?" : "What does this mean?"}
            </button>
            <button
              type="button"
              onClick={() => setPhase("intercept")}
              className="inline-flex min-h-11 items-center justify-center gap-1.5 px-3 text-sm font-semibold text-navy/70 hover:text-navy"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              {language === "es" ? "Atrás" : "Back"}
            </button>
          </div>
        </div>
      )}

      {phase === "decide" && (
        <div className="space-y-3">
          <div>
            <div className="flex items-start justify-between gap-3">
              <h3 className="flex min-w-0 flex-1 items-start gap-2 text-lg font-bold leading-snug text-navy">
                <CircleHelp className="mt-0.5 h-5 w-5 shrink-0 text-teal" aria-hidden />
                <span>{titleForPhase}</span>
              </h3>
              <ListenControl text={listenText} compact className="shrink-0" />
            </div>
            <p className="mt-1 text-sm text-navy/65">
              {language === "es"
                ? "Elige la mejor descripción de esta imagen."
                : "Choose the best description of this image."}
            </p>
          </div>
          <div className="rounded-xl bg-amber/10 px-3 py-3 text-sm text-navy">
            <p>
              <span className="font-semibold">
                {language === "es" ? "Afirmación:" : "Claim:"}
              </span>{" "}
              {claim}
            </p>
            {original && (
              <p className="mt-1">
                <span className="font-semibold">
                  {language === "es" ? "Original:" : "Original:"}
                </span>{" "}
                {original}
              </p>
            )}
          </div>
          <ul className="space-y-2">
            {decisions.map((d, i) => {
              const selected = choice === d.id;
              return (
                <li key={d.id}>
                  <button
                    type="button"
                    disabled={locked}
                    onClick={() => setChoice(d.id)}
                    aria-pressed={selected}
                    className={`flex min-h-11 w-full items-center gap-3 rounded-xl border-2 px-3 py-2.5 text-left text-sm font-medium ${
                      selected
                        ? "border-teal bg-teal/10 text-navy"
                        : "border-navy/10 bg-white text-navy hover:border-sky"
                    }`}
                  >
                    <span
                      className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        selected
                          ? "bg-teal text-white"
                          : "bg-navy/5 text-navy/70"
                      }`}
                    >
                      {OPTION_LETTERS[i] ?? i + 1}
                    </span>
                    <span className="flex-1">{d.label[language]}</span>
                    {selected && (
                      <Check className="h-5 w-5 shrink-0 text-teal" aria-hidden />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            {choice && !locked && (
              <button
                type="button"
                data-primary-cta="true"
                onClick={() => submit(choice)}
                className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-teal px-4 text-sm font-semibold text-white"
              >
                <Sparkles className="h-4 w-4" aria-hidden />
                {language === "es" ? "Ver resultado" : "See result"}
              </button>
            )}
            <button
              type="button"
              onClick={() => setPhase("check")}
              className="inline-flex min-h-11 items-center justify-center gap-1.5 px-3 text-sm font-semibold text-navy/70 hover:text-navy"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              {language === "es" ? "Atrás" : "Back"}
            </button>
          </div>
        </div>
      )}

      {phase === "result" && (
        <div className="space-y-4" role="status" aria-live="polite">
          <div className="relative flex flex-col items-center text-center">
            <ListenControl
              text={listenText}
              compact
              className="absolute right-0 top-0"
            />
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-teal/15 text-teal">
              <Check className="h-8 w-8" strokeWidth={2.5} aria-hidden />
            </div>
            <h3 className="mt-3 text-xl font-bold text-navy">{titleForPhase}</h3>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-navy/75">
              {interaction.conclusion?.[language] ??
                (language === "es"
                  ? "Es una imagen real, pero se reutilizó con fecha y lugar incorrectos."
                  : "This is a real image, but it was reused with the wrong date and location.")}
            </p>
          </div>
          <ul className="space-y-2 rounded-xl border border-navy/10 bg-off-white px-3 py-3 text-left text-sm text-navy">
            {sourceFound && (
              <li className="flex items-start gap-2">
                <Search className="mt-0.5 h-4 w-4 shrink-0 text-teal" aria-hidden />
                <span>
                  <span className="font-semibold">
                    {language === "es" ? "Fuente original:" : "Original source:"}
                  </span>{" "}
                  {sourceFound}
                </span>
              </li>
            )}
            {original && (
              <li className="flex items-start gap-2">
                <ImageIcon className="mt-0.5 h-4 w-4 shrink-0 text-teal" aria-hidden />
                <span>
                  <span className="font-semibold">
                    {language === "es" ? "Foto original:" : "Original photo:"}
                  </span>{" "}
                  {original}
                </span>
              </li>
            )}
            <li className="flex items-start gap-2 text-teal">
              <Check className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <span>
                {language === "es"
                  ? "Revisaste la fuente antes de compartir."
                  : "You checked the source before sharing."}
              </span>
            </li>
          </ul>
          {/* MinigameFeedback owns Continue → return-to-context Cancel share / Share anyway */}
        </div>
      )}
    </div>
  );
}
