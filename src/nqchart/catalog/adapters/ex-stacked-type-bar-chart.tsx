import { NQBarChart, Bar, XAxis, Grid, Tooltip, Legend } from "@nqlib/nqchart/bar-chart";
import {
  DUAL_SERIES_CHART_CONFIG,
  formatMonthTickShort,
  TRAFFIC_MONTHLY_DATA,
} from "./example-shared";

export function NQExampleStackedTypeBarChart() {
  return (
    <NQBarChart
      data={[...TRAFFIC_MONTHLY_DATA]}
      config={DUAL_SERIES_CHART_CONFIG}
      className="h-full w-full p-4"
      xDataKey="month"
      stackType="stacked"
    >
      <Grid />
      <XAxis dataKey="month" tickFormatter={formatMonthTickShort} />
      <Legend isClickable />
      <Tooltip />
      <Bar dataKey="desktop" />
      <Bar dataKey="mobile" />
    </NQBarChart>
  );
}
