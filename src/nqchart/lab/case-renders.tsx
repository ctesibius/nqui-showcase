import { useState } from "react";
import { Button } from "@nqlib/nqui";
import * as Composed from "@nqlib/nqchart/composed-chart";
import * as LineChart from "@nqlib/nqchart/line-chart";
import * as BarChart from "@nqlib/nqchart/bar-chart";
import * as PieChart from "@nqlib/nqchart/pie-chart";
import {
  LAB_CONFIG,
  LAB_DATA,
  LOG_DATA,
  PIE_CONFIG,
  PIE_DATA,
  ROTATE_DATA,
  formatPct,
  formatUsd,
} from "./dataset";
import { asPart, asRoot } from "./lab-casts";
import type { CaseProbe } from "./use-case-probe";

const composedNs = Composed as unknown as Record<string, unknown>;

const NQComposedChart = asRoot(composedNs.NQComposedChart);
const Bar = asPart(composedNs.Bar);
const Line = asPart(composedNs.Line);
const Grid = asPart(composedNs.Grid);
const XAxis = asPart(composedNs.XAxis);
const YAxis = asPart(composedNs.YAxis);
const Tooltip = asPart(composedNs.Tooltip);
const Legend = asPart(composedNs.Legend);
const Area = asPart(composedNs.Area);
const ReferenceLine = asPart(composedNs.ReferenceLine);
const ReferenceBand = asPart(composedNs.ReferenceBand);

const lineNs = LineChart as unknown as Record<string, unknown>;
const NQLineChart = asRoot(lineNs.NQLineChart);
const SoloLine = asPart(lineNs.Line);
const LineGrid = asPart(lineNs.Grid);
const LineXAxis = asPart(lineNs.XAxis);
const LineYAxis = asPart(lineNs.YAxis);
const LineTooltip = asPart(lineNs.Tooltip);
const LineLegend = asPart(lineNs.Legend);

const barNs = BarChart as unknown as Record<string, unknown>;
const NQBarChart = asRoot(barNs.NQBarChart);
const SoloBar = asPart(barNs.Bar);
const BarGrid = asPart(barNs.Grid);
const BarXAxis = asPart(barNs.XAxis);
const BarYAxis = asPart(barNs.YAxis);
const BarTooltip = asPart(barNs.Tooltip);

const pieNs = PieChart as unknown as Record<string, unknown>;
const NQPieChart = asRoot(pieNs.NQPieChart);
const Pie = asPart(pieNs.Pie);
const PieLegend = asPart(pieNs.Legend);
const PieTooltip = asPart(pieNs.Tooltip);

const chartClass = "h-full w-full p-4";

export function DualAxisComposed({
  probe,
  clickable = false,
  showBrush = false,
  legendSelected,
  onLegendSelect,
  withRefs = false,
  withArea = false,
}: {
  probe: CaseProbe;
  /** Bind onMarkClick. Off for the cursor case, which must see no handler. */
  clickable?: boolean;
  showBrush?: boolean;
  legendSelected?: string | null;
  onLegendSelect?: (key: string | null) => void;
  withRefs?: boolean;
  withArea?: boolean;
}) {
  return (
    <NQComposedChart
      config={LAB_CONFIG}
      data={LAB_DATA}
      xDataKey="month"
      className={chartClass}
      showBrush={showBrush}
      chartRef={probe.attachChart}
      onMarkClick={clickable ? probe.onMarkClick : undefined}
      onBrushChange={showBrush ? probe.onBrushChange : undefined}
    >
      <Grid />
      <XAxis dataKey="month" />
      <YAxis yAxisId="left" tickFormatter={formatUsd} />
      <YAxis yAxisId="right" orientation="right" tickFormatter={formatPct} />
      <Tooltip />
      {/*
        `isClickable` is not optional decoration — `ChartLegendContent` bails out
        of its click handler without it, so a legend given `onSelectChange` but
        not `isClickable` silently never fires.
      */}
      <Legend
        isClickable={Boolean(onLegendSelect)}
        selected={legendSelected}
        onSelectChange={
          onLegendSelect
            ? (key: string | null) => {
                onLegendSelect(key);
                probe.onLegendSelect(key);
              }
            : undefined
        }
      />
      {withRefs ? (
        <>
          <ReferenceBand y={[400_000, 450_000]} yAxisId="left" />
          <ReferenceLine y={430_000} yAxisId="left" label="Budget" />
        </>
      ) : null}
      <Bar dataKey="planned" yAxisId="left" />
      <Bar dataKey="actual" yAxisId="left" />
      {/*
        Area and Line must not share a dataKey — two parts on `otd` give the
        legend two children with the same React key. The area case therefore
        swaps the line out rather than sitting beside it; ECharts compiles an
        area as a line series with `areaStyle`, so the composition check still
        sees bar + line + area.
      */}
      {withArea ? (
        <Area dataKey="otd" yAxisId="right" />
      ) : (
        <Line dataKey="otd" yAxisId="right" curveType="monotone" />
      )}
    </NQComposedChart>
  );
}

