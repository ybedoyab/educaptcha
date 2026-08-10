import { useMemo, useState } from "react";
import {
  ArrowLeft,
  BarChart3,
  Check,
  CircleHelp,
  Share2,
  Sparkles,
} from "lucide-react";
import type { Language } from "../../types";
import type {
  ChallengeResult,
  ChartRepairInteraction,
} from "../../types/minigame";
import { ListenControl } from "./ListenControl";

interface Props {
  interaction: ChartRepairInteraction;
  language: Language;
  onSolved: (result: Omit<ChallengeResult, "durationMs" | "completed">) => void;
  onHint?: (hint: string | null) => void;
  onSkip?: () => void;
  lockedAt?: number;
  interceptReason?: string | null;
  mode?: "play" | "review";
}

type Phase = "intercept" | "check" | "decide" | "result";

const OPTION_LETTERS = ["A", "B", "C"];

const DEFAULT_CONCLUSIONS = [
  {
    id: "exaggerate",
    label: {
      en: "A truncated axis made a small change look huge",
      es: "Un eje truncado hizo que un cambio pequeño se viera enorme",
    },
    correct: true,
  },
  {
    id: "boom",
    label: {
      en: "Engagement really exploded overnight",
      es: "El engagement realmente explotó de la noche a la mañana",
    },
    correct: false,
  },
  {
    id: "broken",
    label: {
      en: "The chart numbers themselves are fake",
      es: "Los nÃƒÂºmeros de la gráfica son falsos",
    },
    correct: false,
  },
];

