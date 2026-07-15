import type { ChartConfig } from "@nqlib/nqchart";
import * as AreaC from "@nqlib/nqchart/area-chart";

/*
 * A real nqchart area chart for the landing's chart scene. Split into its own
 * module so echarts is fetched only when that scene first runs — the landing's
 * first paint never pays for it.
 */

const DATA = [
  { month: "Jan", revenue: 186 },
  { month: "Feb", revenue: 245 },
  { month: "Mar", revenue: 213 },
  { month: "Apr", revenue: 298 },
  { month: "May", revenue: 316 },
  { month: "Jun", revenue: 341 },
];

const CONFIG = {
  revenue: {
    label: "Revenue",
    colors: { light: ["var(--chart-1)"], dark: ["var(--chart-1)"] },
  },
} satisfies ChartConfig;

export function MiniChart() {
  return (
    <AreaC.NQAreaChart
      config={CONFIG}
      data={DATA}
      xDataKey="month"
      showBrush={false}
      className="h-full w-full p-4"
    >
      <AreaC.Grid />
      <AreaC.XAxis dataKey="month" />
      <AreaC.Tooltip />
      <AreaC.Area dataKey="revenue" curveType="monotone" />
    </AreaC.NQAreaChart>
  );
}
