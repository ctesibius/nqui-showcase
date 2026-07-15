import { NQAreaChart, Area, XAxis, Grid, Legend, Tooltip } from "@nqlib/nqchart/area-chart";
import {
  DUAL_SERIES_CHART_CONFIG,
  TRAFFIC_MONTHLY_DATA,
  formatMonthTickShort,
} from "../../nqchart/catalog/adapters/example-shared";

/*
 * Same series/composition as `/charts` → `ex-area-chart`, tuned for the landing
 * living window (~300–360px tall):
 * - showBrush={false} — NQChartBrush defaults to 52px+chrome (~76px) with no
 *   public height prop; in this frame it crushed the plot into a hairline.
 * - aspect-auto — without a brush footer, ChartContainer would force aspect-video.
 */

export function MiniChart() {
  return (
    <NQAreaChart
      data={[...TRAFFIC_MONTHLY_DATA]}
      config={DUAL_SERIES_CHART_CONFIG}
      className="aspect-auto h-full min-h-0 w-full p-2"
      xDataKey="month"
      stackType="default"
      showBrush={false}
    >
      <Grid />
      <XAxis dataKey="month" tickFormatter={formatMonthTickShort} />
      <Legend isClickable />
      <Tooltip />
      <Area dataKey="desktop" variant="gradient" curveType="monotone" />
      <Area dataKey="mobile" variant="gradient" curveType="monotone" />
    </NQAreaChart>
  );
}
