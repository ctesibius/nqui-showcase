import { useCallback, useState } from "react";
import { GanttRoot } from "@nqlib/nqgantt/ui";
import { applyAutoSchedule } from "@nqlib/nqgantt";
import type { GanttDependency } from "@nqlib/nqgantt";
import { ExampleControls, ExampleFrame, NAME_ONLY_COLUMNS, STATUS, feature } from "./shared";
import { Button } from "@nqlib/nqui";

const INITIAL = [
  feature("spec", "Spec", 0, 4, { progress: 100, status: STATUS.done }),
  feature("build", "Build", 7, 16, { progress: 40, status: STATUS.doing }),
  feature("test", "Test", 21, 25, {}),
  feature("ship", "Ship", 28, 28, { isMilestone: true }),
];

const DEPENDENCIES: GanttDependency[] = [
  { fromId: "spec", toId: "build", type: "FS" },
  { fromId: "build", toId: "test", type: "FS" },
  { fromId: "test", toId: "ship", type: "FS" },
];

/** Strict (enforced) versus flexible (recorded only). */
export default function ExAutoSchedule() {
  const [features, setFeatures] = useState(INITIAL);
  const [strict, setStrict] = useState(true);

  const onFeatureMove = useCallback(
    (id: string, startAt: Date, endAt: Date | null) => {
      if (!endAt) return;
      setFeatures((prev) =>
        strict
          ? applyAutoSchedule(id, startAt, endAt, prev, DEPENDENCIES)
          : prev.map((f) => (f.id === id ? { ...f, startAt, endAt } : f)),
      );
    },
    [strict],
  );

  return (
    <ExampleFrame>
      <ExampleControls
        hint={
          strict
            ? "Strict: drag Build later and everything downstream follows. The links are enforced."
            : "Flexible: drag Build later and nothing follows. The links are recorded, not applied."
        }
      >
        <Button
          size="sm"
          variant={strict ? "default" : "outline"}
          className="h-7 text-xs"
          onClick={() => setStrict(true)}
        >
          Strict
        </Button>
        <Button
          size="sm"
          variant={!strict ? "default" : "outline"}
          className="h-7 text-xs"
          onClick={() => setStrict(false)}
        >
          Flexible
        </Button>
        <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setFeatures(INITIAL)}>
          Reset
        </Button>
      </ExampleControls>
      <GanttRoot
        className="min-h-0 flex-1"
        data={{ features, dependencies: DEPENDENCIES }}
        defaultRange="weekly"
        visibleColumnIds={NAME_ONLY_COLUMNS}
        sidebarWidth={150}
        onFeatureMove={onFeatureMove}
      />
    </ExampleFrame>
  );
}
