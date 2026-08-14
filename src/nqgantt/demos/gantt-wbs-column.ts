/**
 * Host WBS sidebar helpers. Prefer package exports when on local / post-release
 * `@nqlib/nqgantt`; keep a thin re-export so older call sites keep compiling.
 */
export {
  WBS_COLUMN_ID,
  withWbsColumn,
} from "@nqlib/nqgantt"

import { createElement } from "react"
import type { GanttSidebarColumnDef } from "@nqlib/nqgantt"
import { WBS_COLUMN_ID } from "@nqlib/nqgantt"

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
