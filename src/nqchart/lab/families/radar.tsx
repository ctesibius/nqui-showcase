import * as RadarChart from "@nqlib/nqchart/radar-chart";
import { LAB_CONFIG } from "../dataset";
import { RADAR_DATA } from "../family-dataset";
import { asPart, asRoot } from "../lab-casts";
import type { CaseProbe } from "../use-case-probe";
import { chartClass, ns } from "./shared";

const radarNs = ns(RadarChart);
const NQRadarChart = asRoot(radarNs.NQRadarChart);
const Radar = asPart(radarNs.Radar);
const PolarGrid = asPart(radarNs.PolarGrid);
const PolarAngleAxis = asPart(radarNs.PolarAngleAxis);
const RadarTooltip = asPart(radarNs.Tooltip);

export default function RadarFamily({ probe }: { probe: CaseProbe }) {
  return (
    <NQRadarChart
      config={LAB_CONFIG}
      data={RADAR_DATA}
      className={chartClass}
      chartRef={probe.attachChart}
      onMarkClick={probe.onMarkClick}
    >
      <PolarGrid />
      <PolarAngleAxis dataKey="skill" />
      <RadarTooltip />
      <Radar dataKey="planned" />
      <Radar dataKey="actual" />
    </NQRadarChart>
  );
}
