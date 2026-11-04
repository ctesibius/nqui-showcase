import { useState } from "react";
import { Button } from "@nqlib/nqui";
import type { PivotDrillThroughResult, PivotSpec } from "@nqlib/nqgrid/core";
import {
  PivotCalculatedMeasureForm,
  PivotDrillThroughPanel,
  PivotTable,
  pivotDrillThroughTitle,
  usePivotGrid,
} from "@nqlib/nqgrid/pivot";
import { ExampleControls, ExampleFrame, PivotScroll, SALES, SALES_FIELDS, usd, usdCompact } from "./shared";

const SPEC: PivotSpec = {
  version: 1,
  id: "docs-pivot-calculated",
  rows: [{ field: "region", label: "Region", sort: "asc" }, { field: "category", label: "Category" }],
  measures: [
    { id: "revenue", field: "revenue", label: "Revenue", format: usdCompact },
    { id: "plan", field: "plan", label: "Plan", format: usdCompact },
    // A calculated field: evaluated on the aggregates, so every total is
    // sum(revenue) / sum(plan) - 1 — never an average of row percentages.
    {
      id: "vsPlan",
      calculate: "revenue / plan - 1",
      label: "vs plan",
      format: { style: "percent", decimals: 1, signDisplay: "exceptZero" },
    },
  ],
  // One indented label column: the docs column is narrow, and compact keeps the values readable.
  layout: "compact",
  fields: SALES_FIELDS,
};

const DRILL_FIELDS = ["orderId", "orderDate", "customer", "channel", "line", "units", "revenue", "plan"];

/** Calculated measures, and drill-through from any value cell to the orders behind it. */
export default function ExPivotCalculated() {
  const pivot = usePivotGrid(SPEC, SALES);
  const [editing, setEditing] = useState(false);
  const [drill, setDrill] = useState<{ title: string; result: PivotDrillThroughResult } | null>(null);

  return (
    <ExampleFrame>
      <ExampleControls hint="Double-click any value to list the orders behind it (Excel's double-click “Show Details”). Edit the formula — try “revenue - plan” — and every subtotal recomputes from the aggregates.">
        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setEditing((v) => !v)}>
          {editing ? "Close formula" : "Edit “vs plan” formula"}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 text-xs"
          onClick={() => {
            pivot.setSpec(SPEC);
            setDrill(null);
          }}
        >
          Reset
        </Button>
      </ExampleControls>
      {editing ? (
        <PivotCalculatedMeasureForm
          spec={pivot.spec}
          measureId="vsPlan"
          onSubmit={(next) => {
            pivot.setSpec(next);
            setEditing(false);
          }}
          onCancel={() => setEditing(false)}
          className="shrink-0"
        />
      ) : null}
      <PivotScroll>
        <PivotTable
          model={pivot.model}
          onToggleGroup={pivot.toggleGroup}
          onDrillThrough={(target) =>
            setDrill({
              title: pivotDrillThroughTitle(pivot.model, target),
              result: pivot.drillThrough(target, { limit: 200 }),
            })
          }
          dimensionWidths={[168]}
          valueWidth={88}
          aria-label="Revenue against plan"
        />
      </PivotScroll>
      {drill ? (
        <PivotDrillThroughPanel
          result={drill.result}
          title={drill.title}
          fields={DRILL_FIELDS}
          fieldLabels={Object.fromEntries(SALES_FIELDS.map((f) => [f.field, f.label ?? f.field]))}
          formats={{ revenue: usd, plan: usd }}
          onClose={() => setDrill(null)}
          maxHeight={200}
          className="shrink-0"
        />
      ) : null}
    </ExampleFrame>
  );
}
