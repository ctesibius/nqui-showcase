/**
 * Lab-only casts. Chart roots are imported as namespaces so a missing 0.3.0
 * export (published npm lag) renders a "requires local nqchart" plate instead
 * of crashing the page. Types for the BI surface come from `@nqlib/nqchart`.
 */

import type { ComponentType, ReactNode, Ref } from "react";
import type {
  ChartBrushRange,
  ChartConfig,
  ChartHandle,
  NQMarkEvent,
} from "@nqlib/nqchart";

export type LabChartRootProps = {
  config: ChartConfig;
  data: Record<string, unknown>[];
  children?: ReactNode;
  className?: string;
  xDataKey?: string;
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
  isClickable?: boolean;
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

export const asRoot = (c: unknown) => c as ComponentType<LabChartRootProps>;
export const asPart = (c: unknown) => c as ComponentType<LabChartPartProps>;

export function optionalPart(
  ns: Record<string, unknown>,
  name: string,
): ComponentType<LabChartPartProps> | null {
  const c = ns[name];
  return typeof c === "function" ? (c as ComponentType<LabChartPartProps>) : null;
}
