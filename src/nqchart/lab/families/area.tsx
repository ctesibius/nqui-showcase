import * as AreaChart from "@nqlib/nqchart/area-chart";
import { LAB_CONFIG, LAB_DATA } from "../dataset";
import { asPart, asRoot } from "../lab-casts";
import type { CaseProbe } from "../use-case-probe";
import { chartClass, ns } from "./shared";

const areaNs = ns(AreaChart);
const NQAreaChart = asRoot(areaNs.NQAreaChart);
const Area = asPart(areaNs.Area);
const AreaGrid = asPart(areaNs.Grid);
const AreaXAxis = asPart(areaNs.XAxis);
const AreaYAxis = asPart(areaNs.YAxis);
const AreaTooltip = asPart(areaNs.Tooltip);
const AreaLegend = asPart(areaNs.Legend);

export default function AreaFamily({ probe }: { probe: CaseProbe }) {
  return (
    <NQAreaChart
      config={LAB_CONFIG}
      data={LAB_DATA}
      xDataKey="month"
      className={chartClass}
      chartRef={probe.attachChart}
      onMarkClick={probe.onMarkClick}
    >
      <AreaGrid />
      <AreaXAxis dataKey="month" />
      <AreaYAxis />
      <AreaTooltip />
      <AreaLegend />
      <Area dataKey="planned" curveType="monotone" />
      <Area dataKey="actual" curveType="monotone" />
    </NQAreaChart>
  );
}
