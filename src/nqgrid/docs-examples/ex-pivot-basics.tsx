import { Button, ToggleGroup, ToggleGroupItem } from "@nqlib/nqui";
import type { PivotSpec } from "@nqlib/nqgrid/core";
import { PivotTable, usePivotGrid } from "@nqlib/nqgrid/pivot";
import {
  COMPACT_WIDTHS,
  ExampleControls,
  ExampleFrame,
  PivotScroll,
  QUARTER,
  SALES,
  SALES_FIELDS,
  TABULAR_WIDTHS,
  usdCompact,
} from "./shared";

const SPEC: PivotSpec = {
  version: 1,
  id: "docs-pivot-basics",
  rows: [{ field: "region", label: "Region", sort: "asc" }, { field: "category", label: "Category" }],
  // A derived date field: the fiscal quarter of `orderDate`, no extra column needed.
  columns: { field: QUARTER, label: "Fiscal quarter" },
  measures: [{ id: "revenue", field: "revenue", label: "Revenue", format: usdCompact }],
  // One indented label column: the docs column is narrow, and compact keeps the values readable.
  layout: "compact",
  totals: { rowTotal: true },
  fields: SALES_FIELDS,
};

/** Rows, columns and totals: region → category by fiscal quarter. */
export default function ExPivotBasics() {
  const pivot = usePivotGrid(SPEC, SALES);
  const layout = pivot.spec.layout ?? "tabular";

  return (
    <ExampleFrame>
      <ExampleControls hint="Click a region's chevron to collapse it — its row keeps the subtotal. Tabular gives each level its own column, like Excel's tabular form.">
        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={pivot.expandAll}>
          Expand all
        </Button>
        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={pivot.collapseAll}>
          Collapse all
        </Button>
        <ToggleGroup
          type="single"
          size="sm"
          value={layout}
          onValueChange={(v) => v && pivot.setSpec((prev) => ({ ...prev, layout: v as "tabular" | "compact" }))}
        >
          <ToggleGroupItem value="tabular" className="text-xs">
            Tabular
          </ToggleGroupItem>
          <ToggleGroupItem value="compact" className="text-xs">
            Compact
          </ToggleGroupItem>
        </ToggleGroup>
      </ExampleControls>
      <PivotScroll>
        <PivotTable
          model={pivot.model}
          onToggleGroup={pivot.toggleGroup}
          {...(layout === "compact" ? COMPACT_WIDTHS : TABULAR_WIDTHS)}
          aria-label="Revenue by region and category"
        />
      </PivotScroll>
    </ExampleFrame>
  );
}
