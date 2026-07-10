import { useEffect } from "react";

const ENDPOINT =
  "http://127.0.0.1:7714/ingest/c82bf6ba-bba1-4955-85bb-689d40689e00";
const SESSION = "efcfd7";

function log(
  hypothesisId: string,
  location: string,
  message: string,
  data: Record<string, unknown>,
) {
  // #region agent log
  fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": SESSION,
    },
    body: JSON.stringify({
      sessionId: SESSION,
      hypothesisId,
      location,
      message,
      data,
      timestamp: Date.now(),
      runId: "button-chrome",
    }),
  }).catch(() => {});
  // #endregion
}

function parseAlpha(color: string): number | null {
  const slash = color.match(/\/\s*([\d.]+)\s*\)/);
  if (slash) return Number(slash[1]);
  if (color.startsWith("rgba")) {
    const m = color.match(/rgba?\([^)]*,\s*([\d.]+)\s*\)/);
    return m ? Number(m[1]) : null;
  }
  return 1;
}

function parseRgb(color: string): { r: number; g: number; b: number } | null {
  const m = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!m) return null;
  return { r: Number(m[1]), g: Number(m[2]), b: Number(m[3]) };
}

function luminance(rgb: { r: number; g: number; b: number }): number {
  return (0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b) / 255;
}

