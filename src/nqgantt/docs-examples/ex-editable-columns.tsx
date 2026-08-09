import { useCallback, useMemo, useState } from "react";
import { GanttRoot } from "@nqlib/nqgantt/ui";
import { getDefaultColumnDefs } from "@nqlib/nqgantt";
import type { GanttFeature, GanttSidebarColumnDef } from "@nqlib/nqgantt";
import { ExampleControls, ExampleFrame, STATUS, feature } from "./shared";

const INITIAL = [
  feature("survey", "Site survey", 0, 4, {
    progress: 100, status: STATUS.done, customFields: { risk: "low", owner: "Ada" },
  }),
  feature("permits", "Permits", 7, 18, {
    progress: 60, status: STATUS.doing, customFields: { risk: "high", owner: "Grace" },
  }),
  feature("ground", "Groundwork", 21, 32, {
    progress: 0, status: STATUS.todo, customFields: { risk: "medium", owner: "Alan" },
  }),
];

/**
 * A column this library has never heard of. It renders as a coloured pill and
 * edits as a picker because the definition says so — not because the id is
 * recognised.
 */
const RISK: GanttSidebarColumnDef = {
  id: "c:risk",
  label: "Risk",
  type: "custom",
  dataKey: "risk",
  valueType: "status",
  cellVariant: "colored-pill",
  editVariant: "select",
  editable: true,
  sortable: true,
  minWidth: 110,
  options: [
    { id: "low", label: "Low", color: "oklch(0.72 0.15 150)", order: 0 },
    { id: "medium", label: "Medium", color: "oklch(0.78 0.16 85)", order: 1 },
    { id: "high", label: "High", color: "oklch(0.65 0.20 25)", order: 2 },
  ],
};

const OWNER: GanttSidebarColumnDef = {
  id: "c:owner",
  label: "Owner",
  type: "custom",
  dataKey: "owner",
  valueType: "string",
  editVariant: "text",
  editable: true,
  sortable: true,
  minWidth: 100,
};

export default function ExEditableColumns() {
  const [features, setFeatures] = useState(INITIAL);

  const columnDefs = useMemo(
    () => [
      ...getDefaultColumnDefs().map((d) => ({ ...d, editable: true, sortable: true })),
      RISK,
      OWNER,
    ],
    [],
  );

  const onCellCommit = useCallback(
    (featureId: string, columnId: string, raw: unknown) => {
      const def = columnDefs.find((d) => d.id === columnId);
      setFeatures((prev) =>
        prev.map((f) => {
          if (f.id !== featureId) return f;
          if (def?.type === "custom" && def.dataKey) {
            return { ...f, customFields: { ...f.customFields, [def.dataKey]: raw } };
          }
          return { ...f, [columnId]: raw } as GanttFeature;
        }),
      );
    },
    [columnDefs],
  );

  // Dates never arrive through onCellCommit — they go through the move handler,
  // the same one a drag uses.
  const onFeatureMove = useCallback((id: string, startAt: Date, endAt: Date | null) => {
    if (!endAt) return;
    setFeatures((prev) => prev.map((f) => (f.id === id ? { ...f, startAt, endAt } : f)));
  }, []);

  return (
    <ExampleFrame>
      <ExampleControls hint="Click any cell to edit it. Click a column header to sort — Risk sorts Low → High, by workflow order, not alphabetically." >
        <span />
      </ExampleControls>
      <GanttRoot
        className="min-h-0 flex-1"
        data={{ features, dependencies: [], columnDefs }}
        defaultRange="weekly"
        visibleColumnIds={["tasks", "status", "c:risk", "c:owner", "duration"]}
        sidebarWidth={300}
        onCellCommit={onCellCommit}
        onFeatureMove={onFeatureMove}
      />
    </ExampleFrame>
  );
}