/** Misleading-chart pause: fix the axis, then say what the trick was. */
export function ChartRepairGame({
  interaction,
  language,
  onSolved,
  onHint,
  onSkip,
  lockedAt,
  interceptReason,
  mode = "play",
}: Props) {
  const [phase, setPhase] = useState<Phase>(
    mode === "review" || lockedAt !== undefined ? "result" : "intercept",
  );
  const [axisStart, setAxisStart] = useState(
    lockedAt !== undefined ? lockedAt : interaction.axisStart,
  );
  const [repaired, setRepaired] = useState(lockedAt !== undefined);
  const [choice, setChoice] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(
    mode === "review" || lockedAt !== undefined,
  );

  const conclusions =
    interaction.conclusions && interaction.conclusions.length > 0
      ? interaction.conclusions
      : DEFAULT_CONCLUSIONS;
  const correctId = conclusions.find((c) => c.correct)?.id ?? "exaggerate";
  const claim =
    interaction.claim?.[language] ??
    (language === "es"
      ? "El engagement explotó Ã¢â‚¬â€ mira la gráfica."
      : "Engagement exploded Ã¢â‚¬â€ look at the chart.");
  const whyPaused =
    interceptReason?.trim() ||
    interaction.instruction[language] ||
    (language === "es"
      ? "Antes de compartir, revisa cómo está escalada esta gráfica."
      : "Before you share, check how this chart is scaled.");

  const nearTarget =
    Math.abs(axisStart - interaction.targetStart) <= interaction.tolerance;

  const currentStart = axisStart;
  const maxVal = interaction.axisEnd;
  const span = Math.max(maxVal - currentStart, 1);
  const bars = useMemo(() => {
    return interaction.series.map((s) => {
      const height = ((s.value - currentStart) / span) * 100;
      return { ...s, height: Math.max(4, Math.min(100, height)) };
    });
  }, [interaction.series, currentStart, span]);
  const ticks = [currentStart, Math.round((currentStart + maxVal) / 2), maxVal];

  const listenText = useMemo(() => {
    if (phase === "intercept") {
      return language === "es"
        ? `Antes de compartir, revisa la gráfica. ${whyPaused} Afirmación: ${claim}`
        : `Before you share, check the chart. ${whyPaused} Claim: ${claim}`;
    }
    if (phase === "check") {
      return language === "es"
        ? "Arrastra el inicio del eje hacia cero y aplica la escala."
        : "Drag the axis start toward zero, then apply the scale.";
    }
    if (phase === "decide") {
      return language === "es"
        ? "¿Qué hacía el eje truncado?"
        : "What did the truncated axis do?";
    }
    return interaction.successMessage[language];
  }, [phase, language, whyPaused, claim, interaction.successMessage]);

  const applyScale = () => {
    if (!nearTarget) {
      onHint?.(
        language === "es"
          ? "Acerca el inicio del eje a 0 para restaurar la proporción."
          : "Move the axis start closer to 0 to restore proportion.",
      );
      return;
    }
    setAxisStart(interaction.targetStart);
    setRepaired(true);
    onHint?.(null);
    setPhase("decide");
  };

  const submit = (id: string) => {
    const ok = id === correctId;
    const next = attempts + 1;
    setAttempts(next);
    setChoice(id);
    if (ok || next >= interaction.maxAttempts) {
      setLocked(true);
      setPhase("result");
      onSolved({
        correct: ok && repaired,
        score: ok && repaired ? 1 : 0,
        attempts: next,
        selectedIds: ["axis-repaired", id],
        hintsUsed: ok ? 0 : 1,
      });
    } else {
      onHint?.(
        language === "es"
          ? "Compara cómo se ve el salto con el eje cerca de cero."
          : "Compare how big the jump looks with the axis near zero.",
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
        ? "Antes de compartir, revisa la gráfica"
        : "Before you share, check the chart"
      : phase === "check"
        ? language === "es"
          ? "Repara el eje vertical"
          : "Repair the vertical axis"
        : phase === "decide"
          ? language === "es"
            ? "¿Qué encontraste?"
            : "What did you find?"
          : choice === correctId
            ? language === "es"
              ? "Buen ojo"
              : "Good catch"
            : language === "es"
              ? "Casi"
              : "Close";

  const chartPanel = (
    <div className="rounded-xl border border-navy/10 bg-off-white p-4">
      <div className="mb-2 flex justify-between text-xs font-semibold text-navy/70">
        <span>
          {repaired || nearTarget
            ? language === "es"
              ? "Escala más completa"
              : "Fuller scale"
            : language === "es"
              ? "Eje truncado (engañoso)"
              : "Truncated axis (misleading)"}
        </span>
        <span>
          {language === "es" ? "Inicio" : "Start"}: {Math.round(currentStart)}
        </span>
      </div>
      <div className="flex gap-2">
        <div className="relative h-40 w-8 shrink-0">
          {ticks.map((t, i) => (
            <span
              key={`${t}-${i}`}
              className="absolute right-0 translate-y-1/2 text-[0.65rem] leading-none text-navy/70"
              style={{ bottom: `${((t - currentStart) / span) * 100}%` }}
            >
              {t}
            </span>
          ))}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex h-40 gap-6 border-b border-l border-navy/20 px-3">
            {bars.map((bar) => (
              <div key={bar.id} className="flex flex-1 items-end justify-center">
                <div
                  className="w-full max-w-16 rounded-t-md bg-gradient-to-t from-teal to-sky transition-[height] duration-150"
                  style={{ height: `${bar.height}%` }}
                  data-testid="chart-bar"
                />
              </div>
            ))}
          </div>
          <div className="flex gap-6 px-3 pt-1">
            {bars.map((bar) => (
              <div
                key={bar.id}
                className="flex flex-1 flex-col items-center gap-0.5"
              >
                <span className="text-xs text-navy/60">
                  {bar.label[language]}
                </span>
                <span className="text-[0.65rem] font-semibold text-navy">
                  {bar.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
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
              <BarChart3 className="mt-0.5 h-5 w-5 shrink-0 text-teal" aria-hidden />
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
                : "ThatÃ¢â‚¬â„¢s why you need to complete this check before sharing."}
            </p>
          </div>
          <p className="rounded-xl bg-amber/10 px-3 py-2.5 text-sm font-medium text-navy">
            {claim}
          </p>
          {chartPanel}
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              data-primary-cta="true"
              onClick={() => setPhase("check")}
              className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-teal px-4 text-sm font-semibold text-white"
            >
              <BarChart3 className="h-4 w-4" aria-hidden />
              {language === "es" ? "Revisar gráfica" : "Check chart"}
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
              <BarChart3 className="mt-0.5 h-5 w-5 shrink-0 text-teal" aria-hidden />
              <span>{titleForPhase}</span>
            </h3>
            <ListenControl text={listenText} compact className="shrink-0" />
          </div>
          <p className="text-sm text-navy/65">
            {language === "es"
              ? "El eje empieza cerca de 88, así que un salto pequeño se ve enorme. Arrástralo hacia 0."
              : "The axis starts near 88, so a small jump looks huge. Drag it toward 0."}
          </p>
          {chartPanel}
          <label className="block">
            <span className="text-xs font-semibold text-navy/60">
              {language === "es" ? "Inicio del eje" : "Axis start"}:{" "}
              {Math.round(axisStart)}
            </span>
            <input
              type="range"
              min={0}
              max={interaction.axisStart}
              step={1}
              value={axisStart}
              onChange={(e) => setAxisStart(Number(e.target.value))}
              className="mt-2 w-full cursor-pointer accent-teal"
              aria-valuemin={0}
              aria-valuemax={interaction.axisStart}
              aria-valuenow={axisStart}
            />
          </label>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <button
              type="button"
              data-primary-cta="true"
              onClick={applyScale}
              className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-teal px-4 text-sm font-semibold text-white"
            >
              <CircleHelp className="h-4 w-4" aria-hidden />
              {language === "es" ? "Aplicar escala" : "Apply scale"}
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
          <p className="rounded-xl bg-teal/10 px-3 py-2 text-sm text-navy">
            {interaction.successMessage[language]}
          </p>
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
              interaction.successMessage[language]}
          </p>
          {chartPanel}
        </div>
      )}
    </div>
  );
}
