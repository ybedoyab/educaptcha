import { useMemo, useState } from "react";
import { ArrowRight, Search, ZoomIn } from "lucide-react";
import type { Language } from "../../types";
import type {
  ChallengeResult,
  ContextMatchInteraction,
} from "../../types/minigame";
import { useI18n } from "../../i18n/I18nContext";
import { DemoPhoto } from "./DemoPhoto";

interface Props {
  interaction: ContextMatchInteraction;
  language: Language;
  onSolved: (result: Omit<ChallengeResult, "durationMs" | "completed">) => void;
  onHint: (hint: string | null) => void;
}

type Phase = "claim" | "tools" | "archive" | "conclusion";

const DEFAULT_TOOLS: NonNullable<ContextMatchInteraction["tools"]> = [
  {
    id: "source",
    label: { en: "Source", es: "Fuente" },
    summary: {
      en: "No reputable outlet confirms tonight’s local emergency claim.",
      es: "Ningún medio reputado confirma la emergencia local de esta noche.",
    },
  },
  {
    id: "date-location",
    label: { en: "Date and location", es: "Fecha y ubicación" },
    summary: {
      en: "Visible cues and metadata point away from “tonight” and the claimed city.",
      es: "Pistas visibles y metadatos no coinciden con “esta noche” ni con la ciudad afirmada.",
    },
  },
  {
    id: "archive",
    label: { en: "Archive matches", es: "Coincidencias de archivo" },
    summary: {
      en: "Similar frames appear in older archives. Compare details carefully.",
      es: "Aparecen fotogramas similares en archivos más antiguos. Compara los detalles.",
    },
  },
];

