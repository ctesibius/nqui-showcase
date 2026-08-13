import * as RadialChart from "@nqlib/nqchart/radial-chart";
import { RADIAL_CONFIG, RADIAL_DATA } from "../family-dataset";
import { asPart, asRoot } from "../lab-casts";
import type { CaseProbe } from "../use-case-probe";
import { chartClass, ns } from "./shared";

const radialNs = ns(RadialChart);
const NQRadialChart = asRoot(radialNs.NQRadialChart);
const RadialBar = asPart(radialNs.RadialBar);
const RadialTooltip = asPart(radialNs.Tooltip);

export default function RadialFamily({ probe }: { probe: CaseProbe }) {
  return (
    <NQRadialChart
      config={RADIAL_CONFIG}
      data={RADIAL_DATA}
      nameKey="series"
      className={chartClass}
      chartRef={probe.attachChart}
      onMarkClick={probe.onMarkClick}
    >
      <RadialBar dataKey="value" />
      <RadialTooltip />
    </NQRadialChart>
  );
}
