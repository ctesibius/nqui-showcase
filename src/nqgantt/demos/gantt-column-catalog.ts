/**
 * Column type catalog for the gantt sidebar.
 *
 * This is the ColumnType contract made authorable. A column is defined along
 * three independent axes, and the add-column flow collects one choice per axis
 * rather than a single flat "type" that silently decides all three:
 *
 *   1. VALUE     — what the cell stores (`valueType`, plus the closed option set
 *                  for select-likes). Drives parse / compareKey / filtering.
 *   2. DISPLAY   — how it is drawn (`cellVariant`, `unit`, bounds). Pure
 *                  function of the value; never stored alongside it.
 *   3. EDIT      — how the user changes it (`editVariant`). Commits raw only.
 *
 * Keeping them separate is what lets a number render as a progress bar and edit
 * as a slider, or a select render as a colored pill and edit as a picker,
 * without the engine ever learning what the column *means*.
 *
 * A fourth, view-level axis — which column drives the timeline, the grouping,
 * or the bar color — is a host decision made per view, not a property of the
 * column. See `nqgrid-nqgantt-wiring.md`.
 */
import type {
  GanttCellVariant,
  GanttColumnOption,
  GanttEditVariant,
  GanttSidebarColumnDef,
} from "@nqlib/nqgantt";
import { TEAM } from "../../lib/mock/ops";

export type CatalogGroup = "basic" | "people" | "advanced";

export interface GanttColumnTypeEntry {
  id: string;
  label: string;
  description: string;
  group: CatalogGroup;
  /** False renders the entry with a "Coming soon" badge instead of hiding it. */
  available: boolean;
  /** Axis 1 — what the cell stores. */
  valueType: GanttSidebarColumnDef["valueType"];
  /** Axis 2 — default display treatment. User may switch it where alternatives exist. */
  cellVariant?: GanttCellVariant;
  /** Axis 3 — default editor. */
  editVariant: GanttEditVariant;
  /** Display treatments this value type can legally take. */
  cellVariants?: GanttCellVariant[];
  /** Editors this value type can legally take. */
  editVariants?: GanttEditVariant[];
  needsOptions?: boolean;
  defaults?: Partial<GanttSidebarColumnDef>;
}

export const GANTT_COLUMN_TYPES: GanttColumnTypeEntry[] = [
  {
    id: "text",
    label: "Text",
    description: "Free-form single line. Sorts alphabetically, filters by substring.",
    group: "basic",
    available: true,
    valueType: "string",
    editVariant: "text",
    editVariants: ["text"],
    defaults: { minWidth: 140 },
  },
  {
    id: "number",
    label: "Number",
    description: "Numeric value with an optional unit. Sorts and filters by range.",
    group: "basic",
    available: true,
    valueType: "number",
    cellVariant: "number-with-unit",
    editVariant: "number-with-unit",
    cellVariants: ["number-with-unit", "progress-bar"],
    editVariants: ["number-with-unit", "number", "slider"],
    defaults: { minWidth: 110 },
  },
  {
    id: "percent",
    label: "Percent",
    description: "0–100 value. Draws as a bar, edits as a slider.",
    group: "basic",
    available: true,
    valueType: "percentage",
    cellVariant: "progress-bar",
    editVariant: "slider",
    cellVariants: ["progress-bar", "number-with-unit"],
    editVariants: ["slider", "number"],
    defaults: { min: 0, max: 100, step: 1, minWidth: 120 },
  },
  {
    id: "select",
    label: "Select",
    description:
      "Closed set of options. Cells store the option id — rename or recolor once and every row follows.",
    group: "basic",
    available: true,
    valueType: "status",
    cellVariant: "colored-pill",
    editVariant: "select",
    cellVariants: ["colored-pill", "badge"],
    editVariants: ["select"],
    needsOptions: true,
    defaults: { minWidth: 120 },
  },
  {
    id: "date",
    label: "Date",
    description: "A single day. Not the timeline — that comes from start/end.",
    group: "basic",
    available: true,
    valueType: "date",
    editVariant: "date-picker",
    editVariants: ["date-picker"],
    defaults: { minWidth: 120 },
  },
  {
    id: "rating",
    label: "Rating",
    description: "Zero to five stars, including half steps.",
    group: "basic",
    available: true,
    valueType: "rating",
    cellVariant: "star-rating",
    editVariant: "star-picker",
    cellVariants: ["star-rating"],
    editVariants: ["star-picker"],
    defaults: { min: 0, max: 5, step: 0.5, minWidth: 160 },
  },
  {
    id: "tags",
    label: "Tags",
    description: "Multiple free-form labels on one row.",
    group: "basic",
    available: true,
    valueType: "tags",
    cellVariant: "badge-list",
    editVariant: "tag-input",
    cellVariants: ["badge-list"],
    editVariants: ["tag-input"],
    defaults: { minWidth: 160 },
  },
  {
    id: "people",
    label: "People",
    description:
      "Team members, drawn as an avatar stack. Independent of the built-in assignees — name it Observer, Reviewer, Approver.",
    group: "people",
    available: true,
    valueType: "people",
    cellVariant: "avatar-stack",
    editVariant: "select",
    cellVariants: ["avatar-stack", "colored-pill"],
    editVariants: ["select"],
    needsOptions: true,
    defaults: { minWidth: 140 },
  },
  {
    id: "checkbox",
    label: "Checkbox",
    description: "A yes/no flag.",
    group: "advanced",
    available: false,
    valueType: "boolean",
    editVariant: "text",
  },
  {
    id: "formula",
    label: "Formula",
    description: "Derived from other columns. Read-only by definition.",
    group: "advanced",
    available: false,
    valueType: "number",
    editVariant: "number",
  },
  {
    id: "relation",
    label: "Relation",
    description: "Points at rows in another board.",
    group: "advanced",
    available: false,
    valueType: "relation",
    editVariant: "select",
  },
];