export function ContextMatchGame({
  interaction,
  language,
  onSolved,
  onHint,
}: Props) {
  const { copy } = useI18n();
  const [phase, setPhase] = useState<Phase>("claim");
  const [toolId, setToolId] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [zoomId, setZoomId] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [matched, setMatched] = useState(false);

  const tools = interaction.tools ?? DEFAULT_TOOLS;
  const correctId = interaction.cards.find((c) => c.correct)?.id;
  const conclusion =
    interaction.conclusion?.[language] ??
    (language === "es"
      ? "Imagen auténtica, contexto incorrecto."
      : "Authentic image, incorrect context.");

  const activeTool = useMemo(
    () => tools.find((t) => t.id === toolId),
    [tools, toolId],
  );

  const tryMatch = (cardId: string) => {
    const ok = cardId === correctId;
    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);
    if (ok || nextAttempts >= interaction.maxAttempts) {
      setMatched(true);
      setPhase("conclusion");
      onHint(null);
      onSolved({
        correct: ok,
        score: ok ? 1 : 0,
        attempts: nextAttempts,
        selectedIds: [cardId],
        hintsUsed: ok ? 0 : 1,
      });
    } else {
      onHint(copy.minigame.hintContext);
      setSelectedCard(null);
    }
  };

  return (
    <div className="space-y-3">
      {phase === "claim" && (
        <div className="space-y-3">
          {interaction.postBody && (
            <p className="rounded-lg border border-navy/10 bg-white px-3 py-2 text-sm text-navy/80">
              {interaction.postBody[language]}
            </p>
          )}
          <p className="rounded-lg bg-amber/10 px-3 py-2 text-sm font-medium text-navy">
            {interaction.claim[language]}
          </p>
          <DemoPhoto
            src={interaction.imageSrc}
            alt={interaction.imageAlt[language]}
          />
          <button
            type="button"
            onClick={() => setPhase("tools")}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-teal px-4 text-sm font-semibold text-white sm:w-auto"
          >
            <Search className="h-4 w-4" aria-hidden />
            {copy.minigame.inspectEvidence}
          </button>
        </div>
      )}

      {phase === "tools" && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-navy">
            {copy.minigame.chooseTool}
          </p>
          <ul className="grid gap-2 sm:grid-cols-3">
            {tools.map((tool) => (
              <li key={tool.id}>
                <button
                  type="button"
                  onClick={() => {
                    setToolId(tool.id);
                    if (tool.id === "archive") setPhase("archive");
                  }}
                  className={`min-h-20 w-full rounded-xl border-2 p-3 text-left transition ${
                    toolId === tool.id
                      ? "border-teal bg-teal/10"
                      : "border-navy/10 bg-white hover:border-sky"
                  }`}
                >
                  <p className="text-sm font-semibold text-navy">
                    {tool.label[language]}
                  </p>
                </button>
              </li>
            ))}
          </ul>
          {activeTool && activeTool.id !== "archive" && (
            <div className="rounded-xl border border-amber/30 bg-amber/10 p-3 text-sm text-navy">
              <p>{activeTool.summary[language]}</p>
              <button
                type="button"
                onClick={() => setPhase("archive")}
                className="mt-3 inline-flex min-h-11 items-center rounded-xl bg-navy px-4 text-sm font-semibold text-white"
              >
                {copy.minigame.viewArchive}
              </button>
            </div>
          )}
        </div>
      )}

      {(phase === "archive" || phase === "conclusion") && (
        <div className="space-y-3">
          <div className="relative overflow-hidden rounded-xl">
            <DemoPhoto
              src={interaction.imageSrc}
              alt={interaction.imageAlt[language]}
            />
            {interaction.zoomTargets?.length ? (
              <div className="absolute inset-0">
                {interaction.zoomTargets.map((z) => (
                  <button
                    key={z.id}
                    type="button"
                    aria-label={z.label[language]}
                    onClick={() =>
                      setZoomId((id) => (id === z.id ? null : z.id))
                    }
                    style={{
                      left: `${z.x}%`,
                      top: `${z.y}%`,
                      width: `${z.w}%`,
                      height: `${z.h}%`,
                    }}
                    className={`absolute rounded-md border-2 transition ${
                      zoomId === z.id
                        ? "border-amber bg-amber/20"
                        : "border-white/70 bg-navy/10 hover:bg-amber/15"
                    }`}
                  >
                    <ZoomIn className="absolute right-0.5 top-0.5 h-3.5 w-3.5 text-white drop-shadow" />
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          {zoomId && (
            <p className="rounded-lg bg-sky/10 px-3 py-2 text-xs text-navy" aria-live="polite">
              {interaction.zoomTargets?.find((z) => z.id === zoomId)?.label[language]}
            </p>
          )}

          <p className="text-sm font-medium text-navy">
            {copy.minigame.compareArchives}
          </p>
          <ul className="grid gap-2 sm:grid-cols-3">
            {interaction.cards.map((card) => (
              <li key={card.id}>
                <button
                  type="button"
                  disabled={matched}
                  onClick={() => setSelectedCard(card.id)}
                  className={`min-h-28 w-full rounded-xl border-2 p-2 text-left transition ${
                    selectedCard === card.id
                      ? "border-teal bg-teal/10"
                      : "border-navy/10 bg-white hover:border-sky"
                  } ${matched && card.correct ? "ring-2 ring-teal" : ""}`}
                >
                  {card.thumbSrc ? (
                    <img
                      src={card.thumbSrc}
                      alt=""
                      className="mb-2 h-16 w-full rounded-lg object-cover"
                    />
                  ) : (
                    <div
                      className="mb-2 h-16 w-full rounded-lg bg-navy/5"
                      aria-hidden
                    />
                  )}
                  <p className="text-sm font-semibold text-navy">
                    {card.label[language]}
                  </p>
                  <p className="mt-1 text-xs text-navy/55">
                    {card.date?.[language] ?? card.detail[language]}
                  </p>
                  {card.location && (
                    <p className="text-xs text-navy/55">
                      {card.location[language]}
                    </p>
                  )}
                  {card.medium && (
                    <p className="text-xs text-navy/45">{card.medium[language]}</p>
                  )}
                  {card.matchLevel && (
                    <p className="mt-1 text-[11px] font-medium text-amber">
                      {card.matchLevel[language]}
                    </p>
                  )}
                </button>
              </li>
            ))}
          </ul>
          <p className="text-xs text-navy/50">{copy.minigame.contextA11y}</p>

          {selectedCard && !matched && (
            <button
              type="button"
              onClick={() => tryMatch(selectedCard)}
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-navy px-4 text-sm font-semibold text-white"
            >
              {copy.minigame.confirmMatch}
            </button>
          )}
        </div>
      )}

      {phase === "conclusion" && matched && (
        <div className="animate-slide-up space-y-2 rounded-xl bg-off-white p-3 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-lg bg-amber/20 px-2 py-1 font-medium">
              {interaction.revealClaimed[language]}
            </span>
            <ArrowRight className="h-4 w-4 text-teal" aria-hidden />
            <span className="rounded-lg bg-teal/15 px-2 py-1 font-medium">
              {interaction.revealOriginal[language]}
            </span>
          </div>
          <p className="font-semibold text-navy">{conclusion}</p>
        </div>
      )}
    </div>
  );
}
