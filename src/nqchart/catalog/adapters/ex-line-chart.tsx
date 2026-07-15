import { NQLineChart, Line, XAxis, Grid, Legend, Tooltip } from "@nqlib/nqchart/line-chart";
import {
  DUAL_SERIES_CHART_CONFIG,
  formatMonthTickShort,
  TRAFFIC_MONTHLY_DATA,
} from "./example-shared";

export function NQExampleLineChart() {
  return (
    <NQLineChart
      data={[...TRAFFIC_MONTHLY_DATA]}
      config={DUAL_SERIES_CHART_CONFIG}
      className="h-full w-full p-4"
      xDataKey="month"
    >
      <Grid />
      <XAxis dataKey="month" tickFormatter={formatMonthTickShort} />
      <Legend />
      <Tooltip />
      <Line dataKey="desktop" />
      <Line dataKey="mobile" curveType="monotone" />
    </NQLineChart>
  );
}
