import { Suspense, lazy, useRef, useState } from "react";
import { Skeleton, ToggleGroup, ToggleGroupItem } from "@nqlib/nqui";
import { PlaygroundTableSettingsProvider } from "@/nqgrid/playground-table-settings";
import { SurfaceErrorBoundary } from "../app/surface-error-boundary";
import { Chapter, DemoFrame } from "./chapter";
import { Reveal } from "./motion-primitives";
import { useLazyMount } from "./scroll-hooks";

const SpreadsheetPage = lazy(() =>
  import("@/nqgrid/demos/spreadsheet/spreadsheet-page").then((m) => ({
    default: m.SpreadsheetPage,
  })),
);
const ProjectsPage = lazy(() =>
  import("@/nqgrid/demos/projects/projects-page").then((m) => ({
    default: m.ProjectsPage,
  })),
);

function GridSkeleton() {
  return (
    <div className="flex h-full flex-col gap-3 p-4">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-6 w-full" />
      <div className="grid flex-1 grid-cols-6 gap-2">
        {Array.from({ length: 24 }, (_, i) => (
          <Skeleton key={i} className="h-8" />
        ))}
      </div>
    </div>
  );
}

export function GridChapter() {
  const [surface, setSurface] = useState("spreadsheet");
  const ref = useRef<HTMLDivElement>(null);
  const inView = useLazyMount(ref);

  return (
    <Chapter
      id="grid"
      eyebrow="nqgrid — data grid"
      headline="A spreadsheet engine, not a table."
      lede="Formulas, pivots, frozen panes and find-and-replace in the same engine that powers work-management boards. This is the real thing — click a cell and type."
    >
      <Reveal delay={0.08} className="mt-10">
        <ToggleGroup
          type="single"
          variant="outline"
          size="sm"
          value={surface}
          onValueChange={(value) => value && setSurface(value)}
        >
          <ToggleGroupItem value="spreadsheet">Spreadsheet</ToggleGroupItem>
          <ToggleGroupItem value="projects">Projects board</ToggleGroupItem>
        </ToggleGroup>
      </Reveal>

      <div ref={ref}>
        <DemoFrame
          title={surface === "spreadsheet" ? "nqgrid — spreadsheet" : "nqgrid — projects"}
        >
          <div className="h-[70vh] min-h-[520px] overflow-hidden bg-background">
            {inView ? (
              <SurfaceErrorBoundary>
                <Suspense fallback={<GridSkeleton />}>
                  <PlaygroundTableSettingsProvider>
                    {surface === "spreadsheet" ? <SpreadsheetPage /> : <ProjectsPage />}
                  </PlaygroundTableSettingsProvider>
                </Suspense>
              </SurfaceErrorBoundary>
            ) : (
              <GridSkeleton />
            )}
          </div>
        </DemoFrame>
      </div>
    </Chapter>
  );
}
