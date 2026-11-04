import { useState } from "react";
import { Label, Switch, ToggleGroup, ToggleGroupItem } from "@nqlib/nqui";
import type { PivotShowAs, PivotShowAsBase, PivotSpec } from "@nqlib/nqgrid/core";
import { PivotTable, usePivotGrid } from "@nqlib/nqgrid/pivot";
import { COMPACT_WIDTHS, ExampleControls, ExampleFrame, PivotScroll, QUARTER, SALES, SALES_FIELDS, usdCompact } from "./shared";

const SPEC: PivotSpec = {
  version: 1,
  id: "docs-pivot-show-as",
  rows: [{ field: "region", label: "Region", sort: "asc" }, { field: "category", label: "Category" }],
  columns: { field: QUARTER, label: "Fiscal quarter" },
  measures: [{ id: "revenue", field: "revenue", label: "Revenue", format: usdCompact }],
  // One indented label column: the docs column is narrow, and compact keeps the values readable.
  layout: "compact",
  totals: { rowTotal: true },
  fields: SALES_FIELDS,
};

const MODES: { id: string; label: string; showAs: PivotShowAs; base?: PivotShowAsBase }[] = [
  { id: "value", label: "Value", showAs: "value" },
  { id: "column", label: "% of column", showAs: "percentOfColumnTotal" },
  { id: "parent", label: "% of parent row", showAs: "percentOfParentRow" },
  { id: "diff", label: "% vs previous quarter", showAs: "percentDifferenceFrom", base: { field: QUARTER, position: "previous" } },
  { id: "running", label: "Running total", showAs: "runningTotal", base: { field: QUARTER } },
];

/** One measure, five readings of it — the aggregation never changes, only how it is expressed. */
export default function ExPivotShowAs() {
  const pivot = usePivotGrid(SPEC, SALES);
  const [mode, setMode] = useState("value");
  const heatOn = pivot.spec.heat != null;

  const apply = (id: string) => {
    const m = MODES.find((x) => x.id === id);
    if (!m) return;
    setMode(id);
    pivot.setMeasureShowAs("revenue", m.showAs, m.base ?? null);
  };

  return (
    <ExampleFrame>
      <ExampleControls hint="“% vs previous quarter” is blank in Q1 — there is no previous quarter to compare with, which is what Excel shows too. The heat map colors each quarter on its own scale.">
        <ToggleGroup type="single" size="sm" value={mode} onValueChange={(v) => v && apply(v)}>
          {MODES.map((m) => (
            <ToggleGroupItem key={m.id} value={m.id} className="text-xs">
              {m.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <div className="flex items-center gap-2">
          <Switch
            id="docs-pivot-heat"
            checked={heatOn}
            onCheckedChange={(on) =>
              pivot.setSpec((prev) => ({ ...prev, heat: on ? { measure: "revenue", scope: "column" } : null }))
            }
          />
          <Label htmlFor="docs-pivot-heat" className="text-xs">
            Heat map
          </Label>
        </div>
      </ExampleControls>
      <PivotScroll>
        <PivotTable model={pivot.model} onToggleGroup={pivot.toggleGroup} {...COMPACT_WIDTHS} aria-label="Revenue shown as" />
      </PivotScroll>
    </ExampleFrame>
  );
}
