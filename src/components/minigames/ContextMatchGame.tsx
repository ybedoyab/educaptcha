import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { Language } from "../../types";
import type {
  ChallengeResult,
  ContextMatchInteraction,
} from "../../types/minigame";
import { useI18n } from "../../i18n/I18nContext";
import { ArrowRight } from "lucide-react";
import { DemoPhoto } from "./DemoPhoto";

interface Props {
  interaction: ContextMatchInteraction;
  language: Language;
  onSolved: (result: Omit<ChallengeResult, "durationMs" | "completed">) => void;
  onHint: (hint: string | null) => void;
}

export function ContextMatchGame({
  interaction,
  language,
  onSolved,
  onHint,
}: Props) {
  const { copy } = useI18n();
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [matched, setMatched] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 120, tolerance: 8 },
    }),
    useSensor(KeyboardSensor),
  );

  const correctId = interaction.cards.find((c) => c.correct)?.id;

  const tryMatch = (cardId: string) => {
    const ok = cardId === correctId;
    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);
    if (ok || nextAttempts >= interaction.maxAttempts) {
      setMatched(true);
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

  const { setNodeRef: setDropRef, isOver } = useDroppable({ id: "photo-drop" });
  const {
    attributes,
    listeners,
    setNodeRef: setDragRef,
    transform,
    isDragging,
  } = useDraggable({ id: "photo-token" });

  const onDragEnd = (e: DragEndEvent) => {
    setActiveId(null);
    if (e.over && selectedCard) tryMatch(selectedCard);
  };

  return (
    <div className="space-y-3">
      <p className="rounded-lg bg-amber/10 px-3 py-2 text-sm font-medium text-navy">
        {interaction.claim[language]}
      </p>

      <DndContext
        sensors={sensors}
        onDragStart={(e) => setActiveId(String(e.active.id))}
        onDragEnd={onDragEnd}
        onDragCancel={() => setActiveId(null)}
      >
        <div
          ref={setDropRef}
          className={`rounded-xl border-2 ${
            isOver ? "border-teal" : "border-transparent"
          }`}
        >
          <DemoPhoto
            src={interaction.imageSrc}
            alt={interaction.imageAlt[language]}
          />
        </div>

        <button
          ref={setDragRef}
          type="button"
          style={{
            transform: CSS.Translate.toString(transform),
            opacity: isDragging ? 0.5 : 1,
          }}
          {...listeners}
          {...attributes}
          className="inline-flex min-h-11 items-center rounded-xl border border-teal bg-teal/10 px-3 text-sm font-semibold text-navy"
        >
          {copy.minigame.dragPhoto}
        </button>

        <ul className="grid gap-2 sm:grid-cols-3">
          {interaction.cards.map((card) => (
            <li key={card.id}>
              <button
                type="button"
                onClick={() => setSelectedCard(card.id)}
                className={`min-h-24 w-full rounded-xl border-2 p-3 text-left transition ${
                  selectedCard === card.id
                    ? "border-teal bg-teal/10"
                    : "border-navy/10 bg-white hover:border-sky"
                } ${matched && card.correct ? "ring-2 ring-teal" : ""}`}
              >
                <p className="text-sm font-semibold text-navy">
                  {card.label[language]}
                </p>
                <p className="mt-1 text-xs text-navy/55">
                  {card.detail[language]}
                </p>
              </button>
            </li>
          ))}
        </ul>
        <p className="text-xs text-navy/50">{copy.minigame.contextA11y}</p>

        <DragOverlay>
          {activeId ? (
            <div className="rounded-xl bg-teal px-3 py-2 text-sm font-semibold text-white shadow-lg">
              {copy.minigame.dragPhoto}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {selectedCard && !matched && (
        <button
          type="button"
          onClick={() => tryMatch(selectedCard)}
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-navy px-4 text-sm font-semibold text-white"
        >
          {copy.minigame.confirmMatch}
        </button>
      )}

      {matched && (
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
        </div>
      )}
    </div>
  );
}
