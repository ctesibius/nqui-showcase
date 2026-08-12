/**
 * The verdict logic for every lab case.
 *
 * A check is a pure function from observed evidence to pass / fail / pending.
 * Nothing here consults the tester's opinion — the tester's only job is to
 * perform the interaction, and a case that is never exercised stays `pending`
 * rather than quietly counting as a pass.
 *
 * Three kinds of check appear below:
 *
 * - **structural** — read the *compiled* ECharts option, the axis model, or the
 *   laid-out geometry. These decide on their own, with no interaction.
 * - **evidence** — need the tester to act, then assert on what was recorded.
 * - **negative** — must *not* happen. These require counter-evidence before
 *   they can pass (so skipping the step leaves them pending) and latch to fail
 *   the moment the forbidden thing is observed.
 */

import { LAB_DATA, PIE_DATA, ROTATE_DATA } from "./dataset";
import {
  axesOf,
  dataSeries,
  isGapValue,
  legendsOf,
  seriesOf,
  seriesValueAt,
} from "./echarts-probe";
import {
  fail,
  pending,
  rollUp,
  verdict,
  type CaseEvidence,
  type CheckFn,
  type CheckResult,
  type CheckStatus,
  type Modifiers,
} from "./probe-types";
import type { SeriesLike } from "./probe-types";

const NULL_INDEX = LAB_DATA.findIndex((r) => r.actual == null);
const ROTATE_CATEGORIES = ROTATE_DATA.length;

/**
 * Guard every structural check: no instance ⇒ pending, never a false fail.
 *
 * The two reasons an instance is missing need different words. Cards are
 * lazily mounted, so most of the page has no chart until it is scrolled to —
 * telling that tester to switch to a local build would send them after the
 * wrong thing. Only a *mounted* card with no handle indicates the package
 * predates `chartRef`.
 */
function needsChart(e: CaseEvidence, id: string, label: string): CheckResult | null {
  if (e.ready && e.option) return null;
  if (!e.root) return pending(id, label, "scroll this card into view to mount the chart");
  return pending(
    id,
    label,
    "no chart handle — this package build is missing `chartRef` (need @nqlib/nqchart@0.3.0+)",
  );
}

function structural(
  id: string,
  label: string,
  run: (e: CaseEvidence) => { ok: boolean; detail: string },
): CheckFn {
  return (e) => {
    const blocked = needsChart(e, id, label);
    if (blocked) return blocked;
    const { ok, detail } = run(e);
    return verdict(id, label, ok, detail);
  };
}

/**
 * A check that reads the DOM only. It must not wait on an ECharts instance:
 * the empty and error states replace the canvas entirely, so there is never
 * one to wait for, and requiring it would pin those cases at pending forever.
 */
function domCheck(
  id: string,
  label: string,
  run: (root: HTMLElement) => { ok: boolean; detail: string },
): CheckFn {
  return (e) => {
    if (!e.root) return pending(id, label, "scroll this card into view to mount the chart");
    const { ok, detail } = run(e.root);
    return verdict(id, label, ok, detail);
  };
}

/**
 * Needs the tester to act first. `run` only sees evidence once `ready` returns
 * true, so an unexercised case reports what is still missing.
 */
function evidence(
  id: string,
  label: string,
  ready: (e: CaseEvidence) => boolean,
  need: (e: CaseEvidence) => string,
  run: (e: CaseEvidence) => { ok: boolean; detail: string },
): CheckFn {
  return (e) => {
    if (!ready(e)) return pending(id, label, need(e));
    const { ok, detail } = run(e);
    return verdict(id, label, ok, detail);
  };
}

/**
 * A "must not happen" check. `violated` latches a fail immediately; otherwise
 * the tester has to produce `required` units of counter-evidence to earn a pass.
 */
function negative(
  id: string,
  label: string,
  violated: (e: CaseEvidence) => string | null,
  counted: (e: CaseEvidence) => number,
  required: number,
  need: (n: number) => string,
): CheckFn {
  return (e) => {
    const breach = violated(e);
    if (breach) return { id, label, status: "fail", detail: breach };
    const n = counted(e);
    if (n < required) return pending(id, label, need(n));
    return verdict(id, label, true, `${n} attempts, nothing fired`);
  };
}

function fmtMods(m: Modifiers): string {
  const on = Object.entries(m)
    .filter(([, v]) => v)
    .map(([k]) => k);
  return on.length ? on.join("+") : "none";
}

function sameMods(a: Modifiers, b: Modifiers): boolean {
  return a.shift === b.shift && a.meta === b.meta && a.alt === b.alt && a.ctrl === b.ctrl;
}

/* ------------------------------------------------------------------ */
/* Shared checks                                                       */
/* ------------------------------------------------------------------ */

