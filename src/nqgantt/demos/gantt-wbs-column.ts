/**
 * Host WBS sidebar helpers.
 *
 * Published `@nqlib/nqgantt@0.4.0` does not export `WBS_COLUMN_ID` / `withWbsColumn`
 * yet (they land on the sibling `feat/gantt-root-demo-chrome` branch). Keep these
 * host-owned so demos typecheck and bundle against both published and local.
 *
 * Under `USE_LOCAL_NQGANTT`, `getDefaultColumnDefs()` already includes a `wbs`
 * def — callers must not also prepend `WBS_COLUMN_DEF` or menus show two "WBS".
 */
import { createElement } from "react"
import type { GanttSidebarColumnDef } from "@nqlib/nqgantt"

/** Built-in WBS outline column id (`feature.wbsCode`). */
export const WBS_COLUMN_ID = "wbs" as const

/** Insert `wbs` immediately before the task name column when enabled. */
export function withWbsColumn(
  ids: readonly string[],
  showWbs: boolean,
): string[] {
  const next = ids.filter((id) => id !== WBS_COLUMN_ID)
  if (!showWbs) return next
  const i = next.indexOf("tasks")
  if (i === -1) return [WBS_COLUMN_ID, ...next]
  return [...next.slice(0, i), WBS_COLUMN_ID, ...next.slice(i)]
}

/** Explicit column def — same shape as the package built-in `wbs` template. */
export const WBS_COLUMN_DEF: GanttSidebarColumnDef = {
  id: WBS_COLUMN_ID,
  type: "custom",
  columnType: "custom",
  dataKey: "wbsCode",
  label: "WBS",
  minWidth: 64,
  valueType: "string",
  editable: false,
  sortable: true,
  filterable: false,
  renderer: (value, feature) => {
    const code =
      (typeof value === "string" && value) || feature.wbsCode || ""
    return createElement(
      "span",
      { className: "text-xs tabular-nums tracking-tight text-muted-foreground" },
      code || "–",
    )
  },
}
