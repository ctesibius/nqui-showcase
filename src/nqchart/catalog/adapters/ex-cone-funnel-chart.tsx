import { NQFunnelChart, Stages, Tooltip } from "@nqlib/nqchart/funnel-chart";
import { FUNNEL_DATA, FUNNEL_CONFIG } from "./example-datasets";

/** 3D cone: elliptical rims and a hollow opening on the first stage. */
export function NQExampleConeFunnelChart() {
  return (
    <NQFunnelChart
      data={FUNNEL_DATA}
      config={FUNNEL_CONFIG}
      className="h-full w-full p-4"
      connection="cone"
      coneStyle="hollow"
    >
      <Stages connection="cone" coneStyle="hollow" />
      <Tooltip />
    </NQFunnelChart>
  );
}
