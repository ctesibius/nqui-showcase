import * as TreemapChart from "@nqlib/nqchart/treemap-chart";
import { NAMED_CONFIG, NAMED_DATA } from "../family-dataset";
import { asPart, asRoot } from "../lab-casts";
import type { CaseProbe } from "../use-case-probe";
import { chartClass, ns } from "./shared";

const treeNs = ns(TreemapChart);
const NQTreemapChart = asRoot(treeNs.NQTreemapChart);
const Tiles = asPart(treeNs.Tiles);
const TreeTooltip = asPart(treeNs.Tooltip);

export default function TreemapFamily({ probe }: { probe: CaseProbe }) {
  return (
    <NQTreemapChart
      config={NAMED_CONFIG}
      data={NAMED_DATA}
      className={chartClass}
      chartRef={probe.attachChart}
      onMarkClick={probe.onMarkClick}
    >
      <Tiles />
      <TreeTooltip />
    </NQTreemapChart>
  );
}
