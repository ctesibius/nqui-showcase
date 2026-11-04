import type { PivotSpec } from "@nqlib/nqgrid/core";
import { PivotTable, usePivotGrid } from "@nqlib/nqgrid/pivot";
import { BOOKINGS, BOOKINGS_FIELDS, usdCompact } from "../blocks/pivot-data";

/*
 * The landing window's pivot scene: the same 1,400 deals as the Bookings review
 * block on /blocks, aggregated live by the nqgrid engine. Lazy-loaded by
 * `live-window.tsx` the first time the scene shows, so the landing's first paint
 * never pays for the engine.
 */
const SPEC: PivotSpec = {
  version: 1,
  id: "landing-pivot",
  rows: [
    { field: "region", label: "Region", sortBy: { measure: "arr" } },
    { field: "country", label: "Country", sortBy: { measure: "arr" } },
  ],
  columns: { field: "closeDate:quarter", label: "Fiscal quarter" },
  measures: [{ id: "arr", field: "arr", label: "ARR", format: usdCompact }],
  layout: "compact",
  // Regions only at first; a chevron opens the countries.
  expanded: "none",
  heat: { measure: "arr", scope: "column", applyTo: "group" },
  totals: { grandTotalLabel: "Total" },
  fields: BOOKINGS_FIELDS,
};

export function MiniPivot() {
  const pivot = usePivotGrid(SPEC, BOOKINGS);
  return (
    <PivotTable
      model={pivot.model}
      onToggleGroup={pivot.toggleGroup}
      dimensionWidths={[128]}
      valueWidth={76}
      rowHeight={30}
      headRowHeight={28}
      aria-label="New ARR by region and fiscal quarter"
    />
  );
}
