import { Button, Switch, Label } from "@nqlib/nqui";
import type { PivotSpec } from "@nqlib/nqgrid/core";
import { PivotSlicer, PivotTable, pivotSlicerProps, usePivotGrid } from "@nqlib/nqgrid/pivot";
import { COMPACT_WIDTHS, ExampleControls, ExampleFrame, PivotScroll, QUARTER, SALES, SALES_FIELDS, usdCompact } from "./shared";

const TOP_2 = { measure: "revenue", count: 2, other: true, otherLabel: "Other lines" } as const;

const SPEC: PivotSpec = {
  version: 1,
  id: "docs-pivot-filters",
  rows: [
    { field: "category", label: "Category", sortBy: { measure: "revenue" } },
    { field: "line", label: "Product line", sortBy: { measure: "revenue" }, topN: TOP_2 },
  ],
  columns: { field: QUARTER, label: "Fiscal quarter" },
  measures: [{ id: "revenue", field: "revenue", label: "Revenue", format: usdCompact }],
  // One indented label column: the docs column is narrow, and compact keeps the values readable.
  layout: "compact",
  totals: { rowTotal: true },
  // Slicer-ready fields: they filter records before aggregation, like Excel slicers.
  facets: [
    { field: "region", label: "Region" },
    { field: "channel", label: "Channel" },
  ],
  fields: SALES_FIELDS,
};

/** Slicers filter the records; Top N keeps the best lines per category and folds the rest into "Other". */
export default function ExPivotFilters() {
  const pivot = usePivotGrid(SPEC, SALES);
  const topOn = pivot.spec.rows.find((r) => r.field === "line")?.topN != null;

  return (
    <ExampleFrame>
      <div className="flex shrink-0 flex-wrap gap-3">
        <PivotSlicer {...pivotSlicerProps(pivot, "region")} title="Region" columns={4} className="min-w-[16rem] flex-1 shadow-none" />
        <PivotSlicer {...pivotSlicerProps(pivot, "channel")} title="Channel" columns={3} className="min-w-[14rem] flex-1 shadow-none" />
      </div>
      <ExampleControls hint="Cmd/Ctrl-click a slicer item to add it to the selection. Totals always reflect what the slicers let through; with Top N on, “Other lines” keeps them complete.">
        <div className="flex items-center gap-2">
          <Switch
            id="docs-pivot-topn"
            checked={topOn}
            onCheckedChange={(on) => pivot.setTopN("line", on ? TOP_2 : null)}
          />
          <Label htmlFor="docs-pivot-topn" className="text-xs">
            Top 2 lines per category
          </Label>
        </div>
        <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={pivot.clearFilters}>
          Clear slicers
        </Button>
      </ExampleControls>
      <PivotScroll>
        <PivotTable model={pivot.model} onToggleGroup={pivot.toggleGroup} {...COMPACT_WIDTHS} aria-label="Revenue by category and product line" />
      </PivotScroll>
    </ExampleFrame>
  );
}
