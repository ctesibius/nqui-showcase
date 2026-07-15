import { NQBarChart, Bar, XAxis, YAxis, Grid, Tooltip, Legend } from "@nqlib/nqchart/bar-chart";
import { type ChartConfig } from "@nqlib/nqchart";
import { TRAFFIC_MONTHLY_DATA } from "./example-shared";

const horizontalData = TRAFFIC_MONTHLY_DATA.slice(0, 6).map(({ month, desktop }) => ({
  month,
  desktop,
}));

const chartConfig = {
  desktop: {
    label: "Desktop",
    colors: {
      light: ["#047857"],
      dark: ["#10b981"],
    },
  },
} satisfies ChartConfig;

export function NQExampleHorizontalLayoutBarChart() {
  return (
    <NQBarChart
      data={horizontalData}
      config={chartConfig}
      className="h-full w-full p-4"
      xDataKey="month"
      layout="horizontal"
    >
      <Grid />
      <XAxis />
      <YAxis />
      <Legend />
      <Tooltip />
      <Bar dataKey="desktop" />
    </NQBarChart>
  );
}