/** The mark payload a BI board actually consumes. */
const markPayloadComplete = evidence(
  "payload",
  "Mark event carries a usable payload",
  (e) => e.marks.length > 0,
  () => "click a mark",
  (e) => {
    const { event } = e.marks[e.marks.length - 1]!;
    const problems: string[] = [];
    if (typeof event.seriesKey !== "string" || !event.seriesKey) problems.push("seriesKey");
    if (!Number.isInteger(event.index) || event.index < 0) problems.push("index");
    if (event.category == null) problems.push("category");
    if (event.value == null || !Number.isFinite(event.value)) problems.push("value");
    if (!event.modifiers || typeof event.modifiers.shift !== "boolean") {
      problems.push("modifiers");
    }
    return {
      ok: problems.length === 0,
      detail: problems.length
        ? `missing / invalid: ${problems.join(", ")}`
        : `${event.seriesKey} @ ${String(event.category)} · i=${event.index} · v=${String(event.value)}`,
    };
  },
);

/** The raw category, not the tick label — the difference a filter depends on. */
const markCategoryIsRaw = evidence(
  "raw-category",
  "Category is the raw value, not the tick label",
  (e) => e.marks.length > 0,
  () => "click a mark",
  (e) => {
    const { event } = e.marks[e.marks.length - 1]!;
    const row = LAB_DATA[event.index];
    const ok = Boolean(row) && event.category === row!.month;
    return {
      ok,
      detail: ok
        ? `category "${String(event.category)}" === data[${event.index}].month`
        : `got ${JSON.stringify(event.category)}, data[${event.index}].month is ${JSON.stringify(row?.month)}`,
    };
  },
);

/** The payload value must be the datum, not a stacked or display height. */
const markValueMatchesDatum = evidence(
  "value-matches",
  "Value equals the source datum",
  (e) => e.marks.length > 0,
  () => "click a mark",
  (e) => {
    const { event } = e.marks[e.marks.length - 1]!;
    const row = LAB_DATA[event.index] as unknown as Record<string, unknown> | undefined;
    const expected = row?.[event.seriesKey];
    const ok = typeof expected === "number" && expected === event.value;
    return {
      ok,
      detail: ok
        ? `${String(event.value)} === data[${event.index}].${event.seriesKey}`
        : `payload ${String(event.value)} vs datum ${String(expected)}`,
    };
  },
);

/**
 * Modifier flags are the thing under test, so they are compared against the key
 * state captured from the DOM pointer event rather than trusted from the payload.
 */
const modifiersAreTruthful = negative(
  "mods-truthful",
  "Reported modifiers match the keys actually held",
  (e) => {
    const bad = e.marks.find((m) => !sameMods(m.event.modifiers, m.actualModifiers));
    if (!bad) return null;
    return `payload said ${fmtMods(bad.event.modifiers)}, DOM said ${fmtMods(bad.actualModifiers)}`;
  },
  (e) => e.marks.length,
  1,
  () => "click a mark",
);

/* ------------------------------------------------------------------ */
/* Family coverage                                                     */
/* ------------------------------------------------------------------ */

/**
 * The three questions that decide whether a chart family can sit on a BI board
 * at all. Every family case gets the same three, so the group reads as a matrix
 * rather than a pile of bespoke assertions.
 *
 * Each render passes `chartRef` and `onMarkClick` regardless of whether the
 * root declares them, so a family that ignores them produces silence — and
 * these checks convert that silence into a fail instead of an eternal pending.
 */
function familyChecks(): CheckFn[] {
  return [
    (e) => {
      const id = "handle";
      const label = "Exposes a chart handle (chartRef)";
      if (e.ready) {
        return verdict(id, label, true, "getInstance() returns a live chart");
      }
      if (!e.root) return pending(id, label, "scroll this card into view to mount the chart");
      if (!e.handleTimedOut) return pending(id, label, "chart still initialising");
      return fail(
        id,
        label,
        "no handle after 6s — this family ignores chartRef, so it cannot be introspected or exported",
      );
    },

    (e) => {
      const id = "renders";
      const label = "Compiles at least one series with data";
      const blocked = needsChart(e, id, label);
      if (blocked) return blocked;
      const withData = dataSeries(e.option).filter(
        (s) => Array.isArray(s.data) && s.data.length > 0,
      );
      return verdict(
        id,
        label,
        withData.length > 0,
        withData.length
          ? `${withData.length} series, ${withData[0]!.data!.length} points in the first`
          : "no series carries any data — the plot is blank",
      );
    },

    (e) => {
      const id = "mark-click";
      const label = "Clicking a mark emits a usable event";
      if (e.marks.length > 0) {
        const { event } = e.marks.at(-1)!;
        const ok =
          typeof event.seriesKey === "string" &&
          event.seriesKey !== "" &&
          Number.isInteger(event.index) &&
          event.index >= 0;
        return verdict(
          id,
          label,
          ok,
          ok
            ? `${event.seriesKey} @ ${String(event.category)} · i=${event.index} · v=${String(event.value)}`
            : `event fired but is unusable: ${JSON.stringify(event.seriesKey)} / index ${event.index}`,
        );
      }
      if (e.domClicks >= 3) {
        /*
         * A chart handle only exists when the root accepted `chartRef`, and in
         * this library the two BI props land together — so a handle proves the
         * family *has* an `onMarkClick`. Clicks that fire nothing then mean the
         * pointer missed the marks, not that the API is absent, and saying
         * otherwise blames the library for a thin line or a small slice.
         */
        if (e.ready) {
          return pending(
            id,
            label,
            `${e.domClicks} clicks, none on a mark — aim directly at a bar, point or slice`,
          );
        }
        return fail(
          id,
          label,
          `${e.domClicks} clicks produced no mark event, and the root exposes no chart handle — this family has no interaction contract`,
        );
      }
      return pending(id, label, `click a mark (${e.domClicks}/3 clicks so far)`);
    },
  ];
}

