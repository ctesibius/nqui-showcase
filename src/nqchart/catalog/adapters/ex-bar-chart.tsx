import { NQBarChart, Bar, XAxis, Grid, Tooltip, Legend } from "@nqlib/nqchart/bar-chart";
import {
  DUAL_SERIES_CHART_CONFIG,
  formatMonthTickShort,
  TRAFFIC_MONTHLY_DATA,
} from "./example-shared";

export function NQExampleBarChart() {
  return (
    <NQBarChart
      data={[...TRAFFIC_MONTHLY_DATA]}
      config={DUAL_SERIES_CHART_CONFIG}
      className="h-full w-full p-4"
      xDataKey="month"
      showBrush={false}
      brushFormatLabel={formatMonthTickShort}
    >
      <Grid />
      <XAxis dataKey="month" tickFormatter={formatMonthTickShort} />
      <Legend isClickable />
      <Tooltip />
      <Bar dataKey="desktop" variant="default" />
      <Bar dataKey="mobile" variant="default" />
    </NQBarChart>
  );
}
