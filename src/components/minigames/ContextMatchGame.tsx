import { useMemo, useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import type { Language } from "../../types";
import type {
  ChallengeResult,
  ContextMatchInteraction,
} from "../../types/minigame";
import { useI18n } from "../../i18n/I18nContext";
import { DemoPhoto } from "./DemoPhoto";
import { NoSourceMediaCard } from "./NoSourceMediaCard";

interface Props {
  interaction: ContextMatchInteraction;
  language: Language;
  onSolved: (result: Omit<ChallengeResult, "durationMs" | "completed">) => void;
  onHint: (hint: string | null) => void;
  mode?: "play" | "review";
  reviewResult?: ChallengeResult | null;
}

type Phase = "claim" | "evidence" | "archive" | "decision" | "feedback";

const DEFAULT_TOOLS: NonNullable<ContextMatchInteraction["tools"]> = [
  {
    id: "source",
    label: { en: "Source", es: "Fuente" },
    summary: {
      en: "No reputable outlet confirms tonight’s local emergency claim. The account is not a known publisher.",
      es: "Ningún medio reputado confirma la emergencia local de esta noche. La cuenta no es un editor conocido.",
    },
  },
  {
    id: "date-location",
    label: { en: "Date and location", es: "Fecha y ubicación" },
    summary: {
      en: "Visible cues and available metadata do not support “tonight” or an unnamed local city.",
      es: "Las pistas visibles y los metadatos disponibles no respaldan “esta noche” ni una ciudad local sin nombre.",
    },
  },
  {
    id: "archive",
    label: { en: "Archive matches", es: "Coincidencias de archivo" },
    summary: {
      en: "Similar frames appear in older archives. Compare date, place and visual details.",
      es: "Aparecen fotogramas similares en archivos más antiguos. Compara fecha, lugar y detalles visuales.",
    },
  },
];

const DEFAULT_CONCLUSIONS = [
  {
    id: "current",
    label: { en: "Current local photo", es: "Foto local actual" },
    correct: false,
  },
  {
    id: "wrong-context",
    label: {
      en: "Authentic photo used in the wrong context",
      es: "Foto auténtica usada en el contexto incorrecto",
    },
    correct: true,
  },
  {
    id: "ai",
    label: {
      en: "Likely AI-generated image",
      es: "Imagen probablemente generada por IA",
    },
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
    mode === "review" ? "feedback" : "claim",
  );
  const [toolId, setToolId] = useState<string>("source");
  const [inspected, setInspected] = useState<Set<string>>(new Set());
  const [selectedCard, setSelectedCard] = useState<string | null>(
    reviewResult?.selectedIds[0] ?? null,
  );
  const [selectedConclusion, setSelectedConclusion] = useState<string | null>(
    reviewResult?.selectedIds[1] ?? null,
  );
  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(mode === "review");

  const tools = interaction.tools ?? DEFAULT_TOOLS;
  const conclusions = interaction.conclusions ?? DEFAULT_CONCLUSIONS;
  const correctCardId = interaction.cards.find((c) => c.correct)?.id;
  const correctConclusionId = conclusions.find((c) => c.correct)?.id;
  const assetId = interaction.mediaAssetId;

  const steps = useMemo(
    () => [
      { id: "claim", label: language === "es" ? "Afirmación" : "Claim" },
      { id: "evidence", label: language === "es" ? "Evidencia" : "Evidence" },
      { id: "decision", label: language === "es" ? "Decisión" : "Decision" },
    ],
    [language],
  );

  const stepIndex =
    phase === "claim" ? 0 : phase === "decision" || phase === "feedback" ? 2 : 1;

  const markTool = (id: string) => {
    setToolId(id);
    setInspected((prev) => new Set(prev).add(id));
    if (id === "archive") setPhase("archive");
  };

  const canAdvanceFromEvidence = inspected.size >= 2;

  const finish = (cardId: string, conclusionId: string) => {
    const ok =
      cardId === correctCardId && conclusionId === correctConclusionId;
    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);
    if (ok || nextAttempts >= interaction.maxAttempts) {
      setLocked(true);
      setPhase("feedback");
      onHint(null);
      onSolved({
        correct: ok,
        score: ok ? 1 : 0,
        attempts: nextAttempts,
        selectedIds: [cardId, conclusionId],
        hintsUsed: ok ? 0 : 1,
      });
    } else {
      onHint(copy.minigame.hintContext);
      setSelectedConclusion(null);
    }
  };

  const question =
    interaction.claimQuestion?.[language] ??
    (language === "es"
      ? "¿Esta foto es realmente de esta noche?"
      : "Is this photo really from tonight?");

  return (
    <div className="space-y-4">
      <ol className="flex flex-wrap gap-2" aria-label="Progress">
        {steps.map((s, i) => (
          <li
            key={s.id}
            className={`inline-flex min-h-9 items-center rounded-lg px-2.5 text-xs font-semibold ${
              i === stepIndex
                ? "bg-teal/15 text-teal"
                : i < stepIndex
                  ? "bg-navy/5 text-navy/60"
                  : "bg-off-white text-navy/35"
            }`}
          >
            {i + 1}. {s.label}
          </li>
        ))}
      </ol>

      {(phase === "claim" || phase === "feedback") && (
        <div className={phase === "feedback" ? "lg:grid lg:grid-cols-[55%_1fr] lg:gap-5" : "space-y-3"}>
          <div className="space-y-3">
            <h4 className="text-base font-semibold text-navy">{question}</h4>
            {interaction.postBody && (
              <p className="rounded-lg border border-navy/10 bg-white px-3 py-2 text-sm text-navy/80">
                {interaction.postBody[language]}
              </p>
            )}
            <p className="rounded-lg bg-amber/10 px-3 py-2 text-sm font-medium text-navy">
              {interaction.claim[language]}
            </p>
              <DemoPhoto
                assetId={assetId}
                src={interaction.imageSrc}
                alt={interaction.imageAlt[language]}
                showArchiveBadge={phase === "feedback"}
                eager
              />
          </div>

          {phase === "claim" && (
            <button
              type="button"
              onClick={() => setPhase("evidence")}
              className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-teal px-4 text-sm font-semibold text-white sm:w-auto"
            >
              {language === "es" ? "Revisar esta imagen" : "Check this image"}
            </button>
          )}

          {phase === "feedback" && (
            <div className="space-y-3 rounded-xl bg-off-white p-3">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="rounded-lg bg-amber/20 px-2 py-1 font-medium">
                  {interaction.revealClaimed[language]}
                </span>
                <ArrowRight className="h-4 w-4 text-teal" aria-hidden />
                <span className="rounded-lg bg-teal/15 px-2 py-1 font-medium">
                  {interaction.revealOriginal[language]}
                </span>
              </div>
              {selectedCard && (
                <p className="text-sm text-navy/70">
                  {interaction.cards.find((c) => c.id === selectedCard)?.findings?.[
                    language
                  ] ??
                    interaction.cards.find((c) => c.id === selectedCard)?.detail[
                      language
                    ]}
                </p>
              )}
              <p className="font-semibold text-navy">
                {interaction.conclusion?.[language] ??
                  conclusions.find((c) => c.id === selectedConclusion)?.label[
                    language
                  ]}
              </p>
            </div>
          )}
        </div>
      )}

      {(phase === "evidence" || phase === "archive") && (
        <div className="space-y-3 lg:grid lg:grid-cols-[55%_1fr] lg:gap-5 lg:space-y-0">
          <DemoPhoto
            assetId={assetId}
            src={interaction.imageSrc}
            alt={interaction.imageAlt[language]}
          />
          <div className="space-y-3">
            <p className="text-sm font-medium text-navy">
              {language === "es"
                ? "Inspecciona al menos dos herramientas"
                : "Inspect at least two tools"}
            </p>
            <div className="flex flex-wrap gap-2" role="tablist">
              {tools.map((tool) => (
                <button
                  key={tool.id}
                  type="button"
                  role="tab"
                  aria-selected={toolId === tool.id}
                  onClick={() => markTool(tool.id)}
                  className={`inline-flex min-h-11 items-center gap-1.5 rounded-xl border px-3 text-sm font-semibold ${
                    toolId === tool.id
                      ? "border-teal bg-teal/10 text-teal"
                      : "border-navy/10 text-navy/70"
                  }`}
                >
                  {inspected.has(tool.id) && (
                    <Check className="h-3.5 w-3.5" aria-hidden />
                  )}
                  {tool.label[language]}
                </button>
              ))}
            </div>
            {toolId !== "archive" && (
              <div className="rounded-xl border border-amber/25 bg-amber/10 p-3 text-sm text-navy">
                {tools.find((t) => t.id === toolId)?.summary[language]}
              </div>
            )}
            {phase === "archive" && (
              <ul className="grid gap-2">
                {interaction.cards.map((card) => (
                  <li key={card.id}>
                    <button
                      type="button"
                      disabled={locked}
                      onClick={() => setSelectedCard(card.id)}
                      className={`w-full rounded-xl border-2 p-2 text-left transition ${
                        selectedCard === card.id
                          ? "border-teal bg-teal/10"
                          : "border-navy/10 bg-white hover:border-sky"
                      }`}
                    >
                      {card.noImage || !card.mediaAssetId ? (
                        <NoSourceMediaCard className="mb-2 aspect-[16/7] min-h-0" />
                      ) : (
                        <DemoPhoto
                          assetId={card.mediaAssetId}
                          src={card.thumbSrc}
                          alt=""
                          className="mb-2 aspect-[16/7]"
                        />
                      )}
                      <p className="text-sm font-semibold text-navy">
                        {card.label[language]}
                      </p>
                      <p className="text-xs text-navy/55">
                        {card.date?.[language]} · {card.location?.[language]}
                      </p>
                      <p className="text-xs text-navy/45">
                        {card.medium?.[language]}
                      </p>
                      {card.findings && (
                        <p className="mt-1 text-xs text-navy/60">
                          {card.findings[language]}
                        </p>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex flex-wrap gap-2">
              {phase === "evidence" && toolId === "archive" && (
                <button
                  type="button"
                  onClick={() => setPhase("archive")}
                  className="inline-flex min-h-11 items-center rounded-xl bg-navy px-4 text-sm font-semibold text-white"
                >
                  {language === "es"
                    ? "Comparar archivos"
                    : "Compare archives"}
                </button>
              )}
              {canAdvanceFromEvidence && selectedCard && (
                <button
                  type="button"
                  onClick={() => setPhase("decision")}
                  className="inline-flex min-h-11 items-center rounded-xl bg-teal px-4 text-sm font-semibold text-white"
                >
                  {language === "es" ? "Continuar a decidir" : "Continue to decide"}
                </button>
              )}
              {canAdvanceFromEvidence && !selectedCard && phase === "archive" && (
                <p className="text-xs text-navy/50">
                  {language === "es"
                    ? "Selecciona un resultado de archivo."
                    : "Select an archive result."}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {phase === "decision" && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-navy">
            {language === "es" ? "Elige una conclusión" : "Choose a conclusion"}
          </p>
          <ul className="space-y-2">
            {conclusions.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  disabled={locked}
                  onClick={() => setSelectedConclusion(c.id)}
                  className={`min-h-11 w-full rounded-xl border-2 px-3 py-2 text-left text-sm font-medium ${
                    selectedConclusion === c.id
                      ? "border-teal bg-teal/10"
                      : "border-navy/10 bg-white"
                  }`}
                >
                  {c.label[language]}
                </button>
              </li>
            ))}
          </ul>
          {selectedCard && selectedConclusion && !locked && (
            <button
              type="button"
              onClick={() => finish(selectedCard, selectedConclusion)}
              className="inline-flex min-h-11 items-center rounded-xl bg-navy px-4 text-sm font-semibold text-white"
            >
              {copy.minigame.check}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