/** Samples DOM after Gantt paint — bar fills vs sidebar dots, group progress SVG. */
export function GanttBarDebugProbe({ rootRef }: { rootRef: React.RefObject<HTMLElement | null> }) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const sample = () => {
      const isDark = document.documentElement.classList.contains("dark");
      const gantt = root.querySelector(".gantt");
      if (!gantt) return;

      // H3: sidebar dots use full status color; bars use muted pill mix
      const sidebarRows = [...gantt.querySelectorAll("[data-focus-id]")].slice(0, 4);
      const dotVsBar = sidebarRows.map((row) => {
        const id = row.getAttribute("data-focus-id");
        const dot = row.querySelector(".rounded-full");
        const barHit = row.querySelector("[data-gantt-bar-hit]");
        const featureBar = barHit?.querySelector("[data-gantt-feature-bar]");
        const dotStyle = dot ? getComputedStyle(dot) : null;
        const barStyle = featureBar ? getComputedStyle(featureBar) : null;
        const dotBg = dotStyle?.backgroundColor ?? "none";
        const barBg = barStyle?.backgroundColor ?? "none";
        const dotRgb = parseRgb(dotBg);
        const barRgb = parseRgb(barBg);
        return {
          id,
          dotBg,
          barBg,
          dotLuma: dotRgb ? luminance(dotRgb) : null,
          barLuma: barRgb ? luminance(barRgb) : null,
          barOpacity: barStyle?.opacity ?? "1",
          barCssVars: featureBar
            ? {
                bg: (featureBar as HTMLElement).style.getPropertyValue("--gantt-bar-bg"),
                hover: (featureBar as HTMLElement).style.getPropertyValue(
                  "--gantt-bar-hover-bg",
                ),
              }
            : null,
          isSummary: featureBar?.getAttribute("data-gantt-summary") === "true",
        };
      });

      log("H3", "gantt-bar-debug-probe.tsx:sample", "sidebar dot vs bar luminance", {
        isDark,
        dotVsBar,
      });

      // H1/H2: dark-mode CSS fill tokens on task pills
      const taskBar = gantt.querySelector(
        '[data-gantt-feature-bar]:not([data-gantt-summary="true"])',
      ) as HTMLElement | null;
      if (taskBar) {
        const cs = getComputedStyle(taskBar);
        const ganttCs = getComputedStyle(gantt);
        log("H1", "gantt-bar-debug-probe.tsx:taskBar", "task bar computed fill", {
          isDark,
          backgroundColor: cs.backgroundColor,
          backgroundAlpha: parseAlpha(cs.backgroundColor),
          opacity: cs.opacity,
          cssVarAccent: taskBar.style.getPropertyValue("--gantt-bar-accent"),
          cssVarBg: taskBar.style.getPropertyValue("--gantt-bar-bg"),
          cssVarHover: taskBar.style.getPropertyValue("--gantt-bar-hover-bg"),
          trackTint: ganttCs.getPropertyValue("--gantt-bar-track-tint").trim(),
          doneTint: ganttCs.getPropertyValue("--gantt-bar-done-tint").trim(),
          progressGap: ganttCs.getPropertyValue("--gantt-bar-progress-gap").trim(),
          trackBase: ganttCs.getPropertyValue("--gantt-bar-track-base").trim(),
          doneBase: ganttCs.getPropertyValue("--gantt-bar-done-base").trim(),
          luma: parseRgb(cs.backgroundColor)
            ? luminance(parseRgb(cs.backgroundColor)!)
            : null,
          borderRadius: cs.borderRadius,
          boxShadow: cs.boxShadow,
          hasInsetHighlight: cs.boxShadow.includes("inset"),
          hasOuterGlow: cs.boxShadow.split(",").length >= 3,
          isPill: cs.borderRadius.includes("9999") || parseFloat(cs.borderRadius) >= 9000,
        });
      }

      // H10: compare task bar chrome vs page "New task" button
      const newTaskBtn = document.querySelector(
        'button[class*="h-8"]',
      ) as HTMLElement | null;
      const barForChrome = gantt.querySelector(
        '[data-gantt-feature-bar]:not([data-gantt-summary="true"])',
      ) as HTMLElement | null;
      if (newTaskBtn && barForChrome) {
        const btnCs = getComputedStyle(newTaskBtn);
        const barCs = getComputedStyle(barForChrome);
        log("H10", "gantt-bar-debug-probe.tsx:chrome", "bar vs New task button chrome", {
          isDark,
          btnBorderRadius: btnCs.borderRadius,
          barBorderRadius: barCs.borderRadius,
          btnBoxShadow: btnCs.boxShadow,
          barBoxShadow: barCs.boxShadow,
          btnGlowLayers: btnCs.boxShadow.split(",").length,
          barGlowLayers: barCs.boxShadow.split(",").length,
          pillMatch:
            btnCs.borderRadius === barCs.borderRadius
            || (barCs.borderRadius.includes("9999") && btnCs.borderRadius.includes("9999")),
        });
      }

      // H4: group bracket progress — gradient vs solid rect in published bundle
      const summaryBar = gantt.querySelector('[data-gantt-summary="true"]');
      const svg = summaryBar?.querySelector("svg");
      const progressGrad = svg?.querySelector("linearGradient[id*='progress']");
      const progressRects = svg ? [...svg.querySelectorAll("rect")] : [];
      log("H4", "gantt-bar-debug-probe.tsx:summary", "group bar SVG progress structure", {
        isDark,
        hasProgressGradient: Boolean(progressGrad),
        gradientIds: svg
          ? [...svg.querySelectorAll("linearGradient")].map((g) => g.id)
          : [],
        rectFills: progressRects.map((r) => ({
          width: r.getAttribute("width"),
          fill: r.getAttribute("fill"),
        })),
        summaryOpacity: summaryBar ? getComputedStyle(summaryBar).opacity : null,
      });

      // H5: bracket opacity ramp on incomplete groups
      const summaryBars = [...gantt.querySelectorAll('[data-gantt-summary="true"]')].slice(
        0,
        3,
      );
      log("H5", "gantt-bar-debug-probe.tsx:opacity", "summary bar wrapper opacity", {
        isDark,
        opacities: summaryBars.map((el) => ({
          opacity: getComputedStyle(el).opacity,
          progress: el.getAttribute("aria-valuenow"),
        })),
      });

      // H6: In Progress primary task (t3) — dot should match button hue
      const primaryRow = gantt.querySelector('[data-focus-id="t3"]');
      if (primaryRow) {
        const dot = primaryRow.querySelector(".rounded-full");
        const featureBar = primaryRow
          .querySelector("[data-gantt-bar-hit]")
          ?.querySelector("[data-gantt-feature-bar]") as HTMLElement | null;
        const dotBg = dot ? getComputedStyle(dot).backgroundColor : "none";
        const barBg = featureBar ? getComputedStyle(featureBar).backgroundColor : "none";
        log("H6", "gantt-bar-debug-probe.tsx:primary", "t3 Apple Pay dot vs bar", {
          isDark,
          dotBg,
          barBg,
          barAlpha: featureBar ? parseAlpha(getComputedStyle(featureBar).backgroundColor) : null,
          accent: featureBar?.style.getPropertyValue("--gantt-bar-accent") ?? "",
          ring: featureBar?.style.getPropertyValue("--gantt-bar-ring") ?? "",
          primaryToken: getComputedStyle(document.documentElement).getPropertyValue(
            "--primary",
          ),
        });

        // H8: filled vs unfilled contrast on partial-progress task
        const progressFill = featureBar?.querySelector(
          '[role="progressbar"] > div[aria-hidden="true"]',
        ) as HTMLElement | null;
        if (progressFill && featureBar) {
          const filledBg = getComputedStyle(progressFill).backgroundColor;
          const openBg = getComputedStyle(featureBar).backgroundColor;
          const filledRgb = parseRgb(filledBg);
          const openRgb = parseRgb(openBg);
          log("H8", "gantt-bar-debug-probe.tsx:contrast", "filled vs unfilled luminance", {
            isDark,
            progress: primaryRow.querySelector("[role=progressbar]")?.getAttribute("aria-valuenow"),
            trackTint: getComputedStyle(gantt).getPropertyValue("--gantt-bar-track-tint").trim(),
            doneTint: getComputedStyle(gantt).getPropertyValue("--gantt-bar-done-tint").trim(),
            filledBg,
            openBg,
            filledLuma: filledRgb ? luminance(filledRgb) : null,
            openLuma: openRgb ? luminance(openRgb) : null,
            lumaDelta:
              filledRgb && openRgb ? luminance(filledRgb) - luminance(openRgb) : null,
            filledAlpha: parseAlpha(filledBg),
            openAlpha: parseAlpha(openBg),
          });
        }
      }

      // H9: group rollup bar width should span child extent (stale rollup check)
      const rollupBar = gantt.querySelector('[data-gantt-group-rollup="true"]') as HTMLElement | null;
      if (rollupBar) {
        const rollupHit = rollupBar.closest("[data-gantt-bar-hit]") as HTMLElement | null;
        const childHits = [...gantt.querySelectorAll("[data-gantt-bar-hit]")].filter(
          (el) =>
            el !== rollupHit
            && !el.querySelector('[data-gantt-group-rollup="true"]')
            && !el.querySelector('[data-gantt-summary="true"]'),
        );
        const rollupWidth = rollupHit?.getBoundingClientRect().width ?? 0;
        const maxChildWidth = childHits.reduce(
          (max, el) => Math.max(max, el.getBoundingClientRect().width),
          0,
        );
        log("H9", "gantt-bar-debug-probe.tsx:rollup", "group rollup vs child bar widths", {
          isDark,
          rollupWidth: Math.round(rollupWidth),
          maxChildWidth: Math.round(maxChildWidth),
          childCount: childHits.length,
          rollupSpansChildren: rollupWidth >= maxChildWidth - 4,
        });
      }
    };

    const t = window.setTimeout(sample, 800);
    return () => window.clearTimeout(t);
  }, [rootRef]);

  return null;
}
