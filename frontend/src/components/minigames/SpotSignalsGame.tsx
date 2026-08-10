import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  CircleHelp,
  Search,
  Share2,
  Sparkles,
  Zap,
} from "lucide-react";
import type { Language } from "../../types";
import type {
  ChallengeResult,
  SpotSignalsInteraction,
} from "../../types/minigame";
import { DemoPhoto } from "./DemoPhoto";
import { ListenControl } from "./ListenControl";
import { MinigameProgress } from "./MinigameProgress";

interface Props {
  interaction: SpotSignalsInteraction;
  language: Language;
  onSolved: (result: Omit<ChallengeResult, "durationMs" | "completed">) => void;
  onHint: (hint: string | null) => void;
  onSkip?: () => void;
  mode?: "play" | "review";
  reviewResult?: ChallengeResult | null;
  interceptReason?: string | null;
  revealed?: boolean;
}

type Phase = "intercept" | "check" | "decide" | "result";

const OPTION_LETTERS = ["A", "B", "C", "D"];

const DEFAULT_CONCLUSIONS = [
  {
    id: "pressure",
    label: {
      en: "It uses urgency, fear, and a share command to skip verification",
      es: "Usa urgencia, miedo y una orden de compartir para saltarse la verificación",
    },
    correct: true,
  },
  {
    id: "true",
    label: {
      en: "The urgency proves the claim is true",
      es: "La urgencia prueba que la afirmación es verdad",
    },
    correct: false,
  },
  {
    id: "share",
    label: {
      en: "I should share now so others can decide",
      es: "Debo compartir ya para que otros decidan",
    },
    correct: false,
  },
];

