/**
 * Host-side option vocabulary growth for gantt sidebar cells.
 *
 * Configure mutates `column.options` directly. Cell commits must merge here so
 * tags / people / select orphans appear in Configure and the next picker open.
 */
import type { GanttColumnOption, GanttSidebarColumnDef } from "@nqlib/nqgantt";

/** Same palette as catalog OPTION_COLORS — local to keep this module dependency-free. */
const OPTION_COLORS = [
  "oklch(0.72 0.15 150)",
  "oklch(0.78 0.16 85)",
  "oklch(0.65 0.20 25)",
  "oklch(0.68 0.16 250)",
  "oklch(0.70 0.16 300)",
  "oklch(0.72 0.12 200)",
];

export type OptionMetaResolver = (
  id: string,
) => { label?: string; color?: string } | undefined;

/**
 * Grow a column’s option set when the cell creates/chooses values that are not
 * yet in `column.options`.
 */
export function mergeColumnOptionsFromCommit(
  existing: GanttColumnOption[] | undefined,
  values: string[],
  resolveMeta?: OptionMetaResolver,
): GanttColumnOption[] {
  const next = [...(existing ?? [])];
  const seen = new Set(next.flatMap((o) => [String(o.id), o.label]));
  for (const value of values) {
    const t = value.trim();
    if (!t || seen.has(t)) continue;
    seen.add(t);
    const meta = resolveMeta?.(t);
    const label = meta?.label?.trim() || t;
    if (label !== t) seen.add(label);
    next.push({
      id: t,
      label,
      color: meta?.color ?? OPTION_COLORS[next.length % OPTION_COLORS.length]!,
      order: next.length,
    });
  }
  return next.map((o, i) => ({ ...o, order: i }));
}

/** Normalize a cell commit into option ids (tags / people arrays, select scalar). */
export function optionIdsFromCommit(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw
      .map((v) =>
        typeof v === "object" && v !== null
          ? String((v as { id?: unknown }).id ?? "")
          : String(v),
      )
      .map((s) => s.trim())
      .filter(Boolean);
  }
  if (raw == null || raw === "") return [];
  if (typeof raw === "object" && raw !== null && "id" in raw) {
    const id = String((raw as { id: unknown }).id).trim();
    return id ? [id] : [];
  }
  if (typeof raw === "string" && raw.trim()) return [raw.trim()];
  return [];
}

/** Columns whose cell commits may introduce new option vocabulary. */
export function columnGrowsOptionsFromCell(def: GanttSidebarColumnDef): boolean {
  return (
    def.valueType === "tags" ||
    def.valueType === "people" ||
    def.editVariant === "tag-input" ||
    def.editVariant === "select" ||
    def.cellVariant === "badge-list" ||
    def.cellVariant === "avatar-stack" ||
    Array.isArray(def.options)
  );
}
