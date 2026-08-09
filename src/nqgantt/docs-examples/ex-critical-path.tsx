import { useCallback, useMemo, useState } from "react";
import { GanttRoot } from "@nqlib/nqgantt/ui";
import { applyAutoSchedule, computeScheduleAnalysis } from "@nqlib/nqgantt";
import type { GanttDependency } from "@nqlib/nqgantt";
import { ExampleControls, ExampleFrame, NAME_ONLY_COLUMNS, STATUS, feature } from "./shared";
import { Badge, Button } from "@nqlib/nqui";

// Two parallel chains into one merge. The long one is critical; the short one
// has float — which is exactly the distinction the page is teaching.
const INITIAL = [
  feature("spec", "Spec", 0, 6, { progress: 100, status: STATUS.done }),
  feature("api", "API build (long)", 7, 24, { progress: 30, status: STATUS.doing }),
  feature("ui", "UI build (short)", 7, 14, { progress: 60, status: STATUS.doing }),
  // Butted directly against the long chain's finish so that chain has zero
  // slack and comes out genuinely critical, leaving the short chain to carry
  // the float. Leave any gap and nothing reads critical but the final task —
  // which teaches the opposite of the point this page is making.
  feature("test", "Integration test", 24, 29, {}),
];

const DEPENDENCIES: GanttDependency[] = [
  { fromId: "spec", toId: "api", type: "FS" },
  { fromId: "spec", toId: "ui", type: "FS" },
  { fromId: "api", toId: "test", type: "FS" },
  { fromId: "ui", toId: "test", type: "FS" },
];

/** Critical path plus the float that tells you which task can absorb a slip. */
export default function ExCriticalPath() {
  const [features, setFeatures] = useState(INITIAL);

  const analysis = useMemo(
    () => computeScheduleAnalysis(features, DEPENDENCIES),
    [features],
  );

  const onFeatureMove = useCallback((id: string, startAt: Date, endAt: Date | null) => {
    if (!endAt) return;
    setFeatures((prev) => applyAutoSchedule(id, startAt, endAt, prev, DEPENDENCIES));
  }, []);

  return (
    <ExampleFrame>
      <ExampleControls hint="Red bars have no slack. Drag the short UI build later and watch its float shrink — once it hits zero it joins the critical path.">
        <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setFeatures(INITIAL)}>
          Reset
        </Button>
        {features
          .filter((f) => analysis.get(f.id))
          .map((f) => {
            const a = analysis.get(f.id)!;
            return (
              <Badge
                key={f.id}
                variant={a.critical ? "destructive" : "outline"}
                className="text-[10px]"
              >
                {f.name}: {a.critical ? "critical" : `${a.totalFloat}d float`}
              </Badge>
            );
          })}
      </ExampleControls>
      <GanttRoot
        className="min-h-0 flex-1"
        data={{ features, dependencies: DEPENDENCIES }}
        defaultRange="weekly"
        showCriticalPath
        visibleColumnIds={NAME_ONLY_COLUMNS}
        sidebarWidth={150}
        onFeatureMove={onFeatureMove}
      />
    </ExampleFrame>
  );
}
