import { NQFunnelChart, Stages, Tooltip } from "@nqlib/nqchart/funnel-chart";
import { FUNNEL_DATA, FUNNEL_CONFIG } from "./example-datasets";

/** Curved trapezoid: shared edges, rim curves, optional corner radius and side bow. */
export function NQExampleRoundedFunnelChart() {
  return (
    <NQFunnelChart
      data={FUNNEL_DATA}
      config={FUNNEL_CONFIG}
      className="h-full w-full p-4"
      connection="rounded"
      cornerRadius={14}
      sideCurve={0.2}
      stageGap={10}
      label="value"
    >
      <Stages connection="rounded" cornerRadius={14} sideCurve={0.2} stageGap={10} />
      <Tooltip />
    </NQFunnelChart>
  );
}
