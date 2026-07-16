import {
  Children,
  cloneElement,
  createElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";
import {
  ChartBackground,
  type BackgroundVariant,
} from "@nqlib/nqchart";
import { Grid as AreaGrid } from "@nqlib/nqchart/area-chart";
import { Grid as BarGrid } from "@nqlib/nqchart/bar-chart";
import { Grid as LineGrid } from "@nqlib/nqchart/line-chart";
import { Grid as ComposedGrid } from "@nqlib/nqchart/composed-chart";
import { Grid as ScatterGrid } from "@nqlib/nqchart/scatter-chart";
import { Grid as WaterfallGrid } from "@nqlib/nqchart/waterfall-chart";
import { Grid as HeatmapGrid } from "@nqlib/nqchart/heatmap-chart";
import { Grid as CalendarGrid } from "@nqlib/nqchart/calendar-chart";

export type TooltipPreviewMode = "default" | "frosted-glass" | "hidden";

/**
 * Families that compose `<ChartBackground />`.
 * Matches nqchart docs (cartesian + sparkline) plus scatter (local plotRect clip).
 */
const BACKGROUND_FAMILIES = new Set([
  "area",
  "line",
  "bar",
  "composed",
  "sparkline",
  "scatter",
  "waterfall",
]);

/**
 * Per-family `Grid` exports. Match by function reference so minified build
 * names (`d`, `h`, …) still strip when a wallpaper is selected.
 */
const CARTESIAN_GRID_TYPES = new Set<unknown>([
  AreaGrid,
  BarGrid,
  LineGrid,
  ComposedGrid,
  ScatterGrid,
  WaterfallGrid,
  HeatmapGrid,
  CalendarGrid,
]);

function componentName(type: unknown): string {
  if (typeof type === "string") return type;
  if (typeof type === "function") {
    const fn = type as { displayName?: string; name?: string };
    return fn.displayName ?? fn.name ?? "";
  }
  if (type && typeof type === "object" && "displayName" in type) {
    return String((type as { displayName?: string }).displayName ?? "");
  }
  return "";
}

/** True when this element is `<ChartBackground />` (reference, displayName, or prop shape). */
function isBackgroundChild(child: ReactElement): boolean {
  if (child.type === ChartBackground) return true;
  const name = componentName(child.type);
  if (name === "NQChartBackground" || name === "ChartBackground") return true;
  if (
    (name === "Background" || name.toLowerCase().includes("background")) &&
    child.props != null &&
    typeof child.props === "object" &&
    "variant" in (child.props as object)
  ) {
    return true;
  }
  return false;
}

/**
 * Minified `@nqlib/nqchart` renames `Grid` → single letters (`y`, `d`, …) and Vite
 * can duplicate the package across chunks, so both `Set.has(type)` and `.name`
 * fail. Fingerprint the `useRegisterPart({ type: "grid" })` body instead.
 * Does not match PolarGrid (`type: "polarGrid"`).
 */
function registersCartesianGrid(type: unknown): boolean {
  if (typeof type !== "function") return false;
  try {
    return /type\s*:\s*["']grid["']/.test(Function.prototype.toString.call(type));
  } catch {
    return false;
  }
}

/**
 * Cartesian `<Grid />` value guides (not PolarGrid).
 * nqchart: use Grid *or* ChartBackground — stacking both fights the same space.
 */
function isCartesianGridChild(child: ReactElement): boolean {
  if (CARTESIAN_GRID_TYPES.has(child.type)) return true;
  const name = componentName(child.type);
  if (name === "PolarGrid" || name.includes("Polar")) return false;
  if (name === "Grid" || name === "NQChartGrid") return true;
  return registersCartesianGrid(child.type);
}

/**
 * True for an `NQ*Chart` root (or minified root with `config` + children).
 * Excludes showcase SVG shells and plain wrappers.
 */
function isChartRootElement(el: ReactElement): boolean {
  const name = componentName(el.type);
  if (name === "CatalogChartContainer") return false;
  if (/^NQ\w*Chart$/.test(name)) return true;
  const props = el.props as Record<string, unknown> | null;
  return (
    !!props &&
    typeof props === "object" &&
    "config" in props &&
    Children.count(props.children as ReactNode) > 0
  );
}

/** Prop-driven background SSOT (sparkline root, UiLineChartShell, etc.). */
function hasBackgroundVariantProp(el: ReactElement): boolean {
  const props = el.props as Record<string, unknown> | null;
  return !!props && typeof props === "object" && "backgroundVariant" in props;
}

/**
 * Chart roots that accept a composed `<ChartBackground />` child.
 * Prefer catalog `family` (survives minified displayNames); fall back to name.
 */
function supportsComposedBackground(
  el: ReactElement,
  family?: string,
): boolean {
  if (!isChartRootElement(el)) return false;
  // Prop-driven roots render their own background — don't also compose a child.
  if (hasBackgroundVariantProp(el)) return false;
  if (family) return BACKGROUND_FAMILIES.has(family);
  const name = componentName(el.type);
  if (/^NQ(Area|Line|Bar|Composed|Sparkline|Scatter|Waterfall)Chart$/.test(name)) {
    return true;
  }
  if (/^NQ\w*Chart$/.test(name)) {
    return /Area|Line|Bar|Composed|Sparkline|Scatter|Waterfall/.test(name);
  }
  return false;
}

function isTooltipChild(child: ReactElement): boolean {
  const name = componentName(child.type);
  if (name === "Tooltip" || name.endsWith("Tooltip") || name.includes("Tooltip")) {
    return true;
  }
  const props = child.props as Record<string, unknown>;
  if (!props || typeof props !== "object") return false;
  const keys = Object.keys(props);
  if (keys.length === 0) return false;
  const tooltipKeys = ["variant", "roundness", "hide", "hideLabel", "hideIndicator"];
  return keys.every((k) => tooltipKeys.includes(k)) && keys.some((k) => tooltipKeys.includes(k));
}

function patchTooltip(
  el: ReactElement<Record<string, unknown>>,
  opts: { tooltip: TooltipPreviewMode },
) {
  if (opts.tooltip === "hidden") {
    return cloneElement(el, { hide: true });
  }
  if (opts.tooltip === "frosted-glass") {
    return cloneElement(el, { hide: false, variant: "frosted-glass" });
  }
  return cloneElement(el, { hide: false, variant: undefined });
}

export type PreviewControlOpts = {
  background: BackgroundVariant | "none";
  tooltip: TooltipPreviewMode;
  /** Catalog entry family — used so minified `NQ*Chart` roots still get the right SSOT path. */
  family?: string;
};

/**
 * Apply global catalog preview controls through the example element tree.
 *
 * Background SSOT (matches nqchart: opt-in, pattern XOR Grid):
 * - `"none"` → no ChartBackground; keep composed `<Grid />` value guides
 * - a pattern → exactly one ChartBackground; strip `<Grid />` so guides don't stack on wallpaper
 *
 * Prop-driven roots (`backgroundVariant`) use the prop only.
 */
export function applyChartPreviewControls(
  node: ReactNode,
  opts: PreviewControlOpts,
): ReactNode {
  if (node == null || typeof node === "boolean") return node;
  if (Array.isArray(node)) {
    return node.map((child, i) => {
      const next = applyChartPreviewControls(child, opts);
      if (isValidElement(next) && next.key == null) {
        return cloneElement(next, { key: i });
      }
      return next;
    });
  }
  if (!isValidElement(node)) return node;

  return patchElement(node as ReactElement<Record<string, unknown>>, opts);
}

function patchElement(
  el: ReactElement<Record<string, unknown>>,
  opts: PreviewControlOpts,
): ReactElement {
  if (isBackgroundChild(el)) {
    if (opts.background === "none") {
      return createElement("span", {
        key: el.key,
        "data-nq-preview-bg-removed": "",
        style: { display: "none" },
      });
    }
    return cloneElement(el, { variant: opts.background });
  }

  // Pattern selected → drop Grid at this node too (walk may hit Grid as root of a fragment-less tree).
  if (isCartesianGridChild(el) && opts.background !== "none") {
    return createElement("span", {
      key: el.key,
      "data-nq-preview-grid-removed": "",
      style: { display: "none" },
    });
  }

  if (isTooltipChild(el)) {
    return patchTooltip(el, opts);
  }

  const props = el.props;
  const rawKids = Children.toArray(props.children as ReactNode);
  let keptBackground: ReactElement | null = null;

  const mappedKids: ReactNode[] = rawKids.flatMap((child) => {
    if (!isValidElement(child)) return [child];
    const childEl = child as ReactElement<Record<string, unknown>>;

    if (isBackgroundChild(childEl)) {
      if (opts.background === "none") return [];
      if (keptBackground) return [];
      keptBackground = cloneElement(childEl, { variant: opts.background });
      return [keptBackground];
    }

    // nqchart: pattern XOR Grid — never stack dotted value guides on wallpaper.
    if (isCartesianGridChild(childEl) && opts.background !== "none") {
      return [];
    }

    if (isTooltipChild(childEl)) {
      return [patchTooltip(childEl, opts)];
    }

    return [patchElement(childEl, opts)];
  });

  const nextProps: Record<string, unknown> = {};
  const propDriven = hasBackgroundVariantProp(el);

  if (propDriven) {
    nextProps.backgroundVariant =
      opts.background === "none" ? undefined : opts.background;
  } else if (
    supportsComposedBackground(el, opts.family) &&
    opts.background !== "none" &&
    !keptBackground
  ) {
    mappedKids.unshift(
      createElement(ChartBackground, {
        key: "nq-preview-bg",
        variant: opts.background,
      }),
    );
  }

  return cloneElement(el, nextProps, ...mappedKids);
}
