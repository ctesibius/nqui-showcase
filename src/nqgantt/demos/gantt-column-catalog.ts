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
    description:
      "Numeric value with optional unit and bounds. Use min 0 / max 100 and unit % for percent-style fields; show as a progress bar or edit with a slider.",
    group: "basic",
    available: true,
    valueType: "number",
    cellVariant: "number-with-unit",
    editVariant: "number-with-unit",
    cellVariants: ["number-with-unit", "progress-bar"],
    editVariants: ["number-with-unit", "number", "slider"],
    defaults: { minWidth: 110 },
  },
  /**
   * Legacy catalog id — Percent collapsed into Number. Hidden from the add-
   * column picker (`available: false` + filtered out); `draftToColumnDef`
   * still resolves it to a number 0–100 / progress-bar preset so old drafts
   * and deep-links do not break.
   */
  {
    id: "percent",
    label: "Percent",
    description: "Use Number with min 0, max 100, and unit %.",
    group: "basic",
    available: false,
    valueType: "number",
    cellVariant: "progress-bar",
    editVariant: "slider",
    cellVariants: ["progress-bar", "number-with-unit"],
    editVariants: ["slider", "number", "number-with-unit"],
    defaults: { min: 0, max: 100, step: 1, unit: "%", minWidth: 120 },
  },
  {
    id: "select",
    label: "Select",
    description:
      "Closed set of options. Cells store the option id — rename or recolor once and every row follows. Not creatable from the cell (Configure adds options); orphan ids still merge into the list if somehow committed.",
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
    description:
      "Multiple labels on one row. New tags join the column’s option set (reusable across rows).",
    group: "basic",
    available: true,
    valueType: "tags",
    cellVariant: "badge-list",
    editVariant: "tag-input",
    cellVariants: ["badge-list"],
    editVariants: ["tag-input"],
    /** Options grow as tags are created — seed empty so the def always has a list. */
    needsOptions: false,
    defaults: { minWidth: 160 },
  },
  {
    id: "people",
    label: "People",
    description:
      "Team members, drawn as an avatar stack. Independent of the built-in assignees — name it Observer, Reviewer, Approver. Picker = column options ∪ workspace directory; new names join the column’s option set.",
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
    // Host-evaluated — expression lives in mock/project formula settings.
    label: "Formula",
    description:
      "Read-only computed column. Expression is stored in project settings and evaluated host-side (e.g. 100 - progress, 100 + duration). Links progress, effort, budget, duration, and custom number fields. Engine does not parse formulas.",
    group: "advanced",
    available: true,
    valueType: "number",
    cellVariant: "number-with-unit",
    editVariant: "number",
    cellVariants: ["number-with-unit", "progress-bar"],
    defaults: { minWidth: 120, editable: false },
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
  /** Formula columns only — host-evaluated expression (see gantt-formula-column.ts). */
  expression?: string;
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
    unit: entry?.defaults?.unit,
    min: entry?.defaults?.min,
    max: entry?.defaults?.max,
    expression: typeId === "formula" ? "100 - progress" : undefined,
    options: seedOptions(entry),
  };
}

/** A select-like column with no options can never hold a value — refuse it. */
export function draftIsValid(draft: ColumnDraft): boolean {
  const entry = catalogEntry(draft.typeId);
  if (!entry) return false;
  // Legacy percent is hidden from the picker but still a valid create path
  // (emits Number 0–100 via draftToColumnDef).
  if (!entry.available && draft.typeId !== "percent") return false;
  if (!draft.label.trim()) return false;
  if (entry.needsOptions && draft.options.length === 0) return false;
  return true;
}

/**
 * Former Percent catalog type → Number 0–100 with progress/slider defaults.
 * Kept so callers that still pass `typeId: "percent"` get a number column.
 */
export const PERCENT_NUMBER_PRESET: Partial<GanttSidebarColumnDef> = {
  valueType: "number",
  cellVariant: "progress-bar",
  editVariant: "slider",
  min: 0,
  max: 100,
  step: 1,
  unit: "%",
  minWidth: 120,
};

/** Turn a draft into a column def. Ids are `c:`-prefixed like SecoLab's. */
export function draftToColumnDef(
  draft: ColumnDraft,
  existingIds: readonly string[],
): GanttSidebarColumnDef {
  const entry = catalogEntry(draft.typeId)!;
  const slug = draft.label.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  let id = `c:${slug || "field"}`;
  for (let n = 2; existingIds.includes(id); n++) id = `c:${slug}-${n}`;

  // Percent is no longer a value type in the catalog — emit number 0–100.
  const percentAlias = draft.typeId === "percent";
  const isFormula = draft.typeId === "formula";
  const defaults = percentAlias
    ? { ...entry.defaults, ...PERCENT_NUMBER_PRESET }
    : entry.defaults;

  return {
    ...defaults,
    id,
    type: "custom",
    label: draft.label.trim(),
    dataKey: id.slice(2),
    valueType: percentAlias ? "number" : entry.valueType,
    cellVariant: draft.cellVariant ?? entry.cellVariant,
    editVariant: isFormula ? undefined : draft.editVariant ?? entry.editVariant,
    // Formulas are host-stamped — never cell-editable.
    editable: isFormula ? false : true,
    sortable: true,
    filterable: true,
    unit: draft.unit || defaults?.unit || undefined,
    min: draft.min ?? defaults?.min,
    max: draft.max ?? defaults?.max,
    options: entry.needsOptions
      ? draft.options.map((o, i) => ({ ...o, order: i }))
      : entry.valueType === "tags"
        ? (draft.options ?? []).map((o, i) => ({ ...o, order: i }))
        : undefined,
  };
}

/** Expression captured at Add-column time for formula drafts. */
export function draftFormulaExpression(draft: ColumnDraft): string | undefined {
  if (draft.typeId !== "formula") return undefined;
  const trimmed = draft.expression?.trim();
  return trimmed || "100 - progress";
}
