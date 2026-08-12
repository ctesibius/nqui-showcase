import type { ChartConfig } from "@nqlib/nqchart";
import { chartConfigColor } from "../catalog/adapters/chart-tokens";

/** Plan-vs-actual cost (USD) + on-time delivery (%). One deliberate null for gap vs zero. */
export type LabRow = {
  month: string;
  planned: number | null;
  actual: number | null;
  otd: number | null;
};

export const LAB_DATA: LabRow[] = [
  { month: "2026-01", planned: 420_000, actual: 398_400, otd: 0.91 },
  { month: "2026-02", planned: 435_000, actual: 451_200, otd: 0.88 },
  { month: "2026-03", planned: 410_000, actual: 402_900, otd: 0.94 },
  { month: "2026-04", planned: 455_000, actual: 470_100, otd: 0.86 },
  // Genuine gap — actual has not landed. Must draw as a gap, never a zero.
  { month: "2026-05", planned: 460_000, actual: null, otd: 0.9 },
  { month: "2026-06", planned: 470_000, actual: 462_800, otd: 0.93 },
];

export const LAB_CONFIG = {
  planned: { label: "Planned cost", colors: chartConfigColor(0) },
  actual: { label: "Actual cost", colors: chartConfigColor(1) },
  otd: { label: "On-time delivery", colors: chartConfigColor(2) },
} satisfies ChartConfig;

export const PIE_DATA = [
  { name: "Alpha", value: 40 },
  { name: "Beta", value: 35 },
  { name: "Gamma", value: 25 },
];

export const PIE_CONFIG = {
  Alpha: { label: "Alpha", colors: chartConfigColor(0) },
  Beta: { label: "Beta", colors: chartConfigColor(1) },
  Gamma: { label: "Gamma", colors: chartConfigColor(2) },
} satisfies ChartConfig;

/** 40 categories for labelRotate stress. */
export const ROTATE_DATA = Array.from({ length: 40 }, (_, i) => ({
  month: `M${String(i + 1).padStart(2, "0")}`,
  planned: 300_000 + ((i * 17_000) % 200_000),
  actual: 280_000 + ((i * 13_000) % 220_000),
  otd: 0.8 + ((i % 10) / 100),
}));

/** Wide positive spread for log scale (no zeros / negatives). */
export const LOG_DATA: LabRow[] = [
  { month: "2026-01", planned: 1_200, actual: 980, otd: 0.9 },
  { month: "2026-02", planned: 18_000, actual: 16_400, otd: 0.88 },
  { month: "2026-03", planned: 95_000, actual: 102_000, otd: 0.92 },
  { month: "2026-04", planned: 480_000, actual: 455_000, otd: 0.87 },
  { month: "2026-05", planned: 1_200_000, actual: null, otd: 0.91 },
  { month: "2026-06", planned: 2_400_000, actual: 2_150_000, otd: 0.93 },
];

export const formatUsd = (v: unknown) =>
  typeof v === "number"
    ? `$${new Intl.NumberFormat(undefined, {
        notation: "compact",
        maximumFractionDigits: 1,
      }).format(v)}`
    : String(v ?? "");

export const formatPct = (v: unknown) =>
  typeof v === "number"
    ? new Intl.NumberFormat(undefined, {
        style: "percent",
        maximumFractionDigits: 0,
      }).format(v)
    : String(v ?? "");