const FAMILY_IDS = [
  "area",
  "scatter",
  "funnel",
  "waterfall",
  "treemap",
  "radar",
  "radial",
  "sparkline",
  "heatmap",
  "calendar",
] as const;

/* ------------------------------------------------------------------ */
/* Per-case check tables                                               */
/* ------------------------------------------------------------------ */

export const CASE_CHECKS: Record<string, CheckFn[]> = {
  "interaction.composed-mark-click": [
    markPayloadComplete,
    markCategoryIsRaw,
    markValueMatchesDatum,
  ],

  "interaction.empty-plot": [
    // "Background" is decided geometrically: inside the plot rect but in the
    // upper third, which the case's 1M axis domain keeps clear of every bar.
    negative(
      "no-fire-on-background",
      "Background clicks do not fire onMarkClick",
      (e) => {
        const hit = backgroundClicks(e).find((c) => c.hitMark);
        if (!hit) return null;
        const m = e.marks.at(-1)?.event;
        return m
          ? `a click above the bars fired ${m.seriesKey} @ ${String(m.category)}`
          : "a click above the bars fired a mark event";
      },
      (e) => backgroundClicks(e).length,
      3,
      (n) => `click 3× in the empty upper third of the plot (${n}/3)`,
    ),
  ],

  "interaction.null-datum": [
    structural("gap-not-zero", "The null month compiles to a gap, not a zero", (e) => {
      const actual = dataSeries(e.option).find((s) => s.id === "actual" || s.name === "Actual cost");
      const v = seriesValueAt(actual, NULL_INDEX);
      return {
        ok: Boolean(actual) && isGapValue(v),
        detail: actual
          ? `series.data[${NULL_INDEX}] = ${JSON.stringify(v)}`
          : "no `actual` series in the compiled option",
      };
    }),
    negative(
      "null-does-not-fire",
      "The missing datum never emits a mark event",
      (e) => {
        const bad = e.marks.find(
          (m) => m.event.index === NULL_INDEX && m.event.seriesKey === "actual",
        );
        return bad ? `fired for actual @ index ${NULL_INDEX} with value ${String(bad.event.value)}` : null;
      },
      (e) => e.rawClicks.filter((c) => c.inGrid && c.dataIndex === NULL_INDEX).length,
      2,
      (n) => `click twice in the ${LAB_DATA[NULL_INDEX]?.month ?? "gap"} band (${n}/2)`,
    ),
  ],

  "interaction.no-handler": [
    structural("cursor-default", "Marks do not advertise a pointer cursor", (e) => {
      const series = dataSeries(e.option);
      const pointer = series.filter((s) => s.cursor !== "default");
      return {
        ok: series.length > 0 && pointer.length === 0,
        detail: series.length
          ? pointer.length
            ? `${pointer.length}/${series.length} series still cursor: ${String(pointer[0]!.cursor ?? "default(pointer)")}`
            : `all ${series.length} series cursor: default`
          : "no series compiled",
      };
    }),
  ],

  "interaction.modifiers": [
    modifiersAreTruthful,
    evidence(
      "shift",
      "Shift is reported",
      (e) => e.marks.some((m) => m.actualModifiers.shift),
      () => "shift-click a bar",
      (e) => {
        const m = e.marks.filter((s) => s.actualModifiers.shift).at(-1)!;
        return {
          ok: m.event.modifiers.shift,
          detail: `payload modifiers: ${fmtMods(m.event.modifiers)}`,
        };
      },
    ),
    evidence(
      "meta",
      "Cmd / Ctrl is reported",
      (e) => e.marks.some((m) => m.actualModifiers.meta || m.actualModifiers.ctrl),
      () => "cmd-click (or ctrl-click) a bar",
      (e) => {
        const m = e.marks.filter((s) => s.actualModifiers.meta || s.actualModifiers.ctrl).at(-1)!;
        return {
          ok: m.event.modifiers.meta || m.event.modifiers.ctrl,
          detail: `payload modifiers: ${fmtMods(m.event.modifiers)}`,
        };
      },
    ),
  ],

  "interaction.line-click": [
    evidence(
      "line-series-key",
      "Line point fires with seriesKey `otd`",
      (e) => e.marks.length > 0,
      () => "click a point on the line",
      (e) => {
        const { event } = e.marks.at(-1)!;
        const row = LAB_DATA[event.index];
        const ok = event.seriesKey === "otd" && event.value === row?.otd;
        return {
          ok,
          detail: `${event.seriesKey} @ ${String(event.category)} = ${String(event.value)} (datum ${String(row?.otd)})`,
        };
      },
    ),
  ],

  "interaction.pie-click": [
    evidence(
      "slice-key",
      "Slice fires with the raw nameKey as seriesKey",
      (e) => e.marks.length > 0,
      () => "click a pie slice",
      (e) => {
        const { event } = e.marks.at(-1)!;
        const slice = PIE_DATA.find((d) => d.name === event.seriesKey);
        return {
          ok: Boolean(slice) && event.value === slice!.value,
          detail: slice
            ? `${event.seriesKey} = ${String(event.value)} (datum ${slice.value})`
            : `seriesKey "${event.seriesKey}" is not a slice name`,
        };
      },
    ),
  ],

  "legend.controlled": [
    // Both halves are required, so a single click is an unfinished step rather
    // than a failure — otherwise the case fails the instant you start it.
    evidence(
      "select-change",
      "onSelectChange reports the clicked key, then clears",
      (e) =>
        e.legendSelections.some((s) => typeof s === "string" && s) &&
        e.legendSelections.some((s) => s === null),
      (e) =>
        e.legendSelections.length === 0
          ? "click a legend entry"
          : "click the same entry again to clear",
      (e) => ({
        ok: true,
        detail: `sequence: ${e.legendSelections.map((s) => s ?? "null").join(" → ")}`,
      }),
    ),
    // nqchart renders its own React legend below the plot; ECharts' built-in
    // legend is suppressed. So selection state lives in the DOM, never in
    // `option.legend.selected` — reading the option here would always fail.
    // Gated on the *current* selection, not the history: clicking an entry
    // twice clears it, and judging a cleared legend against a remembered key
    // reports "nothing is highlighted" as a failure of the highlighting.
    evidence(
      "reflected",
      "The legend shows which series is selected",
      (e) => currentSelection(e) != null,
      (e) =>
        e.legendSelections.length === 0
          ? "click a legend entry to isolate a series"
          : "selection is currently cleared — click an entry again",
      (e) => {
        const dimmed = dimmedLegendEntries(e);
        if (!dimmed) return { ok: false, detail: "no legend entries found in the DOM" };
        return {
          ok: dimmed.dim === dimmed.total - 1,
          detail: `${dimmed.total - dimmed.dim} of ${dimmed.total} entries highlighted`,
        };
      },
    ),
    // The point of isolating a series is to read the *chart*, so a legend that
    // only restyles its own label has not done the job.
    (e) => {
      const id = "focuses-plot";
      const label = "Selection focuses the plot, not just the legend label";
      const blocked = needsChart(e, id, label);
      if (blocked) return blocked;
      const active = currentSelection(e);
      if (!active) {
        return pending(
          id,
          label,
          e.legendSelections.length === 0
            ? "click a legend entry to isolate a series"
            : "selection is currently cleared — click an entry again",
        );
      }
      const series = dataSeries(e.option);
      // No compiled series is an unreadable chart, not an unfocused one.
      if (series.length < 2) {
        return pending(id, label, "chart has not compiled its series yet — press Re-check");
      }

      /*
       * Compared *relatively*, not against a fixed threshold. Opacity is used
       * for other things on these charts (hover blur states, intro), so
       * "opacity < 1" does not mean "the legend dimmed it" — the honest
       * question is whether the selected series stands out from the rest.
       */
      const opacityOf = (s: (typeof series)[number]) => seriesOpacity(s) ?? 1;
      const selected = series.filter((s) => s.id === active || s.name === active);
      const others = series.filter((s) => !(s.id === active || s.name === active));
      const readout = series
        .map((s) => `${String(s.id ?? s.name)}:${opacityOf(s)}`)
        .join(" ");

      if (selected.length === 0) {
        return verdict(
          id,
          label,
          false,
          `no series matches the selected key "${active}" — ${readout}`,
        );
      }
      const top = Math.min(...selected.map(opacityOf));
      return verdict(
        id,
        label,
        others.length > 0 && others.every((s) => opacityOf(s) < top),
        readout,
      );
    },
  ],

  "legend.uncontrolled": [
    evidence(
      "default-toggle",
      "Default click-to-toggle still narrows the legend",
      (e) => (dimmedLegendEntries(e)?.dim ?? 0) > 0,
      () => "click a legend entry",
      (e) => {
        const dimmed = dimmedLegendEntries(e)!;
        // Exactly one entry stays lit — the default is isolate-one, not hide-one.
        return {
          ok: dimmed.dim === dimmed.total - 1,
          detail: `${dimmed.total - dimmed.dim} of ${dimmed.total} entries highlighted`,
        };
      },
    ),
  ],

  "brush.on-brush-change": [
    evidence(
      "range-shape",
      "onBrushChange reports a valid index window",
      (e) => e.brushRanges.length > 0,
      () => "drag the brush",
      (e) => {
        const r = e.brushRanges.at(-1)!;
        const ok =
          Number.isInteger(r.startIndex) &&
          Number.isInteger(r.endIndex) &&
          r.startIndex >= 0 &&
          r.endIndex < LAB_DATA.length &&
          r.startIndex <= r.endIndex;
        return { ok, detail: `{ startIndex: ${r.startIndex}, endIndex: ${r.endIndex} }` };
      },
    ),
    // Cross-checked against the points the chart actually plots, not against a
    // dataZoom: nqchart's brush is a React component that slices `data` before
    // compiling, so there is no `startValue`/`endValue` to read back and the
    // old form of this check could never leave `pending`.
    evidence(
      "range-agrees",
      "The reported window matches what the chart plots",
      (e) => e.brushPlotted.length > 0,
      () => "drag the brush",
      (e) => {
        const r = e.brushRanges.at(-1)!;
        const plotted = e.brushPlotted.at(-1)!;
        const expected = r.endIndex - r.startIndex + 1;
        return {
          ok: plotted === expected,
          detail: `window ${r.startIndex}…${r.endIndex} wants ${expected} categories, chart plots ${plotted}`,
        };
      },
    ),
  ],

  "axes.dual-tick-formatter": [
    structural("two-axes", "Two Y axes compile, left and right", (e) => {
      const y = axesOf(e.option, "yAxis");
      const positions = y.map((a) => a.position ?? "left");
      return {
        ok: y.length === 2 && positions.includes("left") && positions.includes("right"),
        detail: `${y.length} axes: ${positions.join(", ")}`,
      };
    }),
    structural("left-usd", "Left axis renders compact USD ticks", (e) => {
      const ticks = e.axisTicks.yLeft.filter((t) => /^\$/.test(t));
      return {
        ok: ticks.length >= 2,
        detail: ticks.length
          ? `${ticks.length} ticks: ${ticks.slice(0, 4).join(", ")}`
          : `no $ ticks — axis renders ${e.axisTicks.yLeft.slice(0, 4).join(", ") || "nothing"}`,
      };
    }),
    structural("right-pct", "Right axis renders percent ticks at the same time", (e) => {
      const ticks = e.axisTicks.yRight.filter((t) => /%$/.test(t));
      return {
        ok: ticks.length >= 2,
        detail: ticks.length
          ? `${ticks.length} ticks: ${ticks.slice(0, 4).join(", ")}`
          : `no % ticks — axis renders ${e.axisTicks.yRight.slice(0, 4).join(", ") || "nothing"}`,
      };
    }),
  ],

  "axes.yaxisid-fallback": [
    structural("falls-back-to-0", "Unknown yAxisId falls back to axis 0", (e) => {
      const y = axesOf(e.option, "yAxis");
      const series = dataSeries(e.option);
      const stray = series.filter((s) => (s.yAxisIndex ?? 0) >= y.length);
      return {
        ok: y.length === 1 && series.length > 0 && stray.length === 0,
        detail: `${y.length} axis · ${series.length} series on indices ${[...new Set(series.map((s) => s.yAxisIndex ?? 0))].join(", ")}`,
      };
    }),
    structural("still-draws", "The plot is not blank", (e) => {
      const ticks = e.axisTicks.yLeft.filter((t) => /^\$/.test(t));
      const nonZero = ticks.filter((t) => !/^\$0$/.test(t.trim()));
      return {
        ok: nonZero.length >= 2,
        detail: `${ticks.length} value ticks, ${nonZero.length} non-zero`,
      };
    }),
  ],

  "axes.log-scale": [
    structural("log-type", "Y axis compiles as log", (e) => {
      const a = axesOf(e.option, "yAxis")[0];
      return { ok: a?.type === "log", detail: `yAxis[0].type = ${a?.type ?? "none"}` };
    }),
    structural("decades-drawn", "Log ticks render across decades", (e) => {
      const ticks = e.axisTicks.yLeft.filter((t) => /^\$/.test(t));
      return {
        ok: ticks.length >= 3,
        detail: `${ticks.length} ticks: ${ticks.slice(0, 5).join(", ")}`,
      };
    }),
  ],

  "axes.reversed": [
    structural("inverse-flag", "Axis compiles with inverse", (e) => {
      const a = axesOf(e.option, "yAxis")[0];
      return { ok: a?.inverse === true, detail: `yAxis[0].inverse = ${String(a?.inverse)}` };
    }),
    (e) => {
      const id = "geometry-inverted";
      const label = "Larger values really sit lower on screen";
      const blocked = needsChart(e, id, label);
      if (blocked) return blocked;
      // Measured from the plot rect, so a flag that compiles but is ignored is
      // caught here. An unreadable measurement is not evidence of either
      // outcome, so it waits rather than accusing the chart.
      const o = e.yAxisOrientation;
      if (o == null) {
        return pending(id, label, "axis geometry not measurable yet — press Re-check");
      }
      // Report the screen positions, not just the conclusion: a sign error in
      // the measurement produces a confident wrong word, and the numbers are
      // what make that visible.
      return verdict(
        id,
        label,
        o.direction === "inverted",
        `${o.direction} — axis min at y=${o.minY.toFixed(0)}, max at y=${o.maxY.toFixed(0)}`,
      );
    },
  ],

  "axes.label-rotate": [
    structural("rotate-compiled", "labelRotate reaches the axis", (e) => {
      const a = axesOf(e.option, "xAxis")[0];
      return {
        ok: a?.axisLabel?.rotate === 45,
        detail: `xAxis[0].axisLabel.rotate = ${String(a?.axisLabel?.rotate)}`,
      };
    }),
    /*
     * Both of these used to read the zrender display list, which the built
     * bundle does not expose — so they measured nothing and reported it as a
     * failure ("0 rotated", "tightest gap 0.0px" across labels that are plainly
     * spread out). They now measure the geometry the chart actually laid out.
     */
    structural("labels-rotated", "Every category gets a slot on the axis", (e) => {
      const xs = e.categoryPixels;
      if (xs.length === 0) {
        return { ok: false, detail: "category positions not measurable" };
      }
      return {
        ok: xs.length === ROTATE_CATEGORIES,
        detail: `${xs.length} of ${ROTATE_CATEGORIES} categories positioned`,
      };
    }),
    structural("labels-legible", "Rotated labels cannot pile up on each other", (e) => {
      const xs = [...e.categoryPixels].sort((a, b) => a - b);
      if (xs.length < 2) return { ok: false, detail: "fewer than 2 categories positioned" };
      let min = Infinity;
      for (let i = 1; i < xs.length; i += 1) min = Math.min(min, xs[i]! - xs[i - 1]!);

      /*
       * 40 categories in a card are always tighter than a rotated label is
       * wide, so raw spacing cannot be the criterion — what matters is whether
       * the axis has a mechanism to stop them stacking up.
       *
       * There are two, and either is sufficient: `hideOverlap` drops labels
       * that would collide, and an `interval` other than `0` thins them by
       * position. `interval: 0` alone forces every label to draw, and only that
       * combination — no thinning and no overlap suppression — can pile up.
       */
      const axisLabel = axesOf(e.option, "xAxis")[0]?.axisLabel;
      const interval = axisLabel?.interval;
      const hideOverlap = axisLabel?.hideOverlap === true;
      const thins = interval !== 0;
      const how = [
        hideOverlap ? "hideOverlap" : null,
        thins ? `interval: ${interval === undefined ? "auto" : String(interval)}` : null,
      ].filter(Boolean);
      return {
        ok: hideOverlap || thins || min >= 8,
        detail: `${xs.length} categories ${min.toFixed(1)}px apart · ${
          how.length ? how.join(" + ") : "every label forced, nothing suppressing overlap"
        }`,
      };
    }),
  ],

  "annotations.reference-line-band": [
    structural("refs-drawn", "Reference line and band both compile", (e) => {
      const all = seriesOf(e.option);
      const hasLine = all.some((s) => Boolean(s.markLine));
      const hasBand = all.some((s) => Boolean(s.markArea));
      return {
        ok: hasLine && hasBand,
        detail: `markLine: ${hasLine ? "yes" : "no"} · markArea: ${hasBand ? "yes" : "no"}`,
      };
    }),
    structural("label-compiled", "The line carries its label", (e) => {
      // Read from the compiled markLine rather than the canvas: the display
      // list is not exposed by the built bundle, so scanning it reported "no
      // Budget label" for a label that is plainly drawn.
      const line = seriesOf(e.option).find((s) => s.markLine);
      const data = (line?.markLine as { data?: unknown[] } | undefined)?.data ?? [];
      const labels = data.flatMap((d) => {
        const label = (d as { label?: { formatter?: unknown } })?.label?.formatter;
        return typeof label === "string" ? [label] : [];
      });
      return {
        ok: labels.includes("Budget"),
        detail: labels.length
          ? `markLine labels: ${labels.join(", ")}`
          : "markLine carries no label",
      };
    }),
    structural("not-in-legend", "References stay out of the legend", (e) => {
      const names = (legendsOf(e.option)[0]?.data ?? []).map((d) =>
        typeof d === "string" ? d : String((d as { name?: unknown })?.name ?? ""),
      );
      const leaked = names.filter((n) => /reference|budget|__nq_/i.test(n));
      return {
        ok: leaked.length === 0,
        detail: leaked.length ? `leaked: ${leaked.join(", ")}` : `legend: ${names.join(", ")}`,
      };
    }),
    structural("refs-silent", "Reference marks are silent to clicks", (e) => {
      const refs = seriesOf(e.option).filter((s) => s.markLine || s.markArea);
      const noisy = refs.filter((s) => s.silent !== true);
      return {
        ok: refs.length > 0 && noisy.length === 0,
        detail: refs.length
          ? noisy.length
            ? `${noisy.length} reference series not silent`
            : `${refs.length} reference series silent`
          : "no reference series compiled",
      };
    }),
    negative(
      "refs-never-fire",
      "Clicking a reference never emits a mark event",
      (e) => {
        const bad = e.marks.find((m) => /reference|budget|__nq_/i.test(m.event.seriesKey));
        return bad ? `fired with seriesKey "${bad.event.seriesKey}"` : null;
      },
      (e) => e.rawClicks.filter((c) => c.inGrid).length,
      3,
      (n) => `click on/near the budget line and band (${n}/3 plot clicks)`,
    ),
  ],

  "composition.area-in-composed": [
    structural("area-present", "Area compiles beside Bar and Line", (e) => {
      const series = dataSeries(e.option);
      const types = series.map((s) => s.type);
      const area = series.find((s) => s.areaStyle != null);
      return {
        ok: Boolean(area) && types.includes("bar") && types.includes("line"),
        detail: `types: ${types.join(", ")} · areaStyle on ${area?.id ?? "none"}`,
      };
    }),
    structural("area-on-right-axis", "Area honours yAxisId", (e) => {
      const area = dataSeries(e.option).find((s) => s.areaStyle != null);
      return {
        ok: area?.yAxisIndex === 1,
        detail: `area yAxisIndex = ${String(area?.yAxisIndex)}`,
      };
    }),
  ],

  "states.empty": [
    domCheck("plate-not-frame", "Empty data shows a status plate, not bare axes", (root) => {
      const plate = root.querySelector('[role="status"]');
      const text = plate?.textContent?.trim() ?? "";
      return {
        ok: Boolean(plate) && /no data/i.test(text),
        detail: plate ? `role=status: “${text}”` : "no [role=status] plate in the DOM",
      };
    }),
    domCheck("canvas-suppressed", "The empty frame is hidden from assistive tech", (root) => {
      const hidden = root.querySelector('[aria-hidden="true"]');
      return {
        ok: Boolean(hidden),
        detail: hidden ? "plot wrapper aria-hidden" : "empty plot still exposed to AT",
      };
    }),
  ],

  "states.error": [
    domCheck("alert-role", "Error announces as an alert", (root) => {
      const alert = root.querySelector('[role="alert"]');
      return {
        ok: Boolean(alert),
        detail: alert ? `role=alert: “${alert.textContent?.trim()}”` : "no [role=alert] in the DOM",
      };
    }),
    domCheck("distinct-from-empty", "Error is not the empty plate", (root) => {
      const hasStatus = Boolean(root.querySelector('[role="status"]'));
      return {
        ok: !hasStatus,
        detail: hasStatus ? "both role=alert and role=status rendered" : "alert only",
      };
    }),
  ],

  "states.loading": [
    domCheck("skeleton-shown", "Loading dims the plot and shows a skeleton", (root) => {
      const dimmed = Boolean(root.querySelector(".opacity-0"));
      const svg = root.querySelectorAll("svg").length;
      return {
        ok: dimmed && svg > 0,
        detail: `plot dimmed: ${dimmed ? "yes" : "no"} · ${svg} skeleton svg`,
      };
    }),
    domCheck("distinct-from-empty-error", "Loading is neither the empty nor the error plate", (root) => {
      const status = Boolean(root.querySelector('[role="status"]'));
      const alert = Boolean(root.querySelector('[role="alert"]'));
      return {
        ok: !status && !alert,
        detail:
          status || alert
            ? `also rendered ${status ? "role=status " : ""}${alert ? "role=alert" : ""}`.trim()
            : "skeleton only",
      };
    }),
  ],

  "a11y.keyboard": [
    domCheck("focusable", "The plot is reachable by Tab", (root) => {
      const el = root.querySelector("[tabindex]");
      const idx = el?.getAttribute("tabindex");
      return {
        ok: Boolean(el) && Number(idx) >= 0,
        detail: el ? `tabindex="${idx}"` : "nothing focusable inside the plot",
      };
    }),
    evidence(
      "arrows-move",
      "Arrow keys move the focused mark",
      (e) => e.arrowKeys >= 3,
      (e) => `tab into the plot, then press arrow keys (${e.arrowKeys}/3)`,
      (e) => ({ ok: true, detail: `${e.arrowKeys} arrow presses observed` }),
    ),
    evidence(
      "enter-fires",
      "Enter fires the same event as a pointer click",
      (e) => e.marks.some((m) => m.fromKeyboard),
      () => "press Enter on a focused mark",
      (e) => {
        const kb = e.marks.filter((m) => m.fromKeyboard).at(-1)!;
        const row = LAB_DATA[kb.event.index] as unknown as Record<string, unknown> | undefined;
        return {
          ok: kb.event.category === row?.month && kb.event.value != null,
          detail: `keyboard event: ${kb.event.seriesKey} @ ${String(kb.event.category)} = ${String(kb.event.value)}`,
        };
      },
    ),
  ],

  "a11y.table": [
    domCheck("table-present", "A visually hidden data table is rendered", (root) => {
      const table = root.querySelector(".sr-only table");
      const rows = table?.querySelectorAll("tbody tr").length ?? 0;
      return {
        ok: Boolean(table) && rows === LAB_DATA.length,
        detail: table ? `${rows} rows (expected ${LAB_DATA.length})` : "no .sr-only table",
      };
    }),
    domCheck("canvas-hidden", "The canvas is aria-hidden so nothing is read twice", (root) => {
      const canvas = root.querySelector("canvas");
      const hiddenAncestor = canvas?.closest('[aria-hidden="true"]');
      return {
        ok: Boolean(canvas) && Boolean(hiddenAncestor),
        detail: canvas
          ? hiddenAncestor
            ? "canvas sits inside aria-hidden"
            : "canvas is exposed to AT alongside the table"
          : "no canvas rendered",
      };
    }),
    domCheck("columns-match-series", "Table columns cover every series", (root) => {
      const heads = root.querySelectorAll(".sr-only table thead th").length;
      return {
        ok: heads === 4,
        detail: `${heads} columns (category + planned + actual + otd = 4)`,
      };
    }),
  ],

  "a11y.reduced-motion": [
    (e) => {
      const id = "reduced-motion";
      const label = "Intro animation is suppressed under reduced motion";
      if (!e.reducedMotion) {
        return pending(
          id,
          label,
          "turn on OS reduced motion — this check reads the media query, not your eyes",
        );
      }
      const blocked = needsChart(e, id, label);
      if (blocked) return blocked;
      const anim = e.option?.animation;
      const dur = e.option?.animationDuration;
      const off = anim === false || dur === 0;
      return verdict(
        id,
        label,
        off,
        `animation: ${String(anim)} · animationDuration: ${typeof dur === "function" ? "fn" : String(dur)}`,
      );
    },
  ],

  "export.to-data-url": [
    evidence(
      "png",
      "toDataURL returns a PNG",
      (e) => e.exportSample != null,
      () => "click Export PNG",
      (e) => ({
        ok: e.exportSample!.isPng,
        detail: `${(e.exportSample!.bytes / 1024).toFixed(0)} kB data URL`,
      }),
    ),
    evidence(
      "opaque",
      "The export has a themed, non-transparent background",
      (e) => e.exportSample != null,
      () => "click Export PNG",
      (e) => ({
        ok: e.exportSample!.opaque,
        detail: `corner pixel ${e.exportSample!.corner}`,
      }),
    ),
  ],
};

