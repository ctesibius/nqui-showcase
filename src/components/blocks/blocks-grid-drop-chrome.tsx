/* eslint-disable react-refresh/only-export-components -- drag chrome exports a hook; the private DropLine/DropGhost nodes live beside it. */
import { useMemo, type CSSProperties } from "react";
import { KeyboardSensor, PointerSensor, pointerWithin, useSensor, useSensors } from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { cn } from "@nqlib/nqui";
import { useSortableTableDropIndicators } from "@nqlib/nqgrid";

/*
 * Drag chrome for the Work-breakdown block — engine geometry from
 * `useSortableTableDropIndicators`, materialized into finished nodes/props so
 * the block component never touches the hook internals during render (same
 * split as the nqgrid playground helper).
 */

/** Keep dragged rows in place — the overlay pill carries the affordance. */
const DRAG_SUPPRESS =
  "[&_[data-slot=sortable-item]]:!transform-none [&_[data-slot=sortable-item]]:!transition-none";
/** While a column drag is live, header controls must not steal pointer events. */
const COLUMN_DRAG_SHIELD =
  "[&_thead_button]:pointer-events-none [&_thead_[role=separator]]:pointer-events-none";

/** Insert line with a terminal dot — the docs-TOC end-circle vocabulary. */
function DropLine({ style, axis }: { style: CSSProperties | null; axis: "row" | "column" }) {
  if (!style) return null;
  return (
    <div aria-hidden className="pointer-events-none absolute z-[60]" style={style}>
      <span className="absolute inset-0 rounded-full bg-primary shadow-[0_0_6px] shadow-primary/50" />
      <span
        className={cn(
          "absolute size-2 rounded-full border-2 border-primary bg-background",
          axis === "row" ? "top-1/2 -left-1 -translate-y-1/2" : "-top-1 left-1/2 -translate-x-1/2",
        )}
      />
    </div>
  );
}

/** Source ghost — the presumed drop area reads as a primary-tinted slot. */
function DropGhost({
  style,
  axis,
}: {
  style: CSSProperties | null | undefined;
  axis: "row" | "column";
}) {
  if (!style) return null;
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute rounded-md border border-dashed border-primary/40 bg-primary/[0.05]",
        axis === "row" ? "border-y-2" : "border-x-2",
      )}
      style={style}
    />
  );
}

export function useWorkBreakdownDropChrome() {
  const drop = useSortableTableDropIndicators();
  const a11y = useMemo(
    () =>
      typeof document === "undefined"
        ? undefined
        : ({ accessibility: { container: document.body } } as const),
    [],
  );
  const columnSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const containerClassName = cn(
    "relative min-h-0 flex-1",
    drop.isDragging && DRAG_SUPPRESS,
    drop.isColumnDragging && COLUMN_DRAG_SHIELD,
  );
  const chrome = (
    <>
      <DropGhost style={drop.rowGhostStyles.source} axis="row" />
      <DropGhost style={drop.columnGhostStyles.source} axis="column" />
      <DropLine style={drop.rowIndicatorStyle} axis="row" />
      <DropLine style={drop.columnIndicatorStyle} axis="column" />
    </>
  );
  return {
    containerRef: drop.containerRef,
    containerClassName,
    chrome,
    columnSortableProps: {
      ...drop.columnSortableProps,
      ...a11y,
      sensors: columnSensors,
      collisionDetection: pointerWithin,
    },
    rowSortableProps: { ...drop.rowSortableProps, ...a11y },
  };
}
