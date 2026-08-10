import { useEffect, useMemo, useRef, useState } from "react";
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
import { Check, GripVertical } from "lucide-react";
import type { Language } from "../../types";
import type {
  ChallengeResult,
  DragClassifyInteraction,
} from "../../types/minigame";
import { useI18n } from "../../i18n/I18nContext";

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
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-testid={`drag-card-${id}`}
      data-selected={selected ? "true" : "false"}
      className={`group flex min-h-11 w-full items-stretch overflow-hidden rounded-xl border-2 transition ${
        placed
          ? "hidden"
          : selected
            ? "border-teal bg-teal/15 text-navy shadow-md ring-2 ring-teal/30"
            : "border-navy/15 bg-white text-navy shadow-sm hover:-translate-y-0.5 hover:border-teal/40 hover:shadow-md"
      }`}
    >
      <button
        type="button"
        aria-label="Drag"
        disabled={placed}
        className="flex cursor-grab items-center px-2 text-navy/35 transition hover:bg-navy/5 hover:text-navy/55 active:cursor-grabbing"
        {...listeners}
        {...attributes}
        onPointerDown={(e) => {
          pointerStart.current = { x: e.clientX, y: e.clientY };
          listeners?.onPointerDown?.(e);
        }}
        onPointerUp={(e) => {
          const start = pointerStart.current;
          pointerStart.current = null;
          if (!start) return;
          // Failed drag activation (moved but dnd-kit did not take over) → select
          const moved =
            Math.hypot(e.clientX - start.x, e.clientY - start.y) > 6;
          if (moved && !isDragging) onSelect();
        }}
      >
        <GripVertical className="h-4 w-4 shrink-0" aria-hidden />
      </button>
      <button
        type="button"
        disabled={placed}
        aria-pressed={selected}
        onClick={onSelect}
        className="min-w-0 flex-1 cursor-pointer px-2 py-2 text-left text-sm font-medium active:scale-[0.99]"
      >
        {label}
      </button>
    </div>
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
      data-testid={`drop-zone-${id}`}
      data-active={active || isOver ? "true" : "false"}
      onClick={onActivate}
      className={`min-h-28 w-full rounded-xl border-2 border-dashed p-3 text-left transition ${
        isOver || active
          ? "border-teal bg-teal/15 shadow-inner ring-2 ring-teal/20"
          : "border-navy/20 bg-off-white"
      }`}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-navy/55">
        {label}
      </p>
      <div className="mt-2 flex min-h-10 flex-wrap gap-2">{children}</div>
    </button>
  );
}

interface Props {
  interaction: DragClassifyInteraction;
  language: Language;
  onSolved: (result: Omit<ChallengeResult, "durationMs" | "completed">) => void;
  onHint: (hint: string | null) => void;
  mode?: "play" | "review";
}

export function DragClassifyGame({
  interaction,
  language,
  onSolved,
  onHint,
  mode = "play",
}: Props) {
  const { copy } = useI18n();
  const [placements, setPlacements] = useState<Record<string, string>>(() => {
    if (mode !== "review") return {};
    const auto: Record<string, string> = {};
    interaction.items.forEach((item) => {
      if (item.correctZoneId) auto[item.id] = item.correctZoneId;
    });
    return auto;
  });
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [rebuild, setRebuild] = useState(mode === "review");
  const [showTapHint, setShowTapHint] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 10 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 120, tolerance: 8 },
    }),
    useSensor(KeyboardSensor),
  );

  const requiredItems = useMemo(
    () => interaction.items.filter((i) => i.correctZoneId !== null),
    [interaction.items],
  );

  useEffect(() => {
    if (!selectedItem) {
      setShowTapHint(false);
      return;
    }
    const t = window.setTimeout(() => setShowTapHint(true), 3000);
    return () => window.clearTimeout(t);
  }, [selectedItem]);

  const place = (itemId: string, zoneId: string) => {
    const item = interaction.items.find((i) => i.id === itemId);
    if (!item) return;

    if (item.correctZoneId === null || item.correctZoneId !== zoneId) {
      const nextAttempts = attempts + 1;
      setAttempts(nextAttempts);
      onHint(interaction.wrongHint[language]);
      setSelectedItem(null);
      if (nextAttempts >= interaction.maxAttempts) {
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
    if (!over) {
      // Failed drag → select card for tap placement
      setSelectedItem(String(active.id));
      return;
    }
    place(String(active.id), String(over.id));
  };

  const unplaced = interaction.items.filter((i) => !placements[i.id]);

  return (
    <div className="space-y-3">
      <p className="rounded-xl bg-navy/5 px-3 py-2 text-sm text-navy/80">
        {interaction.prompt[language]}
      </p>
      <div>
        <p className="text-sm font-medium text-navy">{copy.minigame.dragA11y}</p>
        <p className="mt-0.5 text-xs text-navy/45">{copy.minigame.dragAlso}</p>
      </div>

      {selectedItem && (
        <p
          className="rounded-lg bg-teal/10 px-3 py-2 text-sm font-semibold text-teal"
          role="status"
          aria-live="polite"
        >
          {language === "es"
            ? "Ahora elige una categoría ↓"
            : "Now choose a category ↓"}
        </p>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={(e) => setActiveId(String(e.active.id))}
        onDragEnd={onDragEnd}
        onDragCancel={() => {
          if (activeId) setSelectedItem(activeId);
          setActiveId(null);
        }}
      >
        <div className="grid gap-2 sm:grid-cols-2">
          {unplaced.map((item) => (
            <DraggableCard
              key={item.id}
              id={item.id}
              label={item.label[language]}
              selected={selectedItem === item.id}
              placed={Boolean(placements[item.id])}
              onSelect={() => setSelectedItem(item.id)}
            />
          ))}
        </div>

        <div
          className={`grid gap-3 ${
            interaction.zones.length > 2 ? "sm:grid-cols-3" : "sm:grid-cols-2"
          }`}
        >
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
                    data-testid={`placed-${i.id}`}
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
            <div className="flex items-center gap-2 rounded-xl border border-teal bg-white px-3 py-2 text-sm font-medium shadow-lg">
              <GripVertical className="h-4 w-4 text-navy/40" aria-hidden />
              {
                interaction.items.find((i) => i.id === activeId)?.label[
                  language
                ]
              }
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {showTapHint && selectedItem && (
        <p className="text-xs text-navy/50" role="status">
          {language === "es"
            ? "Toca una categoría para colocarla."
            : "Tap a category to place it."}
        </p>
      )}

      {rebuild && interaction.rebuild && (
        <div className="animate-slide-up rounded-xl border border-navy/10 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-navy/50">
            {copy.minigame.rebuild}
          </p>
          <p className="mt-2 text-sm text-navy/80">
            {interaction.rebuild.infoIds
              .map(
                (id) =>
                  interaction.items.find((i) => i.id === id)?.label[language],
              )
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
      )}
    </div>
  );
}