/** Emotional-pressure pause: spot urgency cues, then say what they mean. */
export function SpotSignalsGame({
  interaction,
  language,
  onSolved,
  onHint,
  onSkip,
  mode = "play",
  reviewResult,
  interceptReason,
  revealed,
}: Props) {
  const [phase, setPhase] = useState<Phase>(
    mode === "review" || revealed ? "result" : "intercept",
  );
  const [selected, setSelected] = useState<string[]>(
    reviewResult?.selectedIds.filter((id) =>
      interaction.signals.some((s) => s.id === id),
    ) ?? [],
  );
  const [choice, setChoice] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(mode === "review" || Boolean(revealed));

  const signalIds = useMemo(
    () => interaction.signals.map((s) => s.id),
    [interaction.signals],
  );
  const conclusions =
    interaction.conclusions && interaction.conclusions.length > 0
      ? interaction.conclusions
      : DEFAULT_CONCLUSIONS;
  const correctId = conclusions.find((c) => c.correct)?.id ?? "pressure";
  const claim =
    interaction.claim?.[language] ??
    interaction.headlineParts.map((p) => p.text[language]).join("");
  const whyPaused =
    interceptReason?.trim() ||
    interaction.instruction[language] ||
    (language === "es"
      ? "Antes de compartir, fíjate cómo este post te pide reaccionar. Marca las señales de presión."
      : "Before you share, notice how this post is asking you to react. Spot the pressure signals.");

  const foundEnough = selected.length >= interaction.targetCount;

  const listenText = useMemo(() => {
    if (phase === "intercept") {
      return language === "es"
        ? `Antes de compartir, busca señales de presión. ${whyPaused} Texto: ${claim}`
        : `Before you share, look for pressure signals. ${whyPaused} Text: ${claim}`;
    }
    if (phase === "check") {
      return language === "es"
        ? `Toca las ${interaction.targetCount} palabras o frases de presión en el titular.`
        : `Tap the ${interaction.targetCount} pressure words or phrases in the headline.`;
    }
    if (phase === "decide") {
      return language === "es"
        ? "¿Qué está haciendo este post?"
        : "What is this post doing?";
    }
    return language === "es"
      ? "Buen ojo. Urgencia, miedo y órdenes de compartir empujan a reaccionar sin verificar."
      : "Good catch. Urgency, fear, and share commands push people to react before verifying.";
  }, [phase, language, whyPaused, claim, interaction.targetCount]);

  const toggle = (id: string, isSignal: boolean) => {
    if (phase !== "check" || !isSignal || locked) return;
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= interaction.targetCount) return prev;
      return [...prev, id];
    });
    onHint(null);
  };

  const submit = (id: string) => {
    const ok = id === correctId;
    const next = attempts + 1;
    setAttempts(next);
    setChoice(id);
    const signalsOk = signalIds.every((s) => selected.includes(s));
    if (ok || next >= interaction.maxAttempts) {
      setLocked(true);
      setPhase("result");
      onHint(null);
      onSolved({
        correct: ok && signalsOk,
        score: ok && signalsOk ? 1 : 0,
        attempts: next,
        selectedIds: [...selected, id],
        hintsUsed: ok ? 0 : 1,
        signalsFound: selected.filter((s) => signalIds.includes(s)).length,
        signalsTotal: interaction.targetCount,
      });
    } else {
      onHint(
        language === "es"
          ? "Piensa en urgencia artificial, miedo y órdenes de compartir."
          : "Think artificial urgency, fear cues, and share commands.",
      );
      setChoice(null);
    }
  };

  const steps = [
    { id: "intercept", label: language === "es" ? "Pausa" : "Pause" },
    { id: "check", label: language === "es" ? "Revisar" : "Check" },
    { id: "decide", label: language === "es" ? "Decidir" : "Decide" },
  ];
  const stepIndex =
    phase === "intercept" ? 0 : phase === "check" ? 1 : 2;

  const titleForPhase =
    phase === "intercept"
      ? language === "es"
        ? "Antes de compartir, busca presión"
        : "Before you share, spot the pressure"
      : phase === "check"
        ? language === "es"
          ? "Toca las señales de alerta"
          : "Tap the warning signals"
        : phase === "decide"
          ? language === "es"
            ? "¿Qué está haciendo este post?"
            : "What is this post doing?"
          : choice === correctId || reviewResult?.correct
            ? language === "es"
              ? "Buen ojo"
              : "Good catch"
            : language === "es"
              ? "Casi"
              : "Close";

  const headlineBlock = (interactive: boolean) => (
    <article className="overflow-hidden rounded-xl border border-navy/10 bg-off-white">
      <DemoPhoto
        assetId={interaction.mediaAssetId}
        src={interaction.imageSrc}
        alt={interaction.mediaTitle[language]}
        eager
      />
      <div className="space-y-2 p-3 sm:p-4">
        <p className="text-xs font-semibold text-teal">
          {interaction.mediaTitle[language]}
        </p>
        <p className="text-[0.7rem] text-navy/70">
          {interaction.mediaMeta[language]}
        </p>
        <p className="text-base font-bold leading-snug text-navy sm:text-lg">
          {interaction.headlineParts.map((part) => {
            if (!interactive || !part.isSignal) {
              return (
                <span key={part.id} className="mx-0.5">
                  {part.text[language]}
                </span>
              );
            }
            const active = selected.includes(part.id);
            return (
              <button
                key={part.id}
                type="button"
                onClick={() => toggle(part.id, true)}
                className={`mx-0.5 inline cursor-pointer rounded px-1 py-0.5 transition ${
                  active
                    ? "bg-amber/35 text-navy ring-2 ring-amber"
                    : "bg-sky/20 text-navy underline decoration-teal/50 underline-offset-2 hover:bg-teal/20"
                }`}
                aria-pressed={active}
              >
                {part.text[language]}
              </button>
            );
          })}
        </p>
        {interactive ? (
          <p className="text-xs text-navy/55">
            {language === "es"
              ? "Las frases subrayadas se pueden tocar."
              : "Underlined phrases can be tapped."}
          </p>
        ) : null}
      </div>
    </article>
  );

  return (
    <div className="mx-auto max-w-lg space-y-4">
      {phase !== "result" && (
        <ol
          className="flex gap-2"
          aria-label={language === "es" ? "Progreso" : "Progress"}
        >
          {steps.map((s, i) => (
            <li
              key={s.id}
              className={`inline-flex min-h-9 flex-1 items-center justify-center rounded-lg px-2 text-xs font-semibold ${
                i === stepIndex
                  ? "bg-teal text-white"
                  : i < stepIndex
                    ? "bg-navy/10 text-navy/70"
                    : "bg-navy/5 text-navy/65"
              }`}
            >
              {i + 1}. {s.label}
            </li>
          ))}
        </ol>
      )}

      {phase === "intercept" && (
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <h3 className="flex min-w-0 flex-1 items-start gap-2 text-lg font-bold leading-snug text-navy">
              <Zap className="mt-0.5 h-5 w-5 shrink-0 text-teal" aria-hidden />
              <span>{titleForPhase}</span>
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
                ? "Por eso debes completar esta verificación antes de compartir."
                : "Thatâ€™s why you need to complete this check before sharing."}
            </p>
          </div>
          {headlineBlock(false)}
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              data-primary-cta="true"
              onClick={() => setPhase("check")}
              className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-teal px-4 text-sm font-semibold text-white"
            >
              <Search className="h-4 w-4" aria-hidden />
              {language === "es" ? "Buscar señales" : "Find signals"}
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
          <div className="flex items-start justify-between gap-3">
            <h3 className="flex min-w-0 flex-1 items-start gap-2 text-lg font-bold leading-snug text-navy">
              <Search className="mt-0.5 h-5 w-5 shrink-0 text-teal" aria-hidden />
              <span>{titleForPhase}</span>
            </h3>
            <ListenControl text={listenText} compact className="shrink-0" />
          </div>
          <MinigameProgress
            current={Math.min(selected.length, interaction.targetCount)}
            total={interaction.targetCount}
            label={language === "es" ? "Señales" : "Signals"}
          />
          {headlineBlock(true)}
          {selected.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {interaction.signals
                .filter((s) => selected.includes(s.id))
                .map((s) => (
                  <li
                    key={s.id}
                    className="rounded-full bg-amber/15 px-2.5 py-1 text-xs font-semibold text-navy"
                  >
                    {s.label[language]}
                  </li>
                ))}
            </ul>
          )}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <button
              type="button"
              data-primary-cta="true"
              disabled={!foundEnough}
              onClick={() => setPhase("decide")}
              className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-teal px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              <CircleHelp className="h-4 w-4" aria-hidden />
              {language === "es" ? "¿Qué significa esto?" : "What does this mean?"}
            </button>
            <button
              type="button"
              onClick={() => setPhase("intercept")}
              className="inline-flex min-h-11 items-center justify-center gap-1.5 px-3 text-sm font-semibold text-navy/60 hover:text-navy sm:ml-auto"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              {language === "es" ? "Atrás" : "Back"}
            </button>
          </div>
        </div>
      )}

      {phase === "decide" && (
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-lg font-bold text-navy">{titleForPhase}</h3>
            <ListenControl text={listenText} compact className="shrink-0" />
          </div>
          <div className="grid gap-2" role="radiogroup" aria-label={titleForPhase}>
            {conclusions.map((c, i) => (
              <button
                key={c.id}
                type="button"
                role="radio"
                aria-checked={choice === c.id}
                disabled={locked}
                onClick={() => submit(c.id)}
                className={`flex min-h-11 cursor-pointer items-start gap-3 rounded-xl border-2 px-3 py-2.5 text-left text-sm font-medium disabled:cursor-not-allowed ${
                  choice === c.id
                    ? "border-teal bg-teal/10"
                    : "border-navy/15 bg-white hover:border-sky"
                }`}
              >
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-navy/5 text-xs font-bold text-navy"
                  aria-hidden
                >
                  {OPTION_LETTERS[i]}
                </span>
                <span className="pt-0.5">{c.label[language]}</span>
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setPhase("check")}
            className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-navy/60 hover:text-navy"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            {language === "es" ? "Atrás" : "Back"}
          </button>
        </div>
      )}

      {phase === "result" && (
        <div className="space-y-3">
          <h3 className="flex items-center gap-2 text-lg font-bold text-navy">
            <Check className="h-5 w-5 text-teal" aria-hidden />
            {titleForPhase}
          </h3>
          <p className="text-sm leading-relaxed text-navy/80">
            {interaction.conclusion?.[language] ??
              (language === "es"
                ? "Urgencia, miedo y órdenes de compartir empujan a reaccionar sin verificar."
                : "Urgency, fear, and share commands push people to react before verifying.")}
          </p>
          <ul className="flex flex-wrap gap-2">
            {interaction.signals.map((s) => (
              <li
                key={s.id}
                className="rounded-full bg-amber/15 px-2.5 py-1 text-xs font-semibold text-navy"
              >
                {s.label[language]}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
