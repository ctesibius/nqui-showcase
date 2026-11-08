import { NQFunnelChart, Stages, Tooltip } from "@nqlib/nqchart/funnel-chart";
import { FUNNEL_DATA, FUNNEL_CONFIG } from "./example-datasets";

/** Stages share an edge with no gap — one continuous silhouette. */
export function NQExampleSeamlessFunnelChart() {
  return (
    <NQFunnelChart
      data={FUNNEL_DATA}
      config={FUNNEL_CONFIG}
      className="h-full w-full p-4"
      connection="seamless"
    >
      <Stages connection="seamless" />
      <Tooltip />
    </NQFunnelChart>
  );
}
