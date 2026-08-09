import { useCallback, useMemo, useState } from "react";
import { GanttRoot } from "@nqlib/nqgantt/ui";
import { DEFAULT_WORKING_CALENDAR, exportMSProjectXML, importMSProjectXML } from "@nqlib/nqgantt";
import type { GanttDependency, MSProjectImportResult } from "@nqlib/nqgantt";
import { ExampleControls, ExampleFrame, NAME_ONLY_COLUMNS, STATUS, feature } from "./shared";
import { Button } from "@nqlib/nqui";

const INITIAL = [
  feature("phase", "Phase 1", 0, 32, { progress: 45, status: STATUS.doing }),
  feature("design", "Design", 0, 11, {
    progress: 100, status: STATUS.done, parentId: "phase", budget: 12000,
  }),
  feature("build", "Build", 14, 32, {
    progress: 30, status: STATUS.doing, parentId: "phase", budget: 30000,
  }),
  feature("ship", "Ship", 35, 35, { isMilestone: true }),
];

const DEPENDENCIES: GanttDependency[] = [
  { fromId: "design", toId: "build", type: "FS", lag: 2 },
  { fromId: "build", toId: "ship", type: "FS" },
];

export default function ExMsProject() {
  const [features, setFeatures] = useState(INITIAL);
  const [dependencies, setDependencies] = useState(DEPENDENCIES);
  const [result, setResult] = useState<MSProjectImportResult | null>(null);

  const xml = useMemo(
    () =>
      exportMSProjectXML(features, dependencies, {
        projectName: "Phase 1",
        calendar: DEFAULT_WORKING_CALENDAR,
      }),
    [features, dependencies],
  );

  const roundTrip = useCallback(() => {
    const back = importMSProjectXML(xml);
    setResult(back);
    setFeatures(back.features);
    setDependencies(back.dependencies);
  }, [xml]);

  const download = useCallback(() => {
    const url = URL.createObjectURL(new Blob([xml], { type: "application/xml" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "phase-1.xml";
    a.click();
    URL.revokeObjectURL(url);
  }, [xml]);

  const importFile = useCallback(async (file: File) => {
    const back = importMSProjectXML(await file.text());
    setResult(back);
    if (back.features.length > 0) {
      setFeatures(back.features);
      setDependencies(back.dependencies);
    }
  }, []);

  return (
    <ExampleFrame>
      <ExampleControls
        hint={
          result
            ? `${result.features.length} tasks · ${result.dependencies.length} links · ${result.warnings.length} warning(s). Hierarchy, lag, the milestone and cost all survived.`
            : "Round-trip this plan through XML, or open a file exported from your own tool."
        }
      >
        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={roundTrip}>
          Export &amp; re-import
        </Button>
        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={download}>
          Download .xml
        </Button>
        <label className="inline-flex h-7 cursor-pointer items-center rounded-md border px-2 text-xs hover:bg-accent">
          Open your own .xml
          <input
            type="file"
            accept=".xml,text/xml,application/xml"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void importFile(f);
              e.target.value = "";
            }}
          />
        </label>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 text-xs"
          onClick={() => { setFeatures(INITIAL); setDependencies(DEPENDENCIES); setResult(null); }}
        >
          Reset
        </Button>
      </ExampleControls>
      <GanttRoot
        className="min-h-0 flex-1"
        data={{ features, dependencies }}
        defaultRange="weekly"
        visibleColumnIds={NAME_ONLY_COLUMNS}
        sidebarWidth={150}
      />
    </ExampleFrame>
  );
}
