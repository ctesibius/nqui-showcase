/**
 * One dataset per chart family, kept deliberately small.
 *
 * The family cases do not test what a chart *draws* — `/charts` already proves
 * that 96 ways over. They test whether a family can take part in a BI board at
 * all: does it hand back a chart instance, and does clicking a mark tell you
 * which datum was clicked. So each dataset only has to be plausible and have
 * marks big enough to hit.
 */

import type { ChartConfig } from "@nqlib/nqchart";
import { prepareHeatmapCells } from "@nqlib/nqchart/recipes";
import { chartConfigColor } from "../catalog/adapters/chart-tokens";

export const FAMILY_CONFIG = {
  planned: { label: "Planned cost", colors: chartConfigColor(0) },
  actual: { label: "Actual cost", colors: chartConfigColor(1) },
} satisfies ChartConfig;

export const NAMED_CONFIG = {
  Alpha: { label: "Alpha", colors: chartConfigColor(0) },
  Beta: { label: "Beta", colors: chartConfigColor(1) },
  Gamma: { label: "Gamma", colors: chartConfigColor(2) },
} satisfies ChartConfig;

/** name / value — funnel, treemap, radial, waterfall. */
export const NAMED_DATA = [
  { name: "Alpha", value: 4200 },
  { name: "Beta", value: 3100 },
  { name: "Gamma", value: 1800 },
];

export const RADAR_DATA = [
  { skill: "Scope", planned: 90, actual: 78 },
  { skill: "Cost", planned: 75, actual: 88 },
  { skill: "Schedule", planned: 82, actual: 71 },
  { skill: "Quality", planned: 68, actual: 84 },
  { skill: "Risk", planned: 74, actual: 66 },
];

export const RADIAL_DATA = [{ series: "Utilisation", value: 72 }];

export const RADIAL_CONFIG = {
  Utilisation: { label: "Utilisation", colors: chartConfigColor(0) },
} satisfies ChartConfig;

export const SPARK_DATA = Array.from({ length: 24 }, (_, i) => ({
  t: `T${i}`,
  value: 40 + Math.round(30 * Math.sin(i / 3) + (i % 5) * 2),
}));

export const SPARK_CONFIG = {
  value: { label: "Throughput", colors: chartConfigColor(0) },
} satisfies ChartConfig;

export const SCATTER_POINTS = Array.from({ length: 18 }, (_, i) => ({
  x: 10 + i * 4,
  y: 20 + ((i * 37) % 60),
}));

/**
 * Cells come from the library's own `prepareHeatmapCells` rather than a
 * hand-rolled array. A cell needs `row`/`col` as well as `x`/`y`; inventing the
 * shape produces a chart that renders empty, which would read as a library
 * failure when it is really a malformed fixture.
 */
export const HEATMAP_ROWS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
export const HEATMAP_COLS = ["9am", "12pm", "3pm", "6pm"];

const heatmap = prepareHeatmapCells(HEATMAP_ROWS, HEATMAP_COLS, [
  [12, 28, 45, 22],
  [18, 35, 52, 30],
  [10, 22, 38, 18],
  [24, 42, 58, 36],
  [15, 30, 48, 26],
]);

export const HEATMAP_CELLS = heatmap.cells;
export const HEATMAP_MIN = heatmap.min;
export const HEATMAP_MAX = heatmap.max;

export const INTENSITY_CONFIG = {
  intensity: {
    label: "Sessions",
    colors: {
      light: ["#fff7ed", "#f97316", "#9a3412"],
      dark: ["#431407", "#ea580c", "#fdba74"],
    },
  },
} satisfies ChartConfig;

/** A month of calendar cells in the `CalendarCell` shape: `value`, not a custom key. */
export const CALENDAR_CELLS = Array.from({ length: 28 }, (_, i) => {
  const availableHours = 8;
  const assignedHours = 3 + (i % 6);
  return {
    date: `2026-06-${String(i + 1).padStart(2, "0")}`,
    value: Math.round((assignedHours / availableHours) * 100),
    assignedHours,
    availableHours,
  };
});

export const CALENDAR_RANGE: [string, string] = ["2026-06-01", "2026-06-28"];
