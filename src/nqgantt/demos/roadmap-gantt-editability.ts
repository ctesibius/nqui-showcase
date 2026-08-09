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
  date: "date-picker",
  string: "text",
};

/** No inline editor exists for these yet (boolean icon-toggle, etc.). */
const NEVER_EDITABLE_IDS = new Set(["blocked"]);

function resolvedEditVariant(def: GanttSidebarColumnDef): GanttEditVariant | null {
  if (def.editVariant) return def.editVariant;
  const fromType = TYPE_EDIT_VARIANTS[def.type];
  if (fromType) return fromType;
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
    const hydrated: GanttSidebarColumnDef = {
      ...def,
      cellVariant:
        def.cellVariant ??
        (template?.cellVariant as GanttSidebarColumnDef["cellVariant"]),
      editVariant:
        def.editVariant ??
        (template?.editVariant as GanttSidebarColumnDef["editVariant"]),
      unit: def.unit ?? template?.unit,
      min: def.min ?? template?.minValue,
      max: def.max ?? template?.maxValue,
      step: def.step ?? template?.step,
    };

    if (!editable || NEVER_EDITABLE_IDS.has(hydrated.id)) {
      return { ...hydrated, editable: false };
    }

    const variant = resolvedEditVariant(hydrated);
    return { ...hydrated, editable: variant != null };
  });
}
