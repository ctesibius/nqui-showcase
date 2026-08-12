/**
 * Read-only introspection of a live ECharts instance.
 *
 * Every helper here answers a question a human tester would otherwise answer by
 * eye ("does the left axis really show dollars?", "did that click land on a
 * mark or on background?"). Reading the *compiled* option and the *rendered*
 * display list means we assert the library's output, never our own input.
 *
 * All helpers are defensive: the published 0.2.2 build has no `chartRef`, and
 * zrender internals are unsupported surface. Anything missing degrades to a
 * null / empty result, which the checks report as `pending`, not `fail`.
 */

import type { EChartsType } from "echarts/core";
import type {
  AxisLike,
  EChartsOptionLike,
  ExportSample,
  RenderedText,
  SeriesLike,
} from "./probe-types";

type ZRenderLike = {
  on: (event: string, handler: (e: ZrEvent) => void) => void;
  off: (event: string, handler?: (e: ZrEvent) => void) => void;
  storage?: { getDisplayList?: (update?: boolean) => unknown[] };
};

export type ZrEvent = {
  offsetX: number;
  offsetY: number;
  event?: MouseEvent;
};

export function getZr(inst: EChartsType | null): ZRenderLike | null {
  if (!inst) return null;
  try {
    return (inst as unknown as { getZr: () => ZRenderLike }).getZr() ?? null;
  } catch {
    return null;
  }
}

export function readOption(inst: EChartsType | null): EChartsOptionLike | null {
  if (!inst) return null;
  try {
    return inst.getOption() as unknown as EChartsOptionLike;
  } catch {
    return null;
  }
}

export function seriesOf(option: EChartsOptionLike | null): SeriesLike[] {
  const s = option?.series;
  if (!s) return [];
  return Array.isArray(s) ? s : [s];
}

export function axesOf(
  option: EChartsOptionLike | null,
  which: "xAxis" | "yAxis",
): AxisLike[] {
  const a = option?.[which] as AxisLike[] | AxisLike | undefined;
  if (!a) return [];
  return Array.isArray(a) ? a : [a];
}

export function legendsOf(option: EChartsOptionLike | null) {
  const l = option?.legend;
  if (!l) return [];
  return Array.isArray(l) ? l : [l];
}

export function dataZoomsOf(option: EChartsOptionLike | null) {
  const z = option?.dataZoom;
  if (!z) return [];
  return Array.isArray(z) ? z : [z];
}

/** Series the library synthesises for reference lines / bands. */
export function isReferenceSeries(s: SeriesLike): boolean {
  const id = typeof s.id === "string" ? s.id : "";
  return id.startsWith("__nq_reference") || Boolean(s.markLine) || Boolean(s.markArea);
}

/** Series a BI consumer would consider real data. */
export function dataSeries(option: EChartsOptionLike | null): SeriesLike[] {
  return seriesOf(option).filter((s) => !isReferenceSeries(s));
}

/**
 * Every text node zrender actually painted — axis ticks, legend labels,
 * reference-line labels, data labels. This is the ground truth for
 * "what does the tester see written on the chart".
 */
export function renderedTexts(inst: EChartsType | null): RenderedText[] {
  const zr = getZr(inst);
  const list = zr?.storage?.getDisplayList?.(true);
  if (!Array.isArray(list)) return [];

  const out: RenderedText[] = [];
  const push = (el: ZrTextish | undefined, fallback?: ZrTextish) => {
    if (!el || el.invisible || el.ignore) return;
    const text = el.style?.text;
    if (typeof text !== "string" || text === "") return;

    /*
     * `el.x` / `el.rotation` are the element's *local* values. zrender bakes
     * layout and axis-label rotation into the transform matrix, so reading the
     * locals reports every label at the same spot with zero rotation — which
     * made "labels do not collide" measure a 0px gap between 20 labels that are
     * visibly spread across the axis.
     *
     * The matrix is [a, b, c, d, e, f]: (e, f) is the translation and atan2(b, a)
     * recovers the rotation. Fall back to the locals when there is no matrix.
     */
    const m = el.transform ?? fallback?.transform;
    const rotation =
      m && (m[0] !== 1 || m[1] !== 0)
        ? Math.atan2(m[1] ?? 0, m[0] ?? 1)
        : typeof el.rotation === "number"
          ? el.rotation
          : 0;

    out.push({
      text,
      rotation,
      x: m ? (m[4] ?? 0) : (el.x ?? 0),
      y: m ? (m[5] ?? 0) : (el.y ?? 0),
    });
  };

  for (const raw of list) {
    const el = raw as ZrTextish;
    push(el);
    // Labels on markLine / markArea and on series marks are attached as a
    // `textContent` child rather than appearing in the display list themselves,
    // so a scan that only walks the list misses e.g. a ReferenceLine's label.
    push(el?.textContent, el);
  }
  return out;
}

