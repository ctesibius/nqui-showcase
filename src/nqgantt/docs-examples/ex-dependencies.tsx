import { useMemo, useState } from "react";
import { GanttRoot } from "@nqlib/nqgantt/ui";
import type { GanttDependency, GanttDependencyType } from "@nqlib/nqgantt";
import { ExampleControls, ExampleFrame, NAME_ONLY_COLUMNS, STATUS, feature } from "./shared";
import { Button } from "@nqlib/nqui";

const FEATURES = [
  feature("a", "Draft spec", 0, 4, { progress: 100, status: STATUS.done }),
  feature("b", "Build", 7, 16, { progress: 30, status: STATUS.doing }),
];

const TYPES: { type: GanttDependencyType; label: string; blurb: string }[] = [
  { type: "FS", label: "Finish → Start", blurb: "Build starts after the spec finishes. The default, and the one you want most of the time." },
  { type: "SS", label: "Start → Start", blurb: "Both start together. Use for work that runs in parallel from a shared trigger." },
  { type: "FF", label: "Finish → Finish", blurb: "Both land together. Use when a task must not finish before its partner does." },
  { type: "SF", label: "Start → Finish", blurb: "The rare one — a handover. The successor finishes once the predecessor starts." },
];

/** The four link types, and what lag does to each. */
export default function ExDependencies() {
  const [type, setType] = useState<GanttDependencyType>("FS");
  const [lag, setLag] = useState(0);

  const dependencies = useMemo<GanttDependency[]>(
    () => [{ fromId: "a", toId: "b", type, ...(lag ? { lag } : {}) }],
    [type, lag],
  );
  const active = TYPES.find((t) => t.type === type)!;

  return (
    <ExampleFrame>
      <ExampleControls hint={active.blurb}>
        {TYPES.map((t) => (
          <Button
            key={t.type}
            size="sm"
            variant={type === t.type ? "default" : "outline"}
            className="h-7 text-xs"
            onClick={() => setType(t.type)}
          >
            {t.label}
          </Button>
        ))}
        <span className="ml-2 text-xs text-muted-foreground">Lag</span>
        {[0, 2, 5].map((l) => (
          <Button
            key={l}
            size="sm"
            variant={lag === l ? "default" : "outline"}
            className="h-7 text-xs"
            onClick={() => setLag(l)}
          >
            {l === 0 ? "none" : `+${l}d`}
          </Button>
        ))}
      </ExampleControls>
      <GanttRoot
        className="min-h-0 flex-1"
        data={{ features: FEATURES, dependencies }}
        defaultRange="weekly"
        visibleColumnIds={NAME_ONLY_COLUMNS}
        sidebarWidth={150}
      />
    </ExampleFrame>
  );
}
