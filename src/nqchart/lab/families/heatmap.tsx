import * as HeatmapChart from "@nqlib/nqchart/heatmap-chart";
import {
  HEATMAP_CELLS,
  HEATMAP_COLS,
  HEATMAP_MAX,
  HEATMAP_MIN,
  HEATMAP_ROWS,
  INTENSITY_CONFIG,
} from "../family-dataset";
import { asPart, asRoot } from "../lab-casts";
import type { CaseProbe } from "../use-case-probe";
import { chartClass, ns } from "./shared";

const heatNs = ns(HeatmapChart);
const NQHeatmapChart = asRoot(heatNs.NQHeatmapChart);
const Heatmap = asPart(heatNs.Heatmap);
const HeatTooltip = asPart(heatNs.Tooltip);

export default function HeatmapFamily({ probe }: { probe: CaseProbe }) {
  return (
    <NQHeatmapChart
      config={INTENSITY_CONFIG}
      data={[]}
      className={chartClass}
      chartRef={probe.attachChart}
      onMarkClick={probe.onMarkClick}
    >
      <Heatmap
        dataKey="intensity"
        data={HEATMAP_CELLS}
        xLabels={HEATMAP_COLS}
        yLabels={HEATMAP_ROWS}
        min={HEATMAP_MIN}
        max={HEATMAP_MAX}
      />
      <HeatTooltip />
    </NQHeatmapChart>
  );
}
