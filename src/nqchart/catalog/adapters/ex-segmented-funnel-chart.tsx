import { NQFunnelChart, Stages, Tooltip } from "@nqlib/nqchart/funnel-chart";
import { FUNNEL_DATA, FUNNEL_CONFIG } from "./example-datasets";

/** Sharp trapezoids with a visible gap between stages. */
export function NQExampleSegmentedFunnelChart() {
  return (
    <NQFunnelChart
      data={FUNNEL_DATA}
      config={FUNNEL_CONFIG}
      className="h-full w-full p-4"
      connection="segmented"
      stageGap={8}
    >
      <Stages connection="segmented" stageGap={8} />
      <Tooltip />
    </NQFunnelChart>
  );
}
