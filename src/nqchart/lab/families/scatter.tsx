import * as ScatterChart from "@nqlib/nqchart/scatter-chart";
import { LAB_CONFIG } from "../dataset";
import { SCATTER_POINTS } from "../family-dataset";
import { asPart, asRoot } from "../lab-casts";
import type { CaseProbe } from "../use-case-probe";
import { chartClass, ns } from "./shared";

const scatterNs = ns(ScatterChart);
const NQScatterChart = asRoot(scatterNs.NQScatterChart);
const Scatter = asPart(scatterNs.Scatter);
const ScatterGrid = asPart(scatterNs.Grid);
const ScatterXAxis = asPart(scatterNs.XAxis);
const ScatterYAxis = asPart(scatterNs.YAxis);
const ScatterTooltip = asPart(scatterNs.Tooltip);

export default function ScatterFamily({ probe }: { probe: CaseProbe }) {
  return (
    <NQScatterChart
      config={LAB_CONFIG}
      data={[]}
      className={chartClass}
      chartRef={probe.attachChart}
      onMarkClick={probe.onMarkClick}
    >
      <ScatterGrid />
      <ScatterXAxis />
      <ScatterYAxis />
      <ScatterTooltip />
      <Scatter dataKey="planned" data={SCATTER_POINTS} variant="bubble" />
    </NQScatterChart>
  );
}