type ZrTextish = {
  style?: { text?: unknown };
  rotation?: number;
  x?: number;
  y?: number;
  transform?: ArrayLike<number> | null;
  invisible?: boolean;
  ignore?: boolean;
  textContent?: ZrTextish;
};

/**
 * Axis tick labels, as the chart will actually draw them: the axis model's own
 * scale ticks run through the axis' own formatter.
 *
 * This replaces reading the zrender display list, which is unsupported surface
 * and simply absent from the built bundle — so a check that depended on it
 * failed on our inability to measure rather than on anything the chart did.
 * `getModel()` is undocumented too, but it degrades to an empty list instead of
 * a wrong one, and the checks treat empty as "not measurable", never as a fail.
 */
export function axisTickLabels(
  inst: EChartsType | null,
  which: "xAxis" | "yAxis",
  index = 0,
): string[] {
  if (!inst) return [];
  try {
    const model = (
      inst as unknown as {
        getModel: () => {
          getComponent: (
            t: string,
            i?: number,
          ) => { axis?: { scale?: { getTicks?: () => unknown[] } } } | undefined;
        };
      }
    ).getModel();
    const axis = model.getComponent(which, index)?.axis;
    const ticks = axis?.scale?.getTicks?.() ?? [];
    const option = readOption(inst);
    const axisOption = axesOf(option, which)[index];
    return ticks
      .map((t) => {
        const value =
          t && typeof t === "object" && "value" in t ? (t as { value: unknown }).value : t;
        const formatted = runAxisFormatter(axisOption, Number(value));
        return formatted ?? String(value);
      })
      .filter((s): s is string => typeof s === "string" && s !== "");
  } catch {
    return [];
  }
}

/**
 * Pixel x of each category on the first x axis. Gives real on-screen spacing
 * for the label-collision check without touching zrender internals.
 */
export function categoryPixels(inst: EChartsType | null, count: number): number[] {
  if (!inst || count <= 0) return [];
  // Band centres from the plot rect. `convertToPixel` is unreliable on a
  // category axis for the same reason `convertFromPixel` is — see above.
  const rect = gridRect(inst);
  if (!rect) return [];
  const band = rect.width / count;
  return Array.from({ length: count }, (_, i) => rect.x + band * (i + 0.5));
}

/** Is this pixel inside the cartesian plot rect (not the axis gutters)? */
export function inGrid(inst: EChartsType | null, x: number, y: number): boolean {
  if (!inst) return false;
  try {
    return Boolean(inst.containPixel({ gridIndex: 0 }, [x, y]));
  } catch {
    return false;
  }
}

/** How many categories the compiled series carry. */
export function categoryCount(option: EChartsOptionLike | null): number {
  const lengths = dataSeries(option).map((s) => (Array.isArray(s.data) ? s.data.length : 0));
  return lengths.length ? Math.max(...lengths) : 0;
}

/**
 * Category index under a pixel on a cartesian x axis, or null.
 *
 * Derived from the plot rect rather than `convertFromPixel`, which returns a
 * non-finite value for a category axis sitting under a dataZoom — so every
 * click on a brushed chart classified as "no category", and the checks that
 * depend on knowing *which* band you clicked could never be satisfied.
 *
 * Bands are equal width, so the arithmetic is exact. Under an active brush the
 * index is relative to the visible window, which is what a click means anyway.
 */
export function categoryAtPixel(
  inst: EChartsType | null,
  x: number,
  y: number,
): number | null {
  if (!inst) return null;
  const rect = gridRect(inst);
  const count = categoryCount(readOption(inst));
  if (rect && count > 0 && x >= rect.x && x <= rect.x + rect.width) {
    const i = Math.floor(((x - rect.x) / rect.width) * count);
    return Math.min(count - 1, Math.max(0, i));
  }
  try {
    const v = inst.convertFromPixel({ xAxisIndex: 0 }, [x, y]);
    const idx = Array.isArray(v) ? v[0] : v;
    if (typeof idx !== "number" || !Number.isFinite(idx)) return null;
    return Math.round(idx);
  } catch {
    return null;
  }
}

export function gridRect(inst: EChartsType | null) {
  if (!inst) return null;
  try {
    const model = (
      inst as unknown as {
        getModel: () => {
          getComponent: (t: string, i?: number) => { coordinateSystem?: { getRect?: () => unknown } } | undefined;
        };
      }
    ).getModel();
    const rect = model.getComponent("grid", 0)?.coordinateSystem?.getRect?.() as
      | { x: number; y: number; width: number; height: number }
      | undefined;
    if (!rect) return null;
    return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
  } catch {
    return null;
  }
}

