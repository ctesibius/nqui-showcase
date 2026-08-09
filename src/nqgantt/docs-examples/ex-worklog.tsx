import { useCallback, useMemo, useState } from "react";
import { GanttRoot } from "@nqlib/nqgantt/ui";
import { appendWorklog, applyActualsToFeatures, computeEVMForecast, rollupActuals } from "@nqlib/nqgantt";
import type { WorklogEntry } from "@nqlib/nqgantt";
import { ExampleControls, ExampleFrame, NAME_ONLY_COLUMNS, STATUS, Tile, day, feature, isoDay } from "./shared";
import { Button } from "@nqlib/nqui";

const RATES = new Map([["ada", 120]]);

const FEATURES = [
  feature("design", "Design", -7, 4, {
    progress: 70, status: STATUS.doing, budget: 20000,
    assignees: [{ id: "ada", name: "Ada" }],
  }),
  feature("build", "Build", 7, 18, {
    progress: 10, budget: 30000, assignees: [{ id: "ada", name: "Ada" }],
  }),
];

const AS_OF = day(2);

/** Actual cost as a measurement rather than a typed number. */
export default function ExWorklog() {
  const [log, setLog] = useState<WorklogEntry[]>([]);

  const measured = useMemo(
    () => applyActualsToFeatures(FEATURES, log, { rates: RATES }),
    [log],
  );
  const evm = useMemo(() => computeEVMForecast(measured, AS_OF), [measured]);
  const totals = useMemo(() => rollupActuals(log, { rates: RATES }), [log]);

  const logHours = useCallback((hours: number, dayOffset: number) => {
    setLog((prev) => {
      const r = appendWorklog(prev, {
        id: `w-${prev.length + 1}`,
        taskId: "design",
        assigneeId: "ada",
        date: isoDay(dayOffset),
        hours,
      });
      return r.ok ? r.log : prev;
    });
  }, []);

  return (
    <ExampleFrame>
      <ExampleControls
        hint={`${totals.entryCount} entries · ${totals.actualHours}h logged. Actual cost below is hours × rate — nobody typed it into a field.`}
      >
        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => logHours(6, 0)}>
          Log 6h Monday
        </Button>
        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => logHours(8, 1)}>
          Log 8h Tuesday
        </Button>
        <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setLog([])}>
          Clear
        </Button>
      </ExampleControls>

      <div className="grid grid-cols-4 gap-2 pb-3">
        <Tile label="EV" value={evm.ev} />
        <Tile label="AC" value={evm.ac} />
        <Tile label="CPI" value={evm.cpi} precision={2} tone={evm.cpi >= 1 ? "good" : "bad"} />
        <Tile label="Hours" value={totals.actualHours} />
      </div>

      <GanttRoot
        className="min-h-0 flex-1"
        data={{ features: measured, dependencies: [] }}
        defaultRange="weekly"
        showAssignees
        visibleColumnIds={NAME_ONLY_COLUMNS}
        sidebarWidth={150}
      />
    </ExampleFrame>
  );
}
