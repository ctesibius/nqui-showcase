import { useCallback, useState } from "react";
import { GanttRoot } from "@nqlib/nqgantt/ui";
import { ExampleControls, ExampleFrame, NAME_ONLY_COLUMNS, STATUS, feature } from "./shared";
import { Button } from "@nqlib/nqui";

const INITIAL = [
  feature("discovery", "Discovery", 0, 4, { progress: 100, status: STATUS.done }),
  feature("build", "Build", 7, 18, { progress: 45, status: STATUS.doing }),
  feature("review", "Review", 21, 25, { progress: 0 }),
  feature("go-live", "Go live", 28, 28, { isMilestone: true }),
];

/** Bars, progress fills, a milestone, and what dragging actually does. */
export default function ExBarsBasics() {
  const [features, setFeatures] = useState(INITIAL);

  // The library never mutates your data. It reports the move; you decide.
  const onFeatureMove = useCallback((id: string, startAt: Date, endAt: Date | null) => {
    if (!endAt) return;
    setFeatures((prev) => prev.map((f) => (f.id === id ? { ...f, startAt, endAt } : f)));
  }, []);

  return (
    <ExampleFrame>
      <ExampleControls hint="Drag a bar, or drag its edge to resize. The milestone is a single day.">
        <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setFeatures(INITIAL)}>
          Reset
        </Button>
      </ExampleControls>
      <GanttRoot
        className="min-h-0 flex-1"
        data={{ features, dependencies: [] }}
        defaultRange="weekly"
        visibleColumnIds={NAME_ONLY_COLUMNS}
        sidebarWidth={150}
        onFeatureMove={onFeatureMove}
      />
    </ExampleFrame>
  );
}
