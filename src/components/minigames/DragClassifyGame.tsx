import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { useDroppable } from "@dnd-kit/core";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Check } from "lucide-react";
import type { Language } from "../../types";
import type {
  ChallengeResult,
  DragClassifyInteraction,
} from "../../types/minigame";
import { useI18n } from "../../i18n/I18nContext";

interface Props {
  interaction: DragClassifyInteraction;
  language: Language;
  onSolved: (result: Omit<ChallengeResult, "durationMs" | "completed">) => void;
  onHint: (hint: string | null) => void;
}

function DraggableCard({
  id,
  label,
  selected,
  onSelect,
  placed,
}: {
  id: string;
  label: string;
  selected: boolean;
  onSelect: () => void;
  placed: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id, disabled: placed });
  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <button
      ref={setNodeRef}
      type="button"
      style={style}
      {...listeners}
      {...attributes}
      onClick={onSelect}
      disabled={placed}
      className={`min-h-11 rounded-xl border px-3 py-2 text-left text-sm font-medium transition ${
        placed
          ? "hidden"
          : selected
            ? "border-teal bg-teal/10 text-navy"
            : "border-navy/15 bg-white text-navy hover:border-teal/50"
      }`}
    >
      {label}
    </button>
  );
}

function DropZone({
  id,
  label,
  active,
  children,
  onActivate,
}: {
  id: string;
  label: string;
  active: boolean;
  children: React.ReactNode;
  onActivate: () => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <button
      ref={setNodeRef}
      type="button"
      onClick={onActivate}
      className={`min-h-28 w-full rounded-xl border-2 border-dashed p-3 text-left transition ${
        isOver || active
          ? "border-teal bg-teal/10"
          : "border-navy/20 bg-off-white"
      }`}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-navy/55">
        {label}
      </p>
      <div className="mt-2 flex flex-wrap gap-2">{children}</div>
    </button>
  );
}

export function DragClassifyGame({
  interaction,
  language,
  onSolved,
  onHint,
}: Props) {
  const { copy } = useI18n();
  const [placements, setPlacements] = useState<Record<string, string>>({});
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [rebuild, setRebuild] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 8 } }),
    useSensor(KeyboardSensor),
  );

  const requiredItems = useMemo(
    () => interaction.items.filter((i) => i.correctZoneId !== null),
    [interaction.items],
  );

  const place = (itemId: string, zoneId: string) => {
    const item = interaction.items.find((i) => i.id === itemId);
    if (!item) return;

    if (item.correctZoneId === null || item.correctZoneId !== zoneId) {
      const nextAttempts = attempts + 1;
      setAttempts(nextAttempts);
      onHint(interaction.wrongHint[language]);
      setSelectedItem(null);
      if (nextAttempts >= interaction.maxAttempts) {
        // auto-complete remaining correctly for learning after max attempts fail path
        const auto: Record<string, string> = { ...placements };
        requiredItems.forEach((r) => {
          if (r.correctZoneId) auto[r.id] = r.correctZoneId;
        });
        setPlacements(auto);
        setRebuild(true);
        onSolved({
          correct: false,
          score: 0,
          attempts: nextAttempts,
          selectedIds: Object.keys(auto),
          hintsUsed: 1,
        });
      }
      return;
    }

    const next = { ...placements, [itemId]: zoneId };
    setPlacements(next);
    setSelectedItem(null);
    onHint(null);

    const done = requiredItems.every((r) => next[r.id] === r.correctZoneId);
    if (done) {
      setRebuild(true);
      onSolved({
        correct: true,
        score: 1,
        attempts: attempts + 1,
        selectedIds: Object.keys(next),
        hintsUsed: attempts > 0 ? 1 : 0,
      });
    }
  };

  const onDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;
    place(String(active.id), String(over.id));
  };

  const unplaced = interaction.items.filter((i) => !placements[i.id]);

  return (
    <div className="space-y-3">
      <p className="rounded-xl bg-navy/5 px-3 py-2 text-sm text-navy/80">
        {interaction.prompt[language]}
      </p>
      <p className="text-xs text-navy/50">{copy.minigame.dragA11y}</p>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={(e) => setActiveId(String(e.active.id))}
        onDragEnd={onDragEnd}
        onDragCancel={() => setActiveId(null)}
      >
        <div className="grid gap-2 sm:grid-cols-2">
          {unplaced.map((item) => (
            <DraggableCard
              key={item.id}
              id={item.id}
              label={item.label[language]}
              selected={selectedItem === item.id}
              placed={Boolean(placements[item.id])}
              onSelect={() =>
                setSelectedItem((prev) => (prev === item.id ? null : item.id))
              }
            />
          ))}
        </div>

        <div className={`grid gap-3 ${interaction.zones.length > 2 ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
          {interaction.zones.map((zone) => (
            <DropZone
              key={zone.id}
              id={zone.id}
              label={zone.label[language]}
              active={Boolean(selectedItem)}
              onActivate={() => {
                if (selectedItem) place(selectedItem, zone.id);
              }}
            >
              {interaction.items
                .filter((i) => placements[i.id] === zone.id)
                .map((i) => (
                  <span
                    key={i.id}
                    className="inline-flex items-center gap-1 rounded-lg bg-teal/15 px-2 py-1 text-xs font-semibold text-navy animate-check-pop"
                  >
                    <Check className="h-3 w-3 text-teal" aria-hidden />
                    {i.label[language]}
                  </span>
                ))}
            </DropZone>
          ))}
        </div>

        <DragOverlay>
          {activeId ? (
            <div className="rounded-xl border border-teal bg-white px-3 py-2 text-sm font-medium shadow-lg">
              {interaction.items.find((i) => i.id === activeId)?.label[language]}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {rebuild && interaction.rebuild && (
        <div className="animate-slide-up rounded-xl border border-navy/10 p-3">
          <p className="text-xs font-semibold uppercase text-navy/50">
            {copy.minigame.rebuild}
          </p>
          <div className="mt-2 space-y-1">
            {interaction.rebuild.infoIds.map((id) => (
              <p key={id} className="rounded-lg bg-sky/10 px-2 py-1.5 text-sm text-navy">
                {interaction.items.find((i) => i.id === id)?.label[language]}
              </p>
            ))}
            {interaction.rebuild.pressureIds.map((id) => (
              <p
                key={id}
                className="rounded-lg bg-amber/15 px-2 py-1.5 text-sm font-medium text-navy"
              >
                {interaction.items.find((i) => i.id === id)?.label[language]}
              </p>
            ))}
            <p className="rounded-lg border border-dashed border-navy/20 px-2 py-3 text-xs text-navy/40">
              {copy.minigame.missingData}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
