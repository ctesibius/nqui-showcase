import type { AxisOrientation } from "./echarts-probe";
import type { ChartBrushRange, NQMarkEvent } from "@nqlib/nqchart";

export type CheckStatus = "pass" | "fail" | "pending";

/** A single assertion. Never settable by a human — always derived from evidence. */
export type CheckResult = {
  id: string;
  label: string;
  status: CheckStatus;
  /** Shown while pending: what the tester still has to do. */
  need?: string;
  /** Shown on pass/fail: what was actually observed. */
  detail?: string;
};

export type Modifiers = {
  shift: boolean;
  meta: boolean;
  alt: boolean;
  ctrl: boolean;
};

/** One rendered zrender text node — the labels a tester would actually read. */
export type RenderedText = {
  text: string;
  rotation: number;
  x: number;
  y: number;
};

/**
 * A raw canvas click, classified independently of whether the library chose to
 * emit a mark event. This is what makes the negative cases ("must not fire")
 * decidable: we know where the pointer landed and whether a mark event followed.
 */
export type RawClick = {
  x: number;
  y: number;
  /** Inside the cartesian plot rect (false ⇒ axis gutter / outside). */
  inGrid: boolean;
  /** Category index under the pointer, or null when off-grid / non-cartesian. */
  dataIndex: number | null;
  /** Did an onMarkClick fire for this same pointer interaction? */
  hitMark: boolean;
  /** Modifier keys actually held at pointerdown — the ground truth. */
  modifiers: Modifiers;
};

/** A mark event paired with the modifier state genuinely held when it fired. */
export type MarkSample = {
  event: NQMarkEvent;
  /** Ground truth captured from the DOM pointer event, not from the payload. */
  actualModifiers: Modifiers;
  /** Fired via keyboard Enter rather than a pointer. */
  fromKeyboard: boolean;
};

export type ExportSample = {
  ok: boolean;
  isPng: boolean;
  opaque: boolean;
  /** Sampled corner pixel, for the detail line. */
  corner: string;
  bytes: number;
};

/** Everything the harness observed for one case. Checks are pure functions of this. */
export type CaseEvidence = {
  /** ECharts instance reachable — false on published builds without `chartRef`. */
  ready: boolean;
  /** Compiled ECharts option — the library's output, not our input. */
  option: EChartsOptionLike | null;
  /** Rendered text nodes from the zrender display list. Often empty — see `axisTicks`. */
  texts: RenderedText[];
  /** Tick labels as the chart will draw them, from the axis model + formatter. */
  axisTicks: { x: string[]; yLeft: string[]; yRight: string[] };
  /** Pixel x of each category on the first x axis, for label-spacing checks. */
  categoryPixels: number[];
  /** Case DOM root, for a11y / state-plate assertions. */
  root: HTMLElement | null;
  /** Rect at which the plot area sits, for geometry checks. */
  gridRect: { x: number; y: number; width: number; height: number } | null;
  /** Y axis direction measured from geometry, not from the `inverse` prop. */
  yAxisOrientation: AxisOrientation | null;

  /**
   * The poll for a chart handle gave up. Distinguishes "still initialising"
   * from "this chart family does not accept `chartRef` at all" — the latter is
   * a finding, not a wait.
   */
  handleTimedOut: boolean;

  marks: MarkSample[];
  rawClicks: RawClick[];
  /**
   * Clicks counted on the case root. Unlike `rawClicks` this needs no chart
   * handle, so a family with no interaction API can still be judged: N clicks
   * and zero mark events is evidence, not an opinion.
   */
  domClicks: number;
  legendSelections: (string | null)[];
  brushRanges: ChartBrushRange[];
  /**
   * How many categories the chart actually plotted after each brush event.
   *
   * nqchart's brush is a React component that slices `data` before compiling,
   * not an ECharts `dataZoom` — so there is no `startValue`/`endValue` to read
   * back. The honest cross-check is the point count: a window of 0…3 must draw
   * four categories, whatever the event claims.
   */
  brushPlotted: number[];
  arrowKeys: number;
  exportSample: ExportSample | null;
  /**
   * ECharts `is used but not imported` messages captured on this page.
   * Page-level — a warning from any chart fails every case that reads this.
   */
  importWarnings: string[];

  reducedMotion: boolean;
  /** Bumped by the Re-run button so checks re-read the option. */
  epoch: number;
};

/** Loose view of the compiled option — ECharts' own types are too strict to read. */
export type EChartsOptionLike = {
  series?: SeriesLike[];
  xAxis?: AxisLike[];
  yAxis?: AxisLike[];
  legend?: LegendLike[];
  dataZoom?: DataZoomLike[];
  calendar?: unknown;
  visualMap?: unknown;
  radar?: unknown;
  polar?: unknown;
  animation?: boolean;
  animationDuration?: number | ((idx: number) => number);
  [key: string]: unknown;
};

export type SeriesLike = {
  id?: string;
  name?: string;
  type?: string;
  cursor?: string;
  yAxisIndex?: number;
  xAxisIndex?: number;
  stack?: string;
  silent?: boolean;
  data?: unknown[];
  markLine?: unknown;
  markArea?: unknown;
  [key: string]: unknown;
};

export type AxisLike = {
  type?: string;
  inverse?: boolean;
  position?: string;
  axisLabel?: {
    formatter?: unknown;
    rotate?: number;
    interval?: unknown;
    /** ECharts drops labels that would collide when this is on. */
    hideOverlap?: boolean;
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

export type LegendLike = {
  data?: unknown[];
  selected?: Record<string, boolean>;
  [key: string]: unknown;
};

export type DataZoomLike = {
  startValue?: number;
  endValue?: number;
  start?: number;
  end?: number;
  [key: string]: unknown;
};

/** A check is a pure function from observed evidence to a verdict. */
export type CheckFn = (e: CaseEvidence) => CheckResult;

export function pass(id: string, label: string, detail?: string): CheckResult {
  return { id, label, status: "pass", detail };
}

export function fail(id: string, label: string, detail?: string): CheckResult {
  return { id, label, status: "fail", detail };
}

export function pending(id: string, label: string, need: string): CheckResult {
  return { id, label, status: "pending", need };
}

/** pass / fail on a boolean, with both sides explained. */
export function verdict(
  id: string,
  label: string,
  ok: boolean,
  detail: string,
): CheckResult {
  return { id, label, status: ok ? "pass" : "fail", detail };
}

/** Roll a case's checks up. Any fail ⇒ fail; any pending ⇒ pending; else pass. */
export function rollUp(checks: CheckResult[]): CheckStatus {
  if (checks.some((c) => c.status === "fail")) return "fail";
  if (checks.some((c) => c.status === "pending")) return "pending";
  return checks.length > 0 ? "pass" : "pending";
}
