import type { ChartConfig } from "@nqlib/nqchart";
import * as BarC from "@nqlib/nqchart/bar-chart";
import * as FunnelC from "@nqlib/nqchart/funnel-chart";
import { NQCHART_GALLERY } from "../story/nqchart-gallery";
import {
  NQExampleAreaChart,
  NQExampleRadarChart,
} from "../../nqchart/catalog/adapters/ex-doc-charts";
import { NQExamplePieChart } from "../../nqchart/catalog/adapters/ex-pie-chart";

/*
 * Representative nqchart blocks for the /blocks tour.
 * Full registry catalog (backgrounds, tooltips, all variants) lives on /charts.
 *
 * Area / pie / radar use the same adapters as /charts — hand-rolled compact
 * variants were glittering under hover (brush, leader labels, mismatched polar data).
 *
 *   className="h-full w-full p-4"  — docs ChartContainer mount
 *   showBrush={false}             — omit range strip on compact cards (bar/funnel)
 *
 * Stuck dashed cursor / series clipped mid-plot → see
 * `.cursor/skills/nqchart-embed/SKILL.md` (intro×hover race vs hit-test desync).
 */

const DOCS = "h-full w-full p-4";

const hue = (label: string, n: number): ChartConfig[string] => ({
  label,
  colors: { light: [`var(--chart-${n})`], dark: [`var(--chart-${n})`] },
});

/** Same chart as `/charts` → `ex-area-chart`. */
export function TrendBlock() {
  return <NQExampleAreaChart />;
}

const WORKLOAD = [
  { team: "Ava", allocated: 82 },
  { team: "Ben", allocated: 71 },
  { team: "Cleo", allocated: 64 },
  { team: "Dane", allocated: 55 },
];
const WORKLOAD_CFG = { allocated: hue("Allocated", 2) } satisfies ChartConfig;

export function WorkloadBlock() {
  return (
    <BarC.NQBarChart
      config={WORKLOAD_CFG}
      data={WORKLOAD}
      layout="horizontal"
      xDataKey="team"
      showBrush={false}
      className={DOCS}
    >
      <BarC.Grid />
      <BarC.XAxis tickFormatter={(v) => `${v}%`} />
      <BarC.YAxis />
      <BarC.Tooltip />
      <BarC.Bar dataKey="allocated" radius={4} />
    </BarC.NQBarChart>
  );
}

/** Same chart as `/charts` → `ex-pie-chart`. */
export function TrafficBlock() {
  return <NQExamplePieChart />;
}

const PIPE = [
  { stage: "Leads", value: 5200 },
  { stage: "Qualified", value: 2600 },
  { stage: "Proposal", value: 1400 },
  { stage: "Committed", value: 620 },
];
const PIPE_CFG: ChartConfig = {
  Leads: hue("Leads", 1),
  Qualified: hue("Qualified", 2),
  Proposal: hue("Proposal", 3),
  Committed: hue("Committed", 4),
};

export function FunnelBlock() {
  return (
    <FunnelC.NQFunnelChart
      config={PIPE_CFG}
      data={PIPE}
      stageKey="stage"
      valueKey="value"
      taper="soft"
      className={DOCS}
    >
      <FunnelC.Stages />
      <FunnelC.Tooltip />
    </FunnelC.NQFunnelChart>
  );
}

function GalleryChartBlock({ id }: { id: string }) {
  const entry = NQCHART_GALLERY.find((c) => c.id === id);
  if (!entry) throw new Error(`Unknown nqchart gallery id: ${id}`);
  return <>{entry.render()}</>;
}

export function LineBlock() {
  return <GalleryChartBlock id="line" />;
}
export function ComposedBlock() {
  return <GalleryChartBlock id="composed" />;
}
/** Same chart as `/charts` → `ex-radar-chart`. */
export function RadarBlock() {
  return <NQExampleRadarChart />;
}
export function RadialBlock() {
  return <GalleryChartBlock id="radial" />;
}
export function ScatterBlock() {
  return <GalleryChartBlock id="scatter" />;
}
export function WaterfallBlock() {
  return <GalleryChartBlock id="waterfall" />;
}
export function TreemapBlock() {
  return <GalleryChartBlock id="treemap" />;
}
export function HeatmapBlock() {
  return <GalleryChartBlock id="heatmap" />;
}
export function CalendarBlock() {
  return <GalleryChartBlock id="calendar" />;
}
export function SparklineBlock() {
  return <GalleryChartBlock id="sparkline" />;
}
