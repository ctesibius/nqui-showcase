/**
 * One live chart per remaining nqchart family.
 *
 * Every root here is handed the same two BI props — `chartRef` and
 * `onMarkClick` — whether or not it declares them. That is the point: a root
 * that ignores them yields no chart handle and no mark events, and the family
 * checks turn that silence into a verdict instead of leaving the family
 * untested. Bar, line, pie and composed are exercised by the groups above.
 */

import * as AreaChart from "@nqlib/nqchart/area-chart";
import * as CalendarChart from "@nqlib/nqchart/calendar-chart";
import * as FunnelChart from "@nqlib/nqchart/funnel-chart";
import * as HeatmapChart from "@nqlib/nqchart/heatmap-chart";
import * as RadarChart from "@nqlib/nqchart/radar-chart";
import * as RadialChart from "@nqlib/nqchart/radial-chart";
import * as ScatterChart from "@nqlib/nqchart/scatter-chart";
import * as SparklineChart from "@nqlib/nqchart/sparkline-chart";
import * as TreemapChart from "@nqlib/nqchart/treemap-chart";
import * as WaterfallChart from "@nqlib/nqchart/waterfall-chart";
import { LAB_CONFIG, LAB_DATA } from "./dataset";
import {
  CALENDAR_CELLS,
  CALENDAR_RANGE,
  HEATMAP_CELLS,
  HEATMAP_COLS,
  HEATMAP_MAX,
  HEATMAP_MIN,
  HEATMAP_ROWS,
  INTENSITY_CONFIG,
  NAMED_CONFIG,
  NAMED_DATA,
  RADAR_DATA,
  RADIAL_CONFIG,
  RADIAL_DATA,
  SCATTER_POINTS,
  SPARK_CONFIG,
  SPARK_DATA,
} from "./family-dataset";
import { asPart, asRoot } from "./nqchart-030";
import type { CaseProbe } from "./use-case-probe";

const ns = (m: unknown) => m as unknown as Record<string, unknown>;

const areaNs = ns(AreaChart);
const NQAreaChart = asRoot(areaNs.NQAreaChart);
const Area = asPart(areaNs.Area);
const AreaGrid = asPart(areaNs.Grid);
const AreaXAxis = asPart(areaNs.XAxis);
const AreaYAxis = asPart(areaNs.YAxis);
const AreaTooltip = asPart(areaNs.Tooltip);
const AreaLegend = asPart(areaNs.Legend);

const calNs = ns(CalendarChart);
const NQCalendarChart = asRoot(calNs.NQCalendarChart);
const Calendar = asPart(calNs.Calendar);
const CalTooltip = asPart(calNs.Tooltip);

const funnelNs = ns(FunnelChart);
const NQFunnelChart = asRoot(funnelNs.NQFunnelChart);
const Stages = asPart(funnelNs.Stages);
const FunnelTooltip = asPart(funnelNs.Tooltip);
const FunnelLegend = asPart(funnelNs.Legend);

const heatNs = ns(HeatmapChart);
const NQHeatmapChart = asRoot(heatNs.NQHeatmapChart);
const Heatmap = asPart(heatNs.Heatmap);
const HeatTooltip = asPart(heatNs.Tooltip);

const radarNs = ns(RadarChart);
const NQRadarChart = asRoot(radarNs.NQRadarChart);
const Radar = asPart(radarNs.Radar);
const PolarGrid = asPart(radarNs.PolarGrid);
const PolarAngleAxis = asPart(radarNs.PolarAngleAxis);
const RadarTooltip = asPart(radarNs.Tooltip);

const radialNs = ns(RadialChart);
const NQRadialChart = asRoot(radialNs.NQRadialChart);
const RadialBar = asPart(radialNs.RadialBar);
const RadialTooltip = asPart(radialNs.Tooltip);

const scatterNs = ns(ScatterChart);
const NQScatterChart = asRoot(scatterNs.NQScatterChart);
const Scatter = asPart(scatterNs.Scatter);
const ScatterGrid = asPart(scatterNs.Grid);
const ScatterXAxis = asPart(scatterNs.XAxis);
const ScatterYAxis = asPart(scatterNs.YAxis);
const ScatterTooltip = asPart(scatterNs.Tooltip);

