/**
 * Excel-style grid selection: light fill for range interior, 2px primary edges on
 * the perimeter. Active cell gets edges only — no stacked bg + outline + ring.
 */
export type GridCellSelectionChrome = {
  selected: boolean;
  isActiveCell: boolean;
  edgeTop: boolean;
  edgeBottom: boolean;
  edgeLeft: boolean;
  edgeRight: boolean;
  existingBoxShadow?: string;
};

export function buildGridCellSelectionBoxShadow({
  selected,
  isActiveCell,
  edgeTop,
  edgeBottom,
  edgeLeft,
  edgeRight,
  existingBoxShadow,
}: GridCellSelectionChrome): string | undefined {
  const shadowLayers: string[] = [];
  if (selected && !isActiveCell) {
    shadowLayers.push("inset 0 0 0 9999px color-mix(in oklab, var(--primary) 12%, transparent)");
  }
  if (edgeTop) shadowLayers.push("inset 0 2px 0 0 var(--primary)");
  if (edgeBottom) shadowLayers.push("inset 0 -2px 0 0 var(--primary)");
  if (edgeLeft) shadowLayers.push("inset 2px 0 0 0 var(--primary)");
  if (edgeRight) shadowLayers.push("inset -2px 0 0 0 var(--primary)");
  if (shadowLayers.length === 0) return existingBoxShadow;
  return [existingBoxShadow, ...shadowLayers].filter(Boolean).join(", ");
}