// Every family answers the same three questions, so the group reads as a matrix.
for (const family of FAMILY_IDS) {
  CASE_CHECKS[`families.${family}`] = familyChecks();
}

/**
 * What the legend is focused on *right now*. The last recorded selection wins,
 * and a trailing `null` means the tester cleared it — which is a step still to
 * do, not a defect in the chart.
 */
function currentSelection(e: CaseEvidence): string | null {
  const last = e.legendSelections.at(-1);
  return typeof last === "string" && last !== "" ? last : null;
}

/** Opacity the compiler put on a series, if it dimmed it at all. */
function seriesOpacity(s: SeriesLike): number | null {
  const style = s.itemStyle as { opacity?: unknown } | undefined;
  return typeof style?.opacity === "number" ? style.opacity : null;
}

/**
 * Legend selection state, read from the DOM.
 *
 * nqchart suppresses ECharts' built-in legend and renders its own React one, so
 * selection never appears in the compiled option — it shows up as `opacity-30`
 * on the entries that are not selected. Returns null when no legend is present.
 */
function dimmedLegendEntries(e: CaseEvidence): { dim: number; total: number } | null {
  const root = e.root;
  if (!root) return null;
  // `ChartLegendContent` renders each entry as `flex items-center gap-1.5
  // transition-opacity`. Matching `transition-opacity` alone also catches brush
  // handles and other chrome, which inflates the count and fails the check.
  const items = [...root.querySelectorAll<HTMLElement>("div")].filter(
    (el) =>
      /(^|\s)transition-opacity(\s|$)/.test(el.className) &&
      /(^|\s)gap-1\.5(\s|$)/.test(el.className),
  );
  if (items.length === 0) return null;
  const dim = items.filter((el) => /(^|\s)opacity-30(\s|$)/.test(el.className)).length;
  return { dim, total: items.length };
}

/**
 * Inside the plot rect but above every bar — unambiguously background.
 * Relies on `EmptyPlotCase` pinning the axis domain to 1M so the top third
 * cannot contain a mark; do not point this at the dual-axis chart.
 */
function backgroundClicks(e: CaseEvidence) {
  const rect = e.gridRect;
  if (!rect) return [];
  const ceiling = rect.y + rect.height * 0.33;
  return e.rawClicks.filter((c) => c.inGrid && c.y <= ceiling);
}

export function runCaseChecks(caseId: string, e: CaseEvidence): CheckResult[] {
  return (CASE_CHECKS[caseId] ?? []).map((fn) => fn(e));
}

export function caseStatus(caseId: string, e: CaseEvidence): CheckStatus {
  return rollUp(runCaseChecks(caseId, e));
}
