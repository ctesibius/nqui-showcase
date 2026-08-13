import { lazy, Suspense, type ComponentType, type LazyExoticComponent } from "react";
import type { CaseProbe } from "../use-case-probe";
import type { FamilyId } from "./ids";

type FamilyChartComponent = ComponentType<{ probe: CaseProbe }>;

/**
 * One dynamic import per family so `?only=Interaction` never evaluates
 * heatmap/calendar/radar/funnel, and `?family=heatmap` cannot pull funnel.
 */
const FAMILY_CHARTS: Record<FamilyId, LazyExoticComponent<FamilyChartComponent>> = {
  area: lazy(() => import("./area")),
  scatter: lazy(() => import("./scatter")),
  funnel: lazy(() => import("./funnel")),
  waterfall: lazy(() => import("./waterfall")),
  treemap: lazy(() => import("./treemap")),
  radar: lazy(() => import("./radar")),
  radial: lazy(() => import("./radial")),
  sparkline: lazy(() => import("./sparkline")),
  heatmap: lazy(() => import("./heatmap")),
  calendar: lazy(() => import("./calendar")),
};

export function FamilyChart({ id, probe }: { id: FamilyId; probe: CaseProbe }) {
  const Chart = FAMILY_CHARTS[id];
  return (
    <Suspense fallback={null}>
      <Chart probe={probe} />
    </Suspense>
  );
}
