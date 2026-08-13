import * as FunnelChart from "@nqlib/nqchart/funnel-chart";
import { NAMED_CONFIG, NAMED_DATA } from "../family-dataset";
import { asPart, asRoot } from "../lab-casts";
import type { CaseProbe } from "../use-case-probe";
import { chartClass, ns } from "./shared";

const funnelNs = ns(FunnelChart);
const NQFunnelChart = asRoot(funnelNs.NQFunnelChart);
const Stages = asPart(funnelNs.Stages);
const FunnelTooltip = asPart(funnelNs.Tooltip);
const FunnelLegend = asPart(funnelNs.Legend);

export default function FunnelFamily({ probe }: { probe: CaseProbe }) {
  return (
    <NQFunnelChart
      config={NAMED_CONFIG}
      data={NAMED_DATA}
      className={chartClass}
      chartRef={probe.attachChart}
      onMarkClick={probe.onMarkClick}
    >
      <Stages />
      <FunnelLegend />
      <FunnelTooltip />
    </NQFunnelChart>
  );
}