export function ControlledLegendCase({ probe }: { probe: CaseProbe }) {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <DualAxisComposed probe={probe} legendSelected={selected} onLegendSelect={setSelected} />
  );
}

export function ExportCase({ probe }: { probe: CaseProbe }) {
  return (
    <div className="flex size-full min-h-0 flex-col">
      <div className="min-h-0 flex-1">
        <NQComposedChart
          config={LAB_CONFIG}
          data={LAB_DATA}
          xDataKey="month"
          className={chartClass}
          chartRef={probe.attachChart}
        >
          <Grid />
          <XAxis dataKey="month" />
          <YAxis yAxisId="left" tickFormatter={formatUsd} />
          <YAxis yAxisId="right" orientation="right" tickFormatter={formatPct} />
          <Tooltip />
          <Legend />
          <Bar dataKey="planned" yAxisId="left" />
          <Bar dataKey="actual" yAxisId="left" />
          <Line dataKey="otd" yAxisId="right" curveType="monotone" />
        </NQComposedChart>
      </div>
      <div className="shrink-0 px-3 pb-3">
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-7 text-xs"
          onClick={probe.runExport}
        >
          Export PNG
        </Button>
      </div>
    </div>
  );
}

/**
 * Bars only, on an axis with deliberate headroom (data tops out at 470K against
 * a 1M domain). "Background" has to be decidable from geometry alone, and on the
 * dual-axis chart it is not: the on-time-delivery line sits at ~90% of the right
 * axis and the tallest bar reaches the top 6% of the left, so there is no region
 * a check could call empty. Here the upper third is guaranteed free of marks.
 */
export function EmptyPlotCase({ probe }: { probe: CaseProbe }) {
  return (
    <NQBarChart
      config={LAB_CONFIG}
      data={LAB_DATA}
      xDataKey="month"
      className={chartClass}
      chartRef={probe.attachChart}
      onMarkClick={probe.onMarkClick}
    >
      <BarGrid />
      <BarXAxis dataKey="month" />
      <BarYAxis domain={[0, 1_000_000]} tickFormatter={formatUsd} />
      <BarTooltip />
      <SoloBar dataKey="planned" />
      <SoloBar dataKey="actual" />
    </NQBarChart>
  );
}

export function NoHandlerCase({ probe }: { probe: CaseProbe }) {
  return (
    <NQBarChart
      config={LAB_CONFIG}
      data={LAB_DATA}
      xDataKey="month"
      className={chartClass}
      chartRef={probe.attachChart}
    >
      <BarGrid />
      <BarXAxis dataKey="month" />
      <BarYAxis tickFormatter={formatUsd} />
      <BarTooltip />
      <SoloBar dataKey="planned" />
      <SoloBar dataKey="actual" />
    </NQBarChart>
  );
}

export function LineClickCase({ probe }: { probe: CaseProbe }) {
  return (
    <NQLineChart
      config={LAB_CONFIG}
      data={LAB_DATA}
      xDataKey="month"
      className={chartClass}
      chartRef={probe.attachChart}
      onMarkClick={probe.onMarkClick}
    >
      <LineGrid />
      <LineXAxis dataKey="month" />
      <LineYAxis tickFormatter={formatPct} />
      <LineTooltip />
      <LineLegend />
      <SoloLine dataKey="otd" curveType="monotone" />
    </NQLineChart>
  );
}

export function PieClickCase({ probe }: { probe: CaseProbe }) {
  return (
    <NQPieChart
      config={PIE_CONFIG}
      data={PIE_DATA}
      className={chartClass}
      chartRef={probe.attachChart}
      onMarkClick={probe.onMarkClick}
    >
      <Pie dataKey="value" nameKey="name" />
      <PieTooltip />
      <PieLegend />
    </NQPieChart>
  );
}

export function UncontrolledLegendCase({ probe }: { probe: CaseProbe }) {
  return (
    <NQComposedChart
      config={LAB_CONFIG}
      data={LAB_DATA}
      xDataKey="month"
      className={chartClass}
      chartRef={probe.attachChart}
    >
      <Grid />
      <XAxis dataKey="month" />
      <YAxis yAxisId="left" tickFormatter={formatUsd} />
      <YAxis yAxisId="right" orientation="right" tickFormatter={formatPct} />
      <Tooltip />
      {/* Clickable, but with no `selected` / `onSelectChange` — the 0.2.2 default. */}
      <Legend isClickable />
      <Bar dataKey="planned" yAxisId="left" />
      <Bar dataKey="actual" yAxisId="left" />
      <Line dataKey="otd" yAxisId="right" curveType="monotone" />
    </NQComposedChart>
  );
}