/**
 * Run an axis' own label formatter over a value, whatever shape it arrived in.
 * Returns null when the axis has no formatter — which is itself a finding.
 */
export function runAxisFormatter(axis: AxisLike | undefined, value: number): string | null {
  const f = axis?.axisLabel?.formatter;
  if (typeof f === "function") {
    try {
      return String((f as (v: unknown, i: number) => unknown)(value, 0));
    } catch {
      return null;
    }
  }
  if (typeof f === "string") {
    return f.replace("{value}", String(value));
  }
  return null;
}

/**
 * Which way the first Y axis runs, measured from the rendered geometry rather
 * than from the `inverse` flag we passed in. Reads the axis value at the top
 * and bottom of the plot rect: normally the top holds the larger value.
 */
export type AxisOrientation = {
  direction: "normal" | "inverted";
  /** Screen y of the axis minimum and maximum, so a wrong verdict is visible. */
  minY: number;
  maxY: number;
};

export function yAxisOrientation(inst: EChartsType | null): AxisOrientation | null {
  if (!inst) return null;
  /*
   * Measured by asking the axis where its own extremes land on screen.
   *
   * `convertFromPixel`/`convertToPixel` are not usable here — they return
   * non-finite values on these charts, the same failure that made every click
   * classify as "no category". The axis model's own mapping answers directly.
   *
   * `dataToCoord` alone is not enough, and getting this wrong inverts every
   * verdict: for a **y** axis the coord it returns is measured *upward from the
   * bottom of the plot*, so a larger value yields a larger number. Screen y runs
   * the other way. `toGlobalCoord` is the flip ECharts itself applies
   * (`gridRect.y + gridRect.height - coord`), so both go through it and the
   * comparison is in real screen space.
   */
  try {
    const model = (
      inst as unknown as {
        getModel: () => {
          getComponent: (
            t: string,
            i?: number,
          ) => {
            axis?: {
              scale?: { getExtent?: () => number[] };
              dataToCoord?: (v: number) => number;
              toGlobalCoord?: (c: number) => number;
            };
          } | undefined;
        };
      }
    ).getModel();
    const axis = model.getComponent("yAxis", 0)?.axis;
    const extent = axis?.scale?.getExtent?.();
    if (!axis?.dataToCoord || !extent || extent.length < 2) return null;
    const [lo, hi] = extent as [number, number];
    if (lo === hi) return null;

    const toScreenY = (v: number) => {
      const coord = axis.dataToCoord!(v);
      return axis.toGlobalCoord ? axis.toGlobalCoord(coord) : coord;
    };
    const yLo = toScreenY(lo);
    const yHi = toScreenY(hi);
    if (!Number.isFinite(yLo) || !Number.isFinite(yHi) || yLo === yHi) return null;
    // Screen y grows downward: normally the larger value sits at the smaller y.
    return {
      direction: yHi < yLo ? "normal" : "inverted",
      minY: yLo,
      maxY: yHi,
    };
  } catch {
    return null;
  }
}

/** Raw datum a series holds at an index — null / '-' means a real gap. */
export function seriesValueAt(s: SeriesLike | undefined, index: number): unknown {
  const data = s?.data;
  if (!Array.isArray(data) || index < 0 || index >= data.length) return undefined;
  const d = data[index];
  if (d && typeof d === "object" && !Array.isArray(d) && "value" in d) {
    return (d as { value: unknown }).value;
  }
  return d;
}

/** ECharts treats null, undefined and '-' as a gap; 0 is a value. */
export function isGapValue(v: unknown): boolean {
  return v == null || v === "-";
}

/**
 * Decode an exported PNG and sample a corner pixel. A themed export must be
 * fully opaque — a transparent background is the classic export bug and is
 * invisible until the PNG lands on a dark slide.
 */
export async function inspectExport(dataUrl: string): Promise<ExportSample> {
  const base: ExportSample = {
    ok: Boolean(dataUrl),
    isPng: dataUrl.startsWith("data:image/png"),
    opaque: false,
    corner: "—",
    bytes: dataUrl.length,
  };
  if (!base.isPng) return base;

  const img = new Image();
  const loaded = await new Promise<boolean>((resolve) => {
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = dataUrl;
  });
  if (!loaded) return base;

  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return base;
  // Sample the top-left pixel of the export — the plot background.
  ctx.drawImage(img, 0, 0, 1, 1, 0, 0, 1, 1);
  const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
  return {
    ...base,
    opaque: a === 255,
    corner: `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(2)})`,
  };
}
