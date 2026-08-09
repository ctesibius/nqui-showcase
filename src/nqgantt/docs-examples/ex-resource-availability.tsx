import { useCallback, useMemo, useState } from "react";
import { GanttRoot } from "@nqlib/nqgantt/ui";
import { DEFAULT_WORKING_CALENDAR, computeAssigneeWorkloads, levelResources } from "@nqlib/nqgantt";
import type { ResourceCalendar } from "@nqlib/nqgantt";
import { ExampleControls, ExampleFrame, NAME_ONLY_COLUMNS, STATUS, feature, isoDay } from "./shared";
import { Badge, Button } from "@nqlib/nqui";

const ADA = [{ id: "ada", name: "Ada" }];

// Both of Ada's tasks sit in the SAME week — deliberately 200% of one person.
const INITIAL = [
  feature("a", "Migration plan", 0, 4, { status: STATUS.doing, assignees: ADA }),
  feature("b", "Data mapping", 0, 4, { status: STATUS.doing, assignees: ADA }),
  feature("c", "Handover doc", 0, 2, { assignees: [{ id: "alan", name: "Alan" }] }),
];

/** Ada is away all of next week — right where levelling would otherwise push her. */
const LEAVE: ResourceCalendar[] = [
  { assigneeId: "ada", absences: [{ from: isoDay(7), to: isoDay(11), label: "Leave" }] },
];

export default function ExResourceAvailability() {
  const [features, setFeatures] = useState(INITIAL);
  const [respectLeave, setRespectLeave] = useState(true);

  const workloads = useMemo(
    () =>
      computeAssigneeWorkloads(
        features,
        DEFAULT_WORKING_CALENDAR,
        1,
        respectLeave ? { resourceCalendars: LEAVE } : {},
      ),
    [features, respectLeave],
  );

  const level = useCallback(() => {
    setFeatures((prev) =>
      levelResources(
        prev,
        DEFAULT_WORKING_CALENDAR,
        50,
        respectLeave ? { resourceCalendars: LEAVE } : {},
      ),
    );
  }, [respectLeave]);

  return (
    <ExampleFrame>
      <ExampleControls hint="Ada is on two tasks at once. Level, and the second moves — with leave respected it steps past her time off instead of into it.">
        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={level}>
          Level resources
        </Button>
        <label className="flex cursor-pointer items-center gap-1.5 text-xs">
          <input
            type="checkbox"
            checked={respectLeave}
            onChange={(e) => setRespectLeave(e.target.checked)}
            className="h-3 w-3"
          />
          Respect Ada&rsquo;s leave (all next week)
        </label>
        <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setFeatures(INITIAL)}>
          Reset
        </Button>
        {workloads.map((w) => (
          <Badge
            key={w.assignee.id}
            variant={w.peakAllocation > 100 ? "destructive" : "outline"}
            className="text-[10px]"
          >
            {w.assignee.name}: peak {w.peakAllocation}%
          </Badge>
        ))}
      </ExampleControls>
      <GanttRoot
        className="min-h-0 flex-1"
        data={{ features, dependencies: [] }}
        defaultRange="weekly"
        showAssignees
        colorBy="assignee"
        visibleColumnIds={NAME_ONLY_COLUMNS}
        sidebarWidth={150}
      />
    </ExampleFrame>
  );
}