export function YAxisIdFallbackCase({ probe }: { probe: CaseProbe }) {
  return (
    <NQComposedChart
      config={LAB_CONFIG}
      data={LAB_DATA}
      xDataKey="month"
      className={chartClass}
      chartRef={probe.attachChart}
    >
      <Grid />
      <XAxis dataKey="month" />
      <YAxis tickFormatter={formatUsd} />
      <Tooltip />
      <Legend />
      <Bar dataKey="planned" yAxisId="right" />
      <Bar dataKey="actual" yAxisId="right" />
    </NQComposedChart>
  );
}

export function LogScaleCase({ probe }: { probe: CaseProbe }) {
  return (
    <NQComposedChart
      config={LAB_CONFIG}
      data={LOG_DATA}
      xDataKey="month"
      className={chartClass}
      chartRef={probe.attachChart}
    >
      <Grid />
      <XAxis dataKey="month" />
      <YAxis scale="log" tickFormatter={formatUsd} />
      <Tooltip />
      <Legend />
      <Bar dataKey="planned" />
      <Bar dataKey="actual" />
    </NQComposedChart>
  );
}

export function ReversedAxisCase({ probe }: { probe: CaseProbe }) {
  return (
    <NQBarChart
      config={LAB_CONFIG}
      data={LAB_DATA}
      xDataKey="month"
      className={chartClass}
      chartRef={probe.attachChart}
    >
      <BarGrid />
      <BarXAxis dataKey="month" />
      <BarYAxis reversed tickFormatter={formatUsd} />
      <BarTooltip />
      <SoloBar dataKey="planned" />
    </NQBarChart>
  );
}

export function LabelRotateCase({ probe }: { probe: CaseProbe }) {
  return (
    <NQBarChart
      config={LAB_CONFIG}
      data={ROTATE_DATA}
      xDataKey="month"
      className={chartClass}
      chartRef={probe.attachChart}
    >
      <BarGrid />
      <BarXAxis dataKey="month" labelRotate={45} />
      <BarYAxis tickFormatter={formatUsd} />
      <BarTooltip />
      <SoloBar dataKey="planned" />
    </NQBarChart>
  );
}

export function EmptyStateCase({ probe }: { probe: CaseProbe }) {
  return (
    <NQComposedChart
      config={LAB_CONFIG}
      data={[]}
      xDataKey="month"
      className={chartClass}
      chartRef={probe.attachChart}
    >
      <Grid />
      <XAxis dataKey="month" />
      <YAxis />
      <Bar dataKey="planned" />
    </NQComposedChart>
  );
}

export function ErrorStateCase({ probe }: { probe: CaseProbe }) {
  return (
    <NQComposedChart
      config={LAB_CONFIG}
      data={LAB_DATA}
      xDataKey="month"
      className={chartClass}
      chartRef={probe.attachChart}
      error={<span className="text-sm text-destructive">Failed to load series</span>}
    >
      <Grid />
      <XAxis dataKey="month" />
      <YAxis />
      <Bar dataKey="planned" />
    </NQComposedChart>
  );
}

export function LoadingStateCase({ probe }: { probe: CaseProbe }) {
  return (
    <NQComposedChart
      config={LAB_CONFIG}
      data={LAB_DATA}
      xDataKey="month"
      className={chartClass}
      chartRef={probe.attachChart}
      isLoading
    >
      <Grid />
      <XAxis dataKey="month" />
      <YAxis />
      <Bar dataKey="planned" />
    </NQComposedChart>
  );
}

export function A11yTableCase({ probe }: { probe: CaseProbe }) {
  return (
    <NQComposedChart
      config={LAB_CONFIG}
      data={LAB_DATA}
      xDataKey="month"
      className={chartClass}
      chartRef={probe.attachChart}
      a11yTable
      a11yLabel="Plan versus actual cost"
    >
      <Grid />
      <XAxis dataKey="month" />
      <YAxis yAxisId="left" tickFormatter={formatUsd} />
      <YAxis yAxisId="right" orientation="right" tickFormatter={formatPct} />
      <Tooltip />
      <Legend />
      <Bar dataKey="planned" yAxisId="left" />
      <Bar dataKey="actual" yAxisId="left" />
      <Line dataKey="otd" yAxisId="right" curveType="monotone" />
    </NQComposedChart>
  );
}
