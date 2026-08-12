/**
 * The nqchart 0.3.0 surface, declared locally.
 *
 * The lab exists to accept 0.3.0 *before* it is published, so it is written
 * against props the installed `@nqlib/nqchart@0.2.2` types do not describe yet.
 * Without this file `tsc -b` fails on every `onMarkClick`, `chartRef` and
 * `tickFormatter` in the lab, and `pnpm build` cannot run on published deps at all.
 *
 * The runtime already degrades correctly: `case-renders.tsx` reads the new
 * components off the module namespace, and the probe reports "chart handle
 * unavailable" when `chartRef` is a no-op — so on published builds the lab
 * renders and every structural check reads `pending`, never a false pass.
 *
 * **Delete this file when 0.3.0 ships** and import these types from
 * `@nqlib/nqchart` again. Keeping it after that would let the package's real
 * types drift away from what the lab asserts, which is the one thing a release
 * gate must not allow.
 */

import type { ComponentType, ReactNode, Ref } from "react";
import type { ChartConfig } from "@nqlib/nqchart";

export type NQMarkEventModifiers = {
  shift: boolean;
  meta: boolean;
  alt: boolean;
  ctrl: boolean;
};

export type NQMarkEvent = {
  /** Raw category / x value from the datum (not the tick label). */
  category: unknown;
  categoryLabel?: string;
  /** Series `dataKey`, or the raw `nameKey` value for pie / funnel / treemap. */
  seriesKey: string;
  datum: Record<string, unknown>;
  value: number | null;
  /** Index into the root `data` array — absolute, not brush-window relative. */
  index: number;
  modifiers: NQMarkEventModifiers;
};

export type ChartBrushRange = { startIndex: number; endIndex: number };

export type ChartExportOpts = {
  type?: "png" | "svg";
  pixelRatio?: number;
  backgroundColor?: string;
};

export type ChartHandle = {
  /** Underlying ECharts instance — unsupported surface, used here to assert on. */
  getInstance: () => import("echarts/core").EChartsType | null;
  toDataURL: (opts?: ChartExportOpts) => string;
};

/** Props shared by every chart root the lab drives. */
export type LabChartRootProps = {
  config: ChartConfig;
  data: Record<string, unknown>[];
  children?: ReactNode;
  className?: string;
  xDataKey?: string;
  /** Sparkline's value field; radial / waterfall's slice-name field. */
  valueDataKey?: string;
  nameKey?: string;
  showBrush?: boolean;
  isLoading?: boolean;
  error?: ReactNode;
  a11yTable?: boolean;
  a11yLabel?: string;
  onMarkClick?: (event: NQMarkEvent) => void;
  onBrushChange?: (range: ChartBrushRange) => void;
  chartRef?: Ref<ChartHandle | null>;
};

/** Axis / series / legend children — all render `null` and register parts. */
export type LabChartPartProps = {
  dataKey?: string;
  nameKey?: string;
  yAxisId?: string;
  orientation?: "left" | "right";
  domain?: [number, number];
  tickFormatter?: (value: unknown) => string;
  curveType?: "linear" | "monotone" | "step";
  scale?: "linear" | "log";
  reversed?: boolean;
  labelRotate?: number;
  stackId?: string;
  label?: string;
  x?: unknown;
  y?: unknown;
  yAxisIndex?: number;
  tone?: string;
  selected?: string | null;
  onSelectChange?: (key: string | null) => void;
  /** Legends ignore clicks entirely without this — see `case-renders.tsx`. */
  isClickable?: boolean;
  /** Scatter points, heatmap cells, calendar cells — parts that carry own data. */
  data?: Record<string, unknown>[];
  xLabels?: string[];
  yLabels?: string[];
  min?: number;
  max?: number;
  cellSize?: number;
  range?: [string, string];
  variant?: string;
  children?: ReactNode;
};

/**
 * Re-type a component exported by the installed package against the 0.3.0
 * surface. A cast rather than a wrapper so the real component — and any bug in
 * it — is what the lab renders.
 */
export const asRoot = (c: unknown) => c as ComponentType<LabChartRootProps>;
export const asPart = (c: unknown) => c as ComponentType<LabChartPartProps>;

/**
 * Components that only exist on 0.3.0. Returns null on published builds so the
 * case can say what is missing instead of crashing.
 */
export function optionalPart(
  ns: Record<string, unknown>,
  name: string,
): ComponentType<LabChartPartProps> | null {
  const c = ns[name];
  return typeof c === "function" ? (c as ComponentType<LabChartPartProps>) : null;
}
