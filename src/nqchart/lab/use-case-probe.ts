/**
 * Per-case instrumentation.
 *
 * The tester performs the interaction; this hook records what actually
 * happened, so the verdict is derived rather than asserted. Two things make
 * that possible and are worth knowing before changing this file:
 *
 * 1. **Raw clicks are classified independently of mark events.** We listen on
 *    zrender for every canvas click and, separately, count mark events. Pairing
 *    them per pointer interaction is what decides "clicked background, nothing
 *    fired" — the negative cases — without asking the tester to judge.
 *
 * 2. **Modifiers are captured from the DOM, not from the payload.** The payload
 *    is the thing under test, so trusting it would make the modifier case
 *    self-confirming. We snapshot the real key state at pointerdown and compare.
 *
 * The chart and the case root arrive through *callback* refs. Cases are wrapped
 * in `LazyMount`, so both elements appear well after this hook first runs —
 * holding them in state is what makes the listeners attach to the real nodes.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  axisTickLabels,
  categoryAtPixel,
  categoryCount,
  categoryPixels,
  getZr,
  gridRect,
  inGrid,
  inspectExport,
  readOption,
  renderedTexts,
  yAxisOrientation,
  type ZrEvent,
} from "./echarts-probe";
import type { ChartBrushRange, ChartHandle, NQMarkEvent } from "@nqlib/nqchart";
import type { CaseEvidence, MarkSample, Modifiers, RawClick } from "./probe-types";

const NO_MODIFIERS: Modifiers = { shift: false, meta: false, alt: false, ctrl: false };

function modsFrom(e: MouseEvent | KeyboardEvent | null): Modifiers {
  if (!e) return NO_MODIFIERS;
  return { shift: e.shiftKey, meta: e.metaKey, alt: e.altKey, ctrl: e.ctrlKey };
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function emptyEvidence(reducedMotion: boolean): CaseEvidence {
  return {
    ready: false,
    option: null,
    texts: [],
    axisTicks: { x: [], yLeft: [], yRight: [] },
    categoryPixels: [],
    root: null,
    gridRect: null,
    yAxisOrientation: null,
    handleTimedOut: false,
    marks: [],
    rawClicks: [],
    domClicks: 0,
    legendSelections: [],
    brushRanges: [],
    brushPlotted: [],
    arrowKeys: 0,
    exportSample: null,
    importWarnings: [],
    reducedMotion,
    epoch: 0,
  };
}

export type PageSink = {
  onMarkClick?: (event: NQMarkEvent) => void;
  onLegendSelect?: (selected: string | null) => void;
  onBrushChange?: (range: ChartBrushRange) => void;
  setExportNote?: (note: string) => void;
  /** Page-level ECharts import warnings — same list for every case. */
  importWarnings?: string[];
};

export type CaseProbe = {
  /** Pass to the chart's `chartRef` prop. */
  attachChart: (handle: ChartHandle | null) => void;
  /** Put on the element wrapping the chart — the root for DOM-level checks. */
  attachRoot: (el: HTMLDivElement | null) => void;
  /** Pass as `onMarkClick`. Records the event *and* the real modifier state. */
  onMarkClick: (event: NQMarkEvent) => void;
  onLegendSelect: (selected: string | null) => void;
  onBrushChange: (range: ChartBrushRange) => void;
  /** Runs `toDataURL()` and decodes the result. */
  runExport: () => void;
  evidence: CaseEvidence;
  /** Re-read the compiled option and display list. Discards nothing. */
  refresh: () => void;
  /** Discard all recorded evidence for this case. */
  reset: () => void;
};

