import * as SparklineChart from "@nqlib/nqchart/sparkline-chart";
import { SPARK_CONFIG, SPARK_DATA } from "../family-dataset";
import { asPart, asRoot } from "../lab-casts";
import type { CaseProbe } from "../use-case-probe";
import { chartClass, ns } from "./shared";

const sparkNs = ns(SparklineChart);
const NQSparklineChart = asRoot(sparkNs.NQSparklineChart);
const Sparkline = asPart(sparkNs.Sparkline);
const SparkFill = asPart(sparkNs.Fill);
const SparkTooltip = asPart(sparkNs.Tooltip);

export default function SparklineFamily({ probe }: { probe: CaseProbe }) {
  return (
    <NQSparklineChart
      config={SPARK_CONFIG}
      data={SPARK_DATA}
      xDataKey="t"
      valueDataKey="value"
      className={chartClass}
      chartRef={probe.attachChart}
      onMarkClick={probe.onMarkClick}
    >
      <SparkFill dataKey="value" />
      <Sparkline dataKey="value" />
      <SparkTooltip />
    </NQSparklineChart>
  );
}
