import * as WaterfallChart from "@nqlib/nqchart/waterfall-chart";
import { NAMED_CONFIG, NAMED_DATA } from "../family-dataset";
import { asPart, asRoot } from "../lab-casts";
import type { CaseProbe } from "../use-case-probe";
import { chartClass, ns } from "./shared";

const wfNs = ns(WaterfallChart);
const NQWaterfallChart = asRoot(wfNs.NQWaterfallChart);
const Bars = asPart(wfNs.Bars);
const WfGrid = asPart(wfNs.Grid);
const WfXAxis = asPart(wfNs.XAxis);
const WfYAxis = asPart(wfNs.YAxis);
const WfTooltip = asPart(wfNs.Tooltip);

export default function WaterfallFamily({ probe }: { probe: CaseProbe }) {
  return (
    <NQWaterfallChart
      config={NAMED_CONFIG}
      data={NAMED_DATA}
      className={chartClass}
      chartRef={probe.attachChart}
      onMarkClick={probe.onMarkClick}
    >
      <WfGrid />
      <WfXAxis />
      <WfYAxis />
      <Bars />
      <WfTooltip />
    </NQWaterfallChart>
  );
}