export function useCaseProbe(sink?: PageSink, caseId?: string): CaseProbe {
  const handleRef = useRef<ChartHandle | null>(null);
  const [root, setRoot] = useState<HTMLElement | null>(null);
  /** Bumped when the chart handle is (re)assigned, so effects re-attach. */
  const [handleEpoch, setHandleEpoch] = useState(0);

  const [evidence, setEvidence] = useState<CaseEvidence>(() =>
    emptyEvidence(prefersReducedMotion()),
  );

  /** Ground truth for modifiers, refreshed on every pointerdown / keydown. */
  const liveMods = useRef<Modifiers>(NO_MODIFIERS);
  /** When Enter was last pressed — used to attribute a mark to the keyboard. */
  const enterAt = useRef(0);
  /** Mark events counted synchronously, so a zr click can tell if one followed. */
  const markCount = useRef(0);
  const markAtDown = useRef(0);

  const attachChart = useCallback((handle: ChartHandle | null) => {
    handleRef.current = handle;
    setHandleEpoch((n) => n + 1);
  }, []);

  const attachRoot = useCallback((el: HTMLDivElement | null) => {
    setRoot(el);
  }, []);

  const instance = useCallback(() => handleRef.current?.getInstance?.() ?? null, []);

  const snapshot = useCallback(() => {
    const inst = instance();
    const option = readOption(inst);
    const categories = categoryCount(option);
    setEvidence((prev) => ({
      ...prev,
      ready: Boolean(inst),
      option,
      texts: renderedTexts(inst),
      axisTicks: {
        x: axisTickLabels(inst, "xAxis", 0),
        yLeft: axisTickLabels(inst, "yAxis", 0),
        yRight: axisTickLabels(inst, "yAxis", 1),
      },
      categoryPixels: categoryPixels(inst, categories),
      gridRect: gridRect(inst),
      yAxisOrientation: yAxisOrientation(inst),
      root,
      epoch: prev.epoch + 1,
    }));
  }, [instance, root]);

  /**
   * ECharts initialises asynchronously after the handle lands — poll until the
   * option is actually readable, then read once more after the intro settles.
   *
   * Success is "the option has series", not "an instance exists". The instance
   * appears before the first render, so stopping there hands the checks an
   * empty option and they report a missing handle on a chart that is merely
   * slow — which on a page of three dozen charts is most of them.
   *
   * The poll is gated on `root`, and that gate is load-bearing: cards are
   * lazily mounted, so a hook that started counting at first render would run
   * out long before a card the tester has not scrolled to yet ever mounts, and
   * `handleTimedOut` would libel every off-screen chart as lacking `chartRef`.
   */
  useEffect(() => {
    if (!root) return;
    let cancelled = false;
    let tries = 0;
    const tick = () => {
      if (cancelled) return;
      const inst = instance();
      const option = inst ? readOption(inst) : null;
      const series = option?.series;
      const painted = Array.isArray(series) ? series.length > 0 : Boolean(series);
      if (painted) {
        snapshot();
        window.setTimeout(() => !cancelled && snapshot(), 900);
        return;
      }
      if (tries++ > 60) {
        // Six seconds with a mounted root and nothing to read is not a slow
        // start — either this root does not accept `chartRef`, or it compiled
        // no series. Take the last reading so the checks can say which.
        snapshot();
        setEvidence((prev) =>
          prev.handleTimedOut ? prev : { ...prev, handleTimedOut: true },
        );
        return;
      }
      window.setTimeout(tick, 100);
    };
    tick();
    return () => {
      cancelled = true;
    };
  }, [instance, snapshot, handleEpoch, root]);

  // The empty / error states render no canvas at all, so DOM-only checks must
  // see the root as soon as it mounts rather than waiting on a chart instance
  // that will never arrive.
  useEffect(() => {
    setEvidence((prev) =>
      prev.root === root ? prev : { ...prev, root, handleTimedOut: false },
    );
  }, [root]);

  // Page-level import warnings — a pie miss must fail the modules case even
  // when this card's own chart is fine.
  useEffect(() => {
    const next = sink?.importWarnings ?? [];
    setEvidence((prev) => {
      if (
        prev.importWarnings.length === next.length &&
        prev.importWarnings.every((w, i) => w === next[i])
      ) {
        return prev;
      }
      return { ...prev, importWarnings: next };
    });
  }, [sink?.importWarnings]);

  /**
   * When a check disagrees with what you can plainly see, the question is
   * always "what did the harness actually record?". Publish the raw evidence
   * in dev so it can be read from the console: `__nqLab['interaction.empty-plot']`.
   */
  useEffect(() => {
    if (!import.meta.env.DEV || !caseId) return;
    // Mutate rather than replace: three dozen cards writing their own key would
    // otherwise clobber each other whenever two land in the same commit.
    const w = window as unknown as { __nqLab?: Record<string, CaseEvidence> };
    w.__nqLab ??= {};
    w.__nqLab[caseId] = evidence;
  }, [caseId, evidence]);

  // Reduced motion is an environment fact, not a tester opinion.
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setEvidence((prev) => ({ ...prev, reducedMotion: mq.matches }));
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Capture the real key state before any chart handler can see it.
  useEffect(() => {
    if (!root) return;

    const onPointerDown = (e: PointerEvent) => {
      liveMods.current = modsFrom(e);
      markAtDown.current = markCount.current;
    };
    // Counted on the DOM so families with no chart handle are still measurable.
    // Also the only re-read trigger for the DOM legend: it is a React legend,
    // not a canvas one, so its clicks never reach the zrender handler, and the
    // uncontrolled case has no callback to hook either.
    const onClick = () => {
      setEvidence((prev) => ({ ...prev, domClicks: prev.domClicks + 1 }));
      window.setTimeout(snapshot, 120);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      liveMods.current = modsFrom(e);
      if (e.key === "Enter" || e.key === " ") {
        enterAt.current = performance.now();
        markAtDown.current = markCount.current;
      }
      if (e.key.startsWith("Arrow")) {
        setEvidence((prev) => ({ ...prev, arrowKeys: prev.arrowKeys + 1 }));
      }
    };

    root.addEventListener("pointerdown", onPointerDown, true);
    root.addEventListener("keydown", onKeyDown, true);
    root.addEventListener("click", onClick, true);
    return () => {
      root.removeEventListener("pointerdown", onPointerDown, true);
      root.removeEventListener("keydown", onKeyDown, true);
      root.removeEventListener("click", onClick, true);
    };
  }, [root, snapshot]);

  // Classify every canvas click, whether or not the library emitted a mark event.
  useEffect(() => {
    if (!root) return;
    let zr: ReturnType<typeof getZr> = null;
    let attached = false;
    let cancelled = false;

    const onZrClick = (e: ZrEvent) => {
      const inst = instance();
      const x = e.offsetX;
      const y = e.offsetY;
      const insideGrid = inGrid(inst, x, y);
      const dataIndex = insideGrid ? categoryAtPixel(inst, x, y) : null;
      const modifiers = liveMods.current;
      const before = markAtDown.current;
      // A series click dispatches within this same event — before or after us,
      // depending on handler order — so settle on the next macrotask.
      window.setTimeout(() => {
        const click: RawClick = {
          x,
          y,
          inGrid: insideGrid,
          dataIndex,
          hitMark: markCount.current > before,
          modifiers,
        };
        setEvidence((prev) => ({ ...prev, rawClicks: [...prev.rawClicks, click].slice(-40) }));
      }, 0);
      // A canvas click can change the option (legend toggle, brush) with no
      // React callback to tell us — re-read once the chart has settled.
      window.setTimeout(snapshot, 140);
    };

    let tries = 0;
    const attach = () => {
      if (cancelled || attached) return;
      zr = getZr(instance());
      if (zr) {
        zr.on("click", onZrClick);
        attached = true;
        return;
      }
      if (tries++ > 60) return;
      window.setTimeout(attach, 100);
    };
    attach();

    return () => {
      cancelled = true;
      if (zr && attached) zr.off("click", onZrClick);
    };
  }, [instance, snapshot, handleEpoch, root]);

  const onMarkClick = useCallback(
    (event: NQMarkEvent) => {
      markCount.current += 1;
      const fromKeyboard = performance.now() - enterAt.current < 400;
      const sample: MarkSample = { event, actualModifiers: liveMods.current, fromKeyboard };
      setEvidence((prev) => ({ ...prev, marks: [...prev.marks, sample].slice(-40) }));
      sink?.onMarkClick?.(event);
    },
    [sink],
  );

  const onLegendSelect = useCallback(
    (selected: string | null) => {
      setEvidence((prev) => ({
        ...prev,
        legendSelections: [...prev.legendSelections, selected].slice(-20),
      }));
      sink?.onLegendSelect?.(selected);
      // The option's `selected` map only updates after the chart re-renders.
      window.setTimeout(snapshot, 60);
    },
    [sink, snapshot],
  );

  const onBrushChange = useCallback(
    (range: ChartBrushRange) => {
      setEvidence((prev) => ({
        ...prev,
        brushRanges: [...prev.brushRanges, range].slice(-20),
      }));
      sink?.onBrushChange?.(range);
      // The brush slices `data` in React, so the compiled option still holds the
      // previous window at the moment the event fires — read it once the chart
      // has re-rendered, not now.
      window.setTimeout(() => {
        const plotted = categoryCount(readOption(instance()));
        if (plotted > 0) {
          setEvidence((prev) => ({
            ...prev,
            brushPlotted: [...prev.brushPlotted, plotted].slice(-20),
          }));
        }
      }, 250);
    },
    [instance, sink],
  );

  const runExport = useCallback(() => {
    const url = handleRef.current?.toDataURL?.() ?? "";
    if (!url) {
      setEvidence((prev) => ({
        ...prev,
        exportSample: { ok: false, isPng: false, opaque: false, corner: "—", bytes: 0 },
      }));
      sink?.setExportNote?.("no handle — needs local nqchart chartRef");
      return;
    }
    void inspectExport(url).then((sample) => {
      setEvidence((prev) => ({ ...prev, exportSample: sample }));
      sink?.setExportNote?.(
        `${sample.isPng ? "PNG" : "not PNG"} · ${sample.opaque ? "opaque" : "TRANSPARENT"} ${sample.corner}`,
      );
    });
  }, [sink]);

  const reset = useCallback(() => {
    markCount.current = 0;
    markAtDown.current = 0;
    setEvidence({
      ...emptyEvidence(prefersReducedMotion()),
      importWarnings: sink?.importWarnings ?? [],
    });
    window.setTimeout(snapshot, 0);
  }, [snapshot, sink?.importWarnings]);

  return useMemo(
    () => ({
      attachChart,
      attachRoot,
      onMarkClick,
      onLegendSelect,
      onBrushChange,
      runExport,
      evidence,
      refresh: snapshot,
      reset,
    }),
    [
      attachChart,
      attachRoot,
      onMarkClick,
      onLegendSelect,
      onBrushChange,
      runExport,
      evidence,
      snapshot,
      reset,
    ],
  );
}
