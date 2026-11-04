import { Button } from "@nqlib/nqui";
import type { PivotSpec } from "@nqlib/nqgrid/core";
import {
  PivotFieldList,
  PivotTable,
  pivotFieldListProps,
  usePivotGrid,
  usePivotLayoutDraft,
} from "@nqlib/nqgrid/pivot";
import { ExampleControls, ExampleFrame, PivotScroll, SALES, SALES_FIELDS, usdCompact } from "./shared";

const SPEC: PivotSpec = {
  version: 1,
  id: "docs-pivot-field-list",
  rows: [{ field: "region", label: "Region" }],
  columns: { field: "channel", label: "Channel" },
  measures: [{ id: "revenue", field: "revenue", label: "Revenue", format: usdCompact }],
  totals: { rowTotal: true },
  fields: SALES_FIELDS,
};

/** The Excel-style field list: drag fields between Filters, Columns, Rows and Values. */
export default function ExPivotFieldList() {
  const pivot = usePivotGrid(SPEC, SALES);
  // Optional "Defer layout update": drag freely, apply once.
  const layout = usePivotLayoutDraft(pivot);

  return (
    <ExampleFrame>
      <ExampleControls hint="Drag “Category” under Region in Rows, or “Order date” into Columns and pick Group by → Quarter. Keyboard: focus a chip, press Space, move with the arrows, Space again to drop.">
        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={pivot.swapRowsColumns}>
          Swap rows and columns
        </Button>
        <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => pivot.setSpec(SPEC)}>
          Reset
        </Button>
      </ExampleControls>
      {/* Stacked: the docs column is too narrow for a side panel beside the table. */}
      <div className="flex min-h-0 flex-1 flex-col gap-3">
        <PivotScroll className="max-h-64 flex-none">
          <PivotTable
            model={pivot.model}
            onToggleGroup={pivot.toggleGroup}
            onToggleColumnGroup={pivot.toggleColumnGroup}
            aria-label="Pivot from the field list"
          />
        </PivotScroll>
        <PivotFieldList
          {...pivotFieldListProps(pivot, layout)}
          title="Fields"
          className="min-h-0 flex-1 overflow-y-auto shadow-none"
        />
      </div>
    </ExampleFrame>
  );
}
