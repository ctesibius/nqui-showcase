/**
 * Hydrate showcase column defs so editing/display do not depend on whether the
 * installed `@nqlib/nqgantt` copies template fields onto `getDefaultColumnDefs()`.
 *
 * Published builds currently omit `editVariant` / `cellVariant` / bounds from
 * those defs; the sidebar can still resolve editors via a template lookup, but
 * the Configure panel and any host that reads the def itself sees them as
 * missing. This helper makes the defs self-describing again and refuses
 * `editable` when no editor can resolve (e.g. boolean `blocked`).
 */
import { COLUMN_TEMPLATES } from "@nqlib/nqgantt";
import type { GanttEditVariant, GanttSidebarColumnDef } from "@nqlib/nqgantt";

/** Built-in column types that resolve an editor without an explicit editVariant. */
const TYPE_EDIT_VARIANTS: Partial<Record<string, GanttEditVariant>> = {
  tasks: "text",
  notes: "text",
  timeline: "timeline",
  duration: "duration",
  dependencies: "dependencies",
};

/** Value types that infer an editor when editVariant is unset. */
const VALUE_EDIT_VARIANTS: Partial<Record<string, GanttEditVariant>> = {
  number: "number",
  percentage: "number",
  rating: "star-picker",
  tags: "tag-input",
  // People resolve to PeopleCellEditor via select + valueType === "people".
  people: "select",
  date: "date-picker",
  string: "text",
};

/** No inline editor exists for these yet (boolean icon-toggle, etc.). */
const NEVER_EDITABLE_IDS = new Set(["blocked", "wbs"]);

function resolvedEditVariant(def: GanttSidebarColumnDef): GanttEditVariant | null {
  // Host formulas / locked columns: respect explicit `editable: false`.
  if (def.editable === false) return null;
  if (def.editVariant) return def.editVariant;
  const fromType = TYPE_EDIT_VARIANTS[def.type];
  if (fromType) return fromType;
  // Tags keep tag-input even when options are present — those are the label set.
  if (def.valueType === "tags") return "tag-input";
  // People stay editable with an empty roster (cell can create names).
  if (def.valueType === "people") return "select";
  if (def.options?.length) return "select";
  const fromValue = VALUE_EDIT_VARIANTS[def.valueType ?? ""];
  if (fromValue) {
    if (
      (def.valueType === "number" || def.valueType === "percentage") &&
      def.unit
    ) {
      return "number-with-unit";
    }
    return fromValue;
  }
  return null;
}

/**
 * Restore template presentation/editing onto each def and set `editable` only
 * when an editor can resolve.
 */
export function applyRoadmapColumnEditing(
  defs: GanttSidebarColumnDef[],
  editable: boolean,
): GanttSidebarColumnDef[] {
  return defs.map(def => {
    const template = COLUMN_TEMPLATES[def.id];
    const templateCellVariant = template?.cellVariant as
      | GanttSidebarColumnDef["cellVariant"]
      | undefined;
    // Closed option sets (priority, host selects) paint as status-like chips
    // unless the def already chose a richer cellVariant (e.g. avatar-stack).
    // Tags keep badge-list even when options grow — never infer a single-select chip.
    const inferredOptionChip: GanttSidebarColumnDef["cellVariant"] =
      !def.cellVariant &&
      !templateCellVariant &&
      def.valueType !== "people" &&
      def.valueType !== "tags" &&
      Array.isArray(def.options) &&
      def.options.length > 0
        ? "colored-pill"
        : undefined;

    const hydrated: GanttSidebarColumnDef = {
      ...def,
      cellVariant:
        def.cellVariant ?? templateCellVariant ?? inferredOptionChip,
      editVariant:
        def.editVariant ??
        (template?.editVariant as GanttSidebarColumnDef["editVariant"]),
      unit: def.unit ?? template?.unit,
      min: def.min ?? template?.minValue,
      max: def.max ?? template?.maxValue,
      step: def.step ?? template?.step,
    };

    // Preserve host-locked read-only columns (e.g. formula stamps) even when
    // the sidebar is otherwise editable.
    if (
      !editable ||
      NEVER_EDITABLE_IDS.has(hydrated.id) ||
      def.editable === false
    ) {
      return { ...hydrated, editable: false };
    }

    const variant = resolvedEditVariant(hydrated);
    // Stamp the resolved editor onto the def so host commit handlers (e.g. tag
    // option growth) can trust `editVariant` without re-inferring.
    return {
      ...hydrated,
      ...(variant ? { editVariant: variant } : {}),
      editable: variant != null,
    };
  });
}
