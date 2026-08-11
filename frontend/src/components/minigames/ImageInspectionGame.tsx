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
  ImageInspectionInteraction,
} from "../../types/minigame";
import { riskDetail } from "../../lib/interceptCopy";
import { DemoPhoto } from "./DemoPhoto";
import { ListenControl } from "./ListenControl";

interface Props {
  interaction: ImageInspectionInteraction;
  language: Language;
  onSolved: (result: Omit<ChallengeResult, "durationMs" | "completed">) => void;
  onHint: (hint: string | null) => void;
  onSkip?: () => void;
  mode?: "play" | "review";
  reviewResult?: ChallengeResult | null;
  interceptReason?: string | null;
}

type Phase = "intercept" | "check" | "decide" | "result";
/** User classification for photo-vs-claim checks. */
type Bucket = "in-photo" | "caption-only";

const OPTION_LETTERS = ["A", "B", "C", "D"];

/**
 * Photo-vs-claim (and legacy anomaly mark) check.
 * Pause → Check → Decide: classify what the photo shows vs caption claims,
 * then pick a conclusion.
 */
export function ImageInspectionGame({
  interaction,
  language,
  onSolved,
  onHint,
  onSkip,
  mode = "play",
  reviewResult,
  interceptReason,
}: Props) {
  const photoVsClaim = Boolean(interaction.claim);
  const [phase, setPhase] = useState<Phase>(
    mode === "review" ? "result" : "intercept",
  );
  const [seen, setSeen] = useState<string[]>(
    mode === "review" ? interaction.hotspots.map((h) => h.id) : [],
  );
  const [buckets, setBuckets] = useState<Record<string, Bucket>>(() => {
    if (mode !== "review") return {};
    const init: Record<string, Bucket> = {};
    for (const h of interaction.hotspots) {
      init[h.id] = h.isWarning ? "caption-only" : "in-photo";
    }
    return init;
  });
  const [choice, setChoice] = useState<string | null>(
    reviewResult?.selectedIds.at(-1) ?? null,
  );
  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(mode === "review");

  const correctId =
    interaction.conclusions.find((c) => c.correct)?.id ??
    interaction.conclusions[0]?.id ??
    "";
  const claim =
    interaction.claim?.[language] ??
    (language === "es"
      ? "Esta foto prueba la afirmación del post."
      : "This photo proves the post’s claim.");
  const interceptTitle =
    language === "es"
      ? "Antes de compartir, separa foto y afirmación"
      : "Before you share, separate photo and claim";
  const whyPaused = riskDetail(
    interceptReason?.trim() ||
      interaction.instruction[language] ||
      (language === "es"
        ? "Antes de compartir, compara lo que muestra la foto con lo que afirma el pie."
        : "Before you share, compare what the photo shows with what the caption claims."),
    interceptTitle,
  );

  const allFindings = interaction.hotspots;
  const requiredIds = allFindings.map((h) => h.id);

  const allClassified =
    requiredIds.length === 0 ||
    requiredIds.every((id) => buckets[id] !== undefined);

  const classificationCorrect =
    allClassified &&
    allFindings.every((h) => {
      const expected: Bucket = h.isWarning ? "caption-only" : "in-photo";
      return buckets[h.id] === expected;
    });

  const allSeen =
    requiredIds.length === 0 ||
    requiredIds.every((id) => seen.includes(id));

  const canAdvanceCheck = photoVsClaim ? classificationCorrect : allSeen;

  const setBucket = (id: string, bucket: Bucket) => {
    setBuckets((prev) => ({ ...prev, [id]: bucket }));
    onHint(null);
  };

  const toggleSeen = (id: string) => {
    setSeen((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const tryAdvanceToDecide = () => {
    if (!photoVsClaim) {
      setPhase("decide");
      return;
    }
    if (!allClassified) {
      onHint(
        language === "es"
          ? "Clasifica cada afirmación: ¿está en la foto o solo en el texto?"
          : "Classify each statement: is it in the photo, or only in the caption?",
      );
      return;
    }
    if (!classificationCorrect) {
      onHint(
        language === "es"
          ? "Revisa otra vez: ¿qué se ve en la foto y qué solo afirma el texto?"
          : "Look again: what is visible in the photo, and what does only the caption claim?",
      );
      return;
    }
    onHint(null);
    setPhase("decide");
  };

  const listenText = useMemo(() => {
    if (phase === "intercept") {
      return language === "es"
        ? `Antes de compartir, separa la foto de la afirmación. ${whyPaused} Afirmación: ${claim}`
        : `Before you share, separate the photo from the claim. ${whyPaused} Claim: ${claim}`;
    }
    if (phase === "check") {
      const bits = allFindings.map((h) => h.label[language]).join(". ");
      return language === "es"
        ? `Clasifica cada punto. ${bits}`
        : `Classify each point. ${bits}`;
    }
    if (phase === "decide") {
      const opts = interaction.conclusions
        .map((c, i) => `${OPTION_LETTERS[i]}. ${c.label[language]}`)
        .join(". ");
      return language === "es"
        ? `¿Qué encontraste? ${opts}`
        : `What did you find? ${opts}`;
    }
    return language === "es"
      ? "Buen ojo. Una foto real de un vial no prueba una afirmación de seguridad."
      : "Good catch. A real vial photo does not prove a safety claim.";
  }, [phase, language, whyPaused, claim, allFindings, interaction.conclusions]);

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
        selectedIds: [...Object.keys(buckets), ...seen, id],
        hintsUsed: ok ? 0 : 1,
        signalsFound: photoVsClaim
          ? Object.keys(buckets).length
          : seen.length,
        signalsTotal: interaction.maxMarks,
      });
    } else {
      onHint(
        language === "es"
          ? "La foto muestra un producto. La afirmación de seguridad necesita otra fuente."
          : "The photo shows a product. The safety claim needs a different source.",
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

  const titleForPhase = (() => {
    if (phase === "intercept") {
      return interceptTitle;
    }
    if (phase === "check") {
      return language === "es"
        ? "¿Está en la foto o solo en el texto?"
        : "In the photo — or only in the caption?";
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

  const inPhotoLabel =
    language === "es" ? "Se ve en la foto" : "Visible in the photo";
  const captionOnlyLabel =
    language === "es"
      ? "Solo lo afirma el texto"
      : "Only claimed in the caption";

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
          <div>
            <div className="flex items-start justify-between gap-3">
              <h3 className="flex min-w-0 flex-1 items-start gap-2 text-lg font-bold leading-snug text-navy">
                <ImageIcon
                  className="mt-0.5 h-5 w-5 shrink-0 text-teal"
                  aria-hidden
                />
                <span>{titleForPhase}</span>
              </h3>
              <ListenControl text={listenText} compact className="shrink-0" />
            </div>
            <div className="mt-2 rounded-xl border border-teal/25 bg-teal/[0.06] px-3 py-2.5">
              <p className="flex items-start gap-2 text-sm font-semibold leading-snug text-navy">
                <Sparkles
                  className="mt-0.5 h-4 w-4 shrink-0 text-teal"
                  aria-hidden
                />
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
            assetId={interaction.mediaAssetId}
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
          <div className="flex items-start justify-between gap-3">
            <h3 className="flex min-w-0 flex-1 items-start gap-2 text-lg font-bold leading-snug text-navy">
              <Search className="mt-0.5 h-5 w-5 shrink-0 text-teal" aria-hidden />
              <span>{titleForPhase}</span>
            </h3>
            <ListenControl text={listenText} compact className="shrink-0" />
          </div>
          <p className="text-sm text-navy/65">
            {photoVsClaim
              ? language === "es"
                ? "Para cada punto, elige una opción. Luego elige la conclusión."
                : "For each point, pick one option. Then choose a conclusion."
              : language === "es"
                ? "Toca cada hallazgo para marcarlo. Luego elige qué significa."
                : "Tap each finding to mark it. Then choose what it means."}
          </p>
          <DemoPhoto
            assetId={interaction.mediaAssetId}
            src={interaction.imageSrc}
            alt={interaction.imageAlt[language]}
            eager
          />
          {photoVsClaim && (
            <p className="rounded-xl bg-amber/10 px-3 py-2 text-sm text-navy">
              <span className="font-bold">
                {language === "es" ? "Afirmación del post: " : "Post claim: "}
              </span>
              {claim}
            </p>
          )}

          {photoVsClaim ? (
            <ul
              className="space-y-3"
              aria-label={language === "es" ? "Clasificar" : "Classify"}
            >
              {allFindings.map((h, i) => {
                const selected = buckets[h.id];
                return (
                  <li
                    key={h.id}
                    className="rounded-xl border border-navy/10 bg-white px-3 py-3"
                  >
                    <p className="text-sm font-semibold text-navy">
                      <span className="mr-2 text-navy/70" aria-hidden>
                        {OPTION_LETTERS[i] ?? i + 1}.
                      </span>
                      {h.label[language]}
                    </p>
                    <div
                      className="mt-2 grid gap-2 sm:grid-cols-2"
                      role="radiogroup"
                      aria-label={h.label[language]}
                    >
                      {(
                        [
                          ["in-photo", inPhotoLabel],
                          ["caption-only", captionOnlyLabel],
                        ] as const
                      ).map(([value, label]) => {
                        const active = selected === value;
                        return (
                          <button
                            key={value}
                            type="button"
                            role="radio"
                            aria-checked={active}
                            onClick={() => setBucket(h.id, value)}
                            className={`flex min-h-11 cursor-pointer items-center justify-center rounded-lg border-2 px-3 text-center text-sm font-semibold ${
                              active
                                ? value === "in-photo"
                                  ? "border-teal bg-teal/10 text-navy"
                                  : "border-amber bg-amber/15 text-navy"
                                : "border-navy/15 bg-off-white text-navy/70 hover:border-navy/30"
                            }`}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <ul
              className="space-y-2"
              aria-label={language === "es" ? "Hallazgos" : "Findings"}
            >
              {allFindings.map((h) => {
                const active = seen.includes(h.id);
                return (
                  <li key={h.id}>
                    <button
                      type="button"
                      aria-pressed={active}
                      onClick={() => toggleSeen(h.id)}
                      className={`flex w-full min-h-11 cursor-pointer items-start gap-3 rounded-xl border px-3 py-3 text-left ${
                        active
                          ? h.isWarning
                            ? "border-amber/50 bg-amber/10"
                            : "border-teal/40 bg-teal/[0.06]"
                          : "border-navy/10 bg-white hover:border-teal/30"
                      }`}
                    >
                      <span
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                          active
                            ? h.isWarning
                              ? "border-amber bg-amber text-navy"
                              : "border-teal bg-teal text-white"
                            : "border-navy/20 text-transparent"
                        }`}
                        aria-hidden
                      >
                        <Check className="h-3.5 w-3.5" />
                      </span>
                      <span className="text-sm font-medium text-navy">
                        {h.label[language]}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <button
              type="button"
              data-primary-cta="true"
              disabled={!canAdvanceCheck}
              onClick={tryAdvanceToDecide}
              className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-teal px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              <CircleHelp className="h-4 w-4" aria-hidden />
              {language === "es"
                ? "Elige una conclusión"
                : "Choose a conclusion"}
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
          <p className="rounded-xl bg-amber/10 px-3 py-2 text-sm text-navy">
            {claim}
          </p>
          <div
            className="grid gap-2"
            role="radiogroup"
            aria-label={titleForPhase}
          >
            {interaction.conclusions.map((c, i) => (
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
          <div className="flex items-start justify-between gap-3">
            <h3 className="flex items-center gap-2 text-lg font-bold text-navy">
              <Check className="h-5 w-5 text-teal" aria-hidden />
              {titleForPhase}
            </h3>
            <ListenControl text={listenText} compact className="shrink-0" />
          </div>
          <p className="text-sm leading-relaxed text-navy/80">
            {interaction.conclusion?.[language] ??
              (language === "es"
                ? "La foto es real, pero no prueba la afirmación de seguridad del post."
                : "The photo is real, but it does not prove the post’s safety claim.")}
          </p>
          <p className="text-xs font-medium text-navy/55">
            {language === "es"
              ? "Siguiente: elige si quieres compartir."
              : "Next: choose whether to share."}
          </p>
        </div>
      )}
    </div>
  );
}