export function catalogEntry(id: string): GanttColumnTypeEntry | undefined {
  return GANTT_COLUMN_TYPES.find(e => e.id === id);
}

export const CATALOG_GROUP_LABELS: Record<CatalogGroup, string> = {
  basic: "Basic",
  people: "People",
  advanced: "Advanced",
};

/** Palette for new select options — theme-balanced, matches the engine's defaults. */
export const OPTION_COLORS = [
  "oklch(0.72 0.15 150)",
  "oklch(0.78 0.16 85)",
  "oklch(0.65 0.20 25)",
  "oklch(0.68 0.16 250)",
  "oklch(0.70 0.16 300)",
  "oklch(0.72 0.12 200)",
];

export interface ColumnDraft {
  label: string;
  typeId: string;
  cellVariant?: GanttCellVariant;
  editVariant?: GanttEditVariant;
  unit?: string;
  min?: number;
  max?: number;
  options: GanttColumnOption[];
}

/**
 * Options seeded for a new column. A people column is picked from the real
 * roster — inventing "Option 1 / Option 2" for people would be useless — while
 * a plain select starts with placeholders the author renames.
 */
function seedOptions(entry: GanttColumnTypeEntry | undefined): GanttColumnOption[] {
  if (!entry?.needsOptions) return [];
  if (entry.id === "people") {
    return TEAM.map((p, i) => ({ id: p.id, label: p.name, color: p.color, order: i }));
  }
  return [
    { id: "opt_1", label: "Option 1", color: OPTION_COLORS[0], order: 0 },
    { id: "opt_2", label: "Option 2", color: OPTION_COLORS[1], order: 1 },
  ];
}

export function emptyDraft(typeId = "text"): ColumnDraft {
  const entry = catalogEntry(typeId);
  return {
    label: "",
    typeId,
    cellVariant: entry?.cellVariant,
    editVariant: entry?.editVariant,
    unit: undefined,
    min: entry?.defaults?.min,
    max: entry?.defaults?.max,
    options: seedOptions(entry),
  };
}

/** A select-like column with no options can never hold a value — refuse it. */
export function draftIsValid(draft: ColumnDraft): boolean {
  const entry = catalogEntry(draft.typeId);
  if (!entry?.available) return false;
  if (!draft.label.trim()) return false;
  if (entry.needsOptions && draft.options.length === 0) return false;
  return true;
}

/** Turn a draft into a column def. Ids are `c:`-prefixed like SecoLab's. */
export function draftToColumnDef(
  draft: ColumnDraft,
  existingIds: readonly string[],
): GanttSidebarColumnDef {
  const entry = catalogEntry(draft.typeId)!;
  const slug = draft.label.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  let id = `c:${slug || "field"}`;
  for (let n = 2; existingIds.includes(id); n++) id = `c:${slug}-${n}`;

  return {
    ...entry.defaults,
    id,
    type: "custom",
    label: draft.label.trim(),
    dataKey: id.slice(2),
    valueType: entry.valueType,
    cellVariant: draft.cellVariant ?? entry.cellVariant,
    editVariant: draft.editVariant ?? entry.editVariant,
    editable: true,
    sortable: true,
    filterable: true,
    unit: draft.unit || undefined,
    min: draft.min,
    max: draft.max,
    options: entry.needsOptions
      ? draft.options.map((o, i) => ({ ...o, order: i }))
      : undefined,
  };
}