const sparkNs = ns(SparklineChart);
const NQSparklineChart = asRoot(sparkNs.NQSparklineChart);
const Sparkline = asPart(sparkNs.Sparkline);
const SparkFill = asPart(sparkNs.Fill);
const SparkTooltip = asPart(sparkNs.Tooltip);

const treeNs = ns(TreemapChart);
const NQTreemapChart = asRoot(treeNs.NQTreemapChart);
const Tiles = asPart(treeNs.Tiles);
const TreeTooltip = asPart(treeNs.Tooltip);

const wfNs = ns(WaterfallChart);
const NQWaterfallChart = asRoot(wfNs.NQWaterfallChart);
const Bars = asPart(wfNs.Bars);
const WfGrid = asPart(wfNs.Grid);
const WfXAxis = asPart(wfNs.XAxis);
const WfYAxis = asPart(wfNs.YAxis);
const WfTooltip = asPart(wfNs.Tooltip);

const chartClass = "h-full w-full p-4";

export function AreaFamily({ probe }: { probe: CaseProbe }) {
  return (
    <NQAreaChart
      config={LAB_CONFIG}
      data={LAB_DATA}
      xDataKey="month"
      className={chartClass}
      chartRef={probe.attachChart}
      onMarkClick={probe.onMarkClick}
    >
      <AreaGrid />
      <AreaXAxis dataKey="month" />
      <AreaYAxis />
      <AreaTooltip />
      <AreaLegend />
      <Area dataKey="planned" curveType="monotone" />
      <Area dataKey="actual" curveType="monotone" />
    </NQAreaChart>
  );
}

export function ScatterFamily({ probe }: { probe: CaseProbe }) {
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

export function FunnelFamily({ probe }: { probe: CaseProbe }) {
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

export function WaterfallFamily({ probe }: { probe: CaseProbe }) {
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

export function TreemapFamily({ probe }: { probe: CaseProbe }) {
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

export function RadarFamily({ probe }: { probe: CaseProbe }) {
  return (
    <NQRadarChart
      config={LAB_CONFIG}
      data={RADAR_DATA}
      className={chartClass}
      chartRef={probe.attachChart}
      onMarkClick={probe.onMarkClick}
    >
      <PolarGrid />
      <PolarAngleAxis dataKey="skill" />
      <RadarTooltip />
      <Radar dataKey="planned" />
      <Radar dataKey="actual" />
    </NQRadarChart>
  );
}

export function RadialFamily({ probe }: { probe: CaseProbe }) {
  return (
    <NQRadialChart
      config={RADIAL_CONFIG}
      data={RADIAL_DATA}
      nameKey="series"
      className={chartClass}
      chartRef={probe.attachChart}
      onMarkClick={probe.onMarkClick}
    >
      <RadialBar dataKey="value" />
      <RadialTooltip />
    </NQRadialChart>
  );
}

export function SparklineFamily({ probe }: { probe: CaseProbe }) {
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

export function HeatmapFamily({ probe }: { probe: CaseProbe }) {
  return (
    <NQHeatmapChart
      config={INTENSITY_CONFIG}
      data={[]}
      className={chartClass}
      chartRef={probe.attachChart}
      onMarkClick={probe.onMarkClick}
    >
      <Heatmap
        dataKey="intensity"
        data={HEATMAP_CELLS}
        xLabels={HEATMAP_COLS}
        yLabels={HEATMAP_ROWS}
        min={HEATMAP_MIN}
        max={HEATMAP_MAX}
      />
      <HeatTooltip />
    </NQHeatmapChart>
  );
}

export function CalendarFamily({ probe }: { probe: CaseProbe }) {
  return (
    <NQCalendarChart
      config={INTENSITY_CONFIG}
      data={[]}
      className={chartClass}
      chartRef={probe.attachChart}
      onMarkClick={probe.onMarkClick}
    >
      <Calendar
        dataKey="value"
        data={CALENDAR_CELLS}
        range={CALENDAR_RANGE}
        min={0}
        max={100}
        cellSize={14}
      />
      <CalTooltip />
    </NQCalendarChart>
  );
}
