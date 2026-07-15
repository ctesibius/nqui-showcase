import {
  Children,
  cloneElement,
  createElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";
import { ChartBackground, type BackgroundVariant } from "@nqlib/nqchart";

export type TooltipPreviewMode = "default" | "frosted-glass" | "hidden";

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

function isBackgroundChild(child: ReactElement): boolean {
  const name = componentName(child.type);
  return (
    name === "NQChartBackground" ||
    name.includes("ChartBackground") ||
    (name.toLowerCase().includes("background") && "variant" in (child.props as object))
  );
}

/** `NQAreaChart`, `NQBarChart`, … — where ChartBackground / Tooltip compose. */
function isNqChartRoot(child: ReactElement): boolean {
  const name = componentName(child.type);
  if (/^NQ\w*Chart$/.test(name) || name === "ChartContainer") return true;

  const type = child.type as {
    render?: { displayName?: string; name?: string };
  };
  const nested = type?.render?.displayName ?? type?.render?.name ?? "";
  if (/^NQ\w*Chart$/.test(nested)) return true;

  // Local/prod nqchart builds minify wrappers to `T` / `N` with no displayName.
  // Every catalog chart root still receives a `config` prop + composed children.
  const props = child.props as Record<string, unknown> | null;
  return (
    !!props &&
    typeof props === "object" &&
    "config" in props &&
    Children.count(props.children) > 0
  );
}

function isTooltipChild(child: ReactElement): boolean {
  const name = componentName(child.type);
  if (name === "Tooltip" || name.endsWith("Tooltip") || name.includes("Tooltip")) {
    return true;
  }
  // Minified `<Tooltip />` — match by chart-tooltip prop surface.
  const props = child.props as Record<string, unknown>;
  if (!props || typeof props !== "object") return false;
  const keys = Object.keys(props);
  if (keys.length === 0) return false;
  const tooltipKeys = ["variant", "roundness", "hide", "hideLabel", "hideIndicator"];
  return keys.every((k) => tooltipKeys.includes(k)) && keys.some((k) => tooltipKeys.includes(k));
}

function patchTooltip(el: ReactElement<Record<string, unknown>>, opts: { tooltip: TooltipPreviewMode }) {
  if (opts.tooltip === "hidden") {
    return cloneElement(el, { hide: true });
  }
  if (opts.tooltip === "frosted-glass") {
    return cloneElement(el, { hide: false, variant: "frosted-glass" });
  }
  return cloneElement(el, { hide: false, variant: undefined });
}

/**
 * Apply global catalog preview controls through the example element tree:
 * inject/replace ChartBackground, clear baked-in `backgroundVariant`, and
 * set Tooltip variant / hide.
 *
 * Walks nested trees so dashboard / block shells (wrapper `div` → `NQ*Chart`)
 * still receive the control — cloning only the catalog wrapper is a no-op
 * because those components ignore `props.children`.
 */
export function applyChartPreviewControls(
  node: ReactNode,
  opts: {
    background: BackgroundVariant | "none";
    tooltip: TooltipPreviewMode;
  },
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
  opts: {
    background: BackgroundVariant | "none";
    tooltip: TooltipPreviewMode;
  },
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

  if (isTooltipChild(el)) {
    return patchTooltip(el, opts);
  }

  const props = el.props;
  const rawKids = Children.toArray(props.children as ReactNode);
  let sawBackground = false;

  const mappedKids: ReactNode[] = rawKids.flatMap((child) => {
    if (!isValidElement(child)) return [child];
    const childEl = child as ReactElement<Record<string, unknown>>;

    if (isBackgroundChild(childEl)) {
      sawBackground = true;
      if (opts.background === "none") return [];
      return [cloneElement(childEl, { variant: opts.background })];
    }

    if (isTooltipChild(childEl)) {
      return [patchTooltip(childEl, opts)];
    }

    return [patchElement(childEl, opts)];
  });

  const nextProps: Record<string, unknown> = {};
  if ("backgroundVariant" in props) {
    nextProps.backgroundVariant =
      opts.background === "none" ? undefined : opts.background;
  }

  if (isNqChartRoot(el) && opts.background !== "none" && !sawBackground) {
    mappedKids.unshift(
      createElement(ChartBackground, {
        key: "nq-preview-bg",
        variant: opts.background,
      }),
    );
  }

  return cloneElement(el, nextProps, ...mappedKids);
}
