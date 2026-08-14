/**
 * Host-side Group-by builders for RoadmapGantt.
 *
 * The published package’s `buildTimelineGroups` is internal to GanttDemo;
 * GanttRoot takes pre-built `groups`. These helpers mirror that seam while
 * keeping WBS children under their parent via `groupFeaturesKeepingTree`.
 */
import type { GanttFeature, GanttSidebarColumnDef } from "@nqlib/nqgantt";
import type { GanttRootGroup } from "@nqlib/nqgantt/ui";
import { DEFAULT_STATUS_OPTIONS } from "../../lib/mock/ops";
import { WBS_COLUMN_ID } from "./gantt-wbs-column";
import { groupFeaturesKeepingTree } from "./gantt-tree-groups";

export type RoadmapGanttGroupBy =
  | "status"
  | "resource"
  | "none"
  | `column:${string}`;

export function isColumnGroupBy(
  value: string,
): value is `column:${string}` {
  return value.startsWith("column:");
}

export function columnIdFromGroupBy(groupBy: `column:${string}`): string {
  return groupBy.slice("column:".length);
}

/**
 * Select columns eligible for Group by (Monday/Linear-style).
 *
 * Any `type === "custom"` column with a non-empty `options` list is groupable —
 * including Priority and host-added dropdowns that omit `editVariant` /
 * `valueType === "status"`. Text/date/number columns without options stay out.
 * The WBS **code** column is never groupable (outline codes aren’t a taxonomy;
 * package `groupBy: "wbs"` outline mode is a different concept and is not
 * wired in RoadmapGantt). People columns with options stay groupable.
 * Status / Assignee / None remain separate built-in Group Select entries.
 * Defs are de-duped by `id` so a host+package double-insert can’t list twice.
 */
export function selectColumnsForGroupBy(
  defs: readonly GanttSidebarColumnDef[],
): GanttSidebarColumnDef[] {
  const seen = new Set<string>();
  const out: GanttSidebarColumnDef[] = [];
  for (const d of defs) {
    if (d.id === WBS_COLUMN_ID) continue;
    if (d.type !== "custom") continue;
    if (!Array.isArray(d.options) || d.options.length === 0) continue;
    if (seen.has(d.id)) continue;
    seen.add(d.id);
    out.push(d);
  }
  return out;
}

export function buildStatusGroups(features: GanttFeature[]): GanttRootGroup[] {
  const colorByName = new Map<string, string>(
    DEFAULT_STATUS_OPTIONS.map((o) => [o.label, o.color]),
  );
  return groupFeaturesKeepingTree(
    features,
    (feature) => feature.status?.name ?? "Uncategorized",
    DEFAULT_STATUS_OPTIONS.map((o) => o.label),
  ).map((g) => ({
    ...g,
    color: colorByName.get(g.name) ?? g.color,
  }));
}

export function buildResourceGroups(features: GanttFeature[]): GanttRootGroup[] {
  const names = new Set<string>();
  for (const f of features) {
    for (const a of f.assignees ?? []) {
      if (a?.name) names.add(a.name);
    }
  }
  const order = [...names].sort((a, b) => a.localeCompare(b));
  order.push("Unassigned");

  const colorByName = new Map<string, string>();
  for (const f of features) {
    for (const a of f.assignees ?? []) {
      if (a?.name && a.color && !colorByName.has(a.name)) {
        colorByName.set(a.name, a.color);
      }
    }
  }

  return groupFeaturesKeepingTree(
    features,
    (feature) => feature.assignees?.[0]?.name ?? "Unassigned",
    order,
  ).map((g) => ({
    ...g,
    color: colorByName.get(g.name) ?? g.color,
  }));
}

/**
 * Group by a custom select column. Cells store option ids under
 * `customFields[dataKey]` (or `customFields[id]` / bare slug); labels come
 * from `columnDef.options`.
 */
export function buildColumnGroups(
  features: GanttFeature[],
  def: GanttSidebarColumnDef,
): GanttRootGroup[] {
  const options = def.options ?? [];
  const labelById = new Map(options.map((o) => [o.id, o.label]));
  const colorByLabel = new Map(
    options
      .filter((o) => o.color)
      .map((o) => [o.label, o.color as string]),
  );
  const order = [
    ...[...options]
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((o) => o.label),
    "Uncategorized",
  ];

  const keys = fieldKeysForColumn(def);

  return groupFeaturesKeepingTree(
    features,
    (feature) => {
      const raw = readCustomField(feature, keys);
      if (raw == null || raw === "") return "Uncategorized";
      if (typeof raw === "string") {
        return labelById.get(raw) ?? raw;
      }
      if (Array.isArray(raw)) {
        const first = raw[0];
        if (first == null) return "Uncategorized";
        if (typeof first === "string") return labelById.get(first) ?? first;
        if (typeof first === "object" && first && "name" in first) {
          return String((first as { name?: string }).name ?? "Uncategorized");
        }
        if (typeof first === "object" && first && "id" in first) {
          const id = String((first as { id?: string }).id ?? "");
          return (labelById.get(id) ?? id) || "Uncategorized";
        }
        return "Uncategorized";
      }
      if (typeof raw === "object" && "name" in raw) {
        return String((raw as { name?: string }).name ?? "Uncategorized");
      }
      if (typeof raw === "object" && "id" in raw) {
        const id = String((raw as { id?: string }).id ?? "");
        return (labelById.get(id) ?? id) || "Uncategorized";
      }
      return "Uncategorized";
    },
    order,
  ).map((g) => ({
    ...g,
    color: colorByLabel.get(g.name) ?? g.color,
  }));
}

function fieldKeysForColumn(def: GanttSidebarColumnDef): string[] {
  const keys: string[] = [];
  if (def.dataKey) keys.push(def.dataKey);
  if (def.id && !keys.includes(def.id)) keys.push(def.id);
  // `c:risk` → also try `risk` when dataKey was omitted
  if (def.id.startsWith("c:")) {
    const slug = def.id.slice(2);
    if (slug && !keys.includes(slug)) keys.push(slug);
  }
  return keys;
}

function readCustomField(
  feature: GanttFeature,
  keys: string[],
): unknown {
  const bag = feature.customFields;
  if (!bag) return undefined;
  for (const key of keys) {
    if (key in bag && bag[key] != null && bag[key] !== "") return bag[key];
  }
  return undefined;
}
