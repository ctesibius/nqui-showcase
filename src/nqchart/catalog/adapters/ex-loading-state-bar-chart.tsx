import { NQBarChart, Bar, XAxis, Grid, Tooltip, Legend } from "@nqlib/nqchart/bar-chart";
import {
  DUAL_SERIES_CHART_CONFIG,
  formatMonthTickShort,
  TRAFFIC_MONTHLY_DATA,
} from "./example-shared";

export function NQExampleLoadingStateBarChart() {
  return (
    <NQBarChart
      data={[...TRAFFIC_MONTHLY_DATA]}
      config={DUAL_SERIES_CHART_CONFIG}
      className="h-full w-full p-4"
      xDataKey="month"
      isLoading
    >
      <Grid />
      <XAxis dataKey="month" tickFormatter={formatMonthTickShort} />
      <Legend />
      <Tooltip />
      <Bar dataKey="desktop" />
      <Bar dataKey="mobile" />
    </NQBarChart>
  );
}
