import type { ComponentType } from "react";
import type { CatalogEntry } from "./manifest";

const loaders: Record<string, () => Promise<Record<string, ComponentType>>> = {
  "ex-doc-charts.tsx": () => import("./adapters/ex-doc-charts") as Promise<Record<string, ComponentType>>,
  "ex-bar-chart.tsx": () => import("./adapters/ex-bar-chart") as Promise<Record<string, ComponentType>>,
  "ex-boxplot-chart.tsx": () => import("./adapters/ex-boxplot-chart") as Promise<Record<string, ComponentType>>,
  "ex-bullet-chart.tsx": () => import("./adapters/ex-bullet-chart") as Promise<Record<string, ComponentType>>,
  "ex-calendar-workload-chart.tsx": () => import("./adapters/ex-calendar-workload-chart") as Promise<Record<string, ComponentType>>,
  "ex-composed-chart.tsx": () => import("./adapters/ex-composed-chart") as Promise<Record<string, ComponentType>>,
  "ex-gauge-chart.tsx": () => import("./adapters/ex-gauge-chart") as Promise<Record<string, ComponentType>>,
  "ex-gauge-with-target-chart.tsx": () => import("./adapters/ex-gauge-with-target-chart") as Promise<Record<string, ComponentType>>,
  "ex-hatched-variant-bar-chart.tsx": () => import("./adapters/ex-hatched-variant-bar-chart") as Promise<Record<string, ComponentType>>,
  "ex-heatmap-chart.tsx": () => import("./adapters/ex-heatmap-chart") as Promise<Record<string, ComponentType>>,
  "ex-heatmap-correlation-chart.tsx": () => import("./adapters/ex-heatmap-correlation-chart") as Promise<Record<string, ComponentType>>,
  "ex-heatmap-team-workload-chart.tsx": () => import("./adapters/ex-heatmap-team-workload-chart") as Promise<Record<string, ComponentType>>,
  "ex-heatmap-weekly-chart.tsx": () => import("./adapters/ex-heatmap-weekly-chart") as Promise<Record<string, ComponentType>>,
  "ex-histogram-chart.tsx": () => import("./adapters/ex-histogram-chart") as Promise<Record<string, ComponentType>>,
  "ex-horizontal-layout-bar-chart.tsx": () => import("./adapters/ex-horizontal-layout-bar-chart") as Promise<Record<string, ComponentType>>,
  "ex-ui-charts.tsx": () => import("./adapters/ex-ui-charts") as Promise<Record<string, ComponentType>>,
  "ex-line-chart.tsx": () => import("./adapters/ex-line-chart") as Promise<Record<string, ComponentType>>,
  "ex-loading-state-bar-chart.tsx": () => import("./adapters/ex-loading-state-bar-chart") as Promise<Record<string, ComponentType>>,
  "ex-loading-state-composed-chart.tsx": () => import("./adapters/ex-loading-state-composed-chart") as Promise<Record<string, ComponentType>>,
  "ex-loading-state-histogram-chart.tsx": () => import("./adapters/ex-loading-state-histogram-chart") as Promise<Record<string, ComponentType>>,
  "ex-loading-state-line-chart.tsx": () => import("./adapters/ex-loading-state-line-chart") as Promise<Record<string, ComponentType>>,
  "ex-loading-state-pareto-chart.tsx": () => import("./adapters/ex-loading-state-pareto-chart") as Promise<Record<string, ComponentType>>,
  "ex-pareto-chart.tsx": () => import("./adapters/ex-pareto-chart") as Promise<Record<string, ComponentType>>,
  "ex-percent-type-bar-chart.tsx": () => import("./adapters/ex-percent-type-bar-chart") as Promise<Record<string, ComponentType>>,
  "ex-pie-chart.tsx": () => import("./adapters/ex-pie-chart") as Promise<Record<string, ComponentType>>,
  "ex-stacked-type-bar-chart.tsx": () => import("./adapters/ex-stacked-type-bar-chart") as Promise<Record<string, ComponentType>>,
  "ex-stripped-variant-bar-chart.tsx": () => import("./adapters/ex-stripped-variant-bar-chart") as Promise<Record<string, ComponentType>>,
  "ex-workload-dashboard-chart.tsx": () => import("./adapters/ex-workload-dashboard-chart") as Promise<Record<string, ComponentType>>,
  "b-grid-bar-chart.tsx": () => import("./adapters/b-grid-bar-chart") as Promise<Record<string, ComponentType>>,
  "b-hover-trace-bar-chart.tsx": () => import("./adapters/b-hover-trace-bar-chart") as Promise<Record<string, ComponentType>>,
  "b-isometric-bar-chart.tsx": () => import("./adapters/b-isometric-bar-chart") as Promise<Record<string, ComponentType>>,
  "b-monospace-bar-chart.tsx": () => import("./adapters/b-monospace-bar-chart") as Promise<Record<string, ComponentType>>,
};

export async function loadCatalogComponent(
  entry: CatalogEntry,
): Promise<ComponentType> {
  const mod = await loaders[entry.adapterFile]!();
  const Comp = mod[entry.exportName];
  if (!Comp) {
    throw new Error(`Missing export ${entry.exportName} in ${entry.adapterFile}`);
  }
  return Comp;
}
