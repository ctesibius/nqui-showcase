import { Suspense, lazy, useRef } from "react";
import { Skeleton } from "@nqlib/nqui";
import { SurfaceErrorBoundary } from "../app/surface-error-boundary";
import { Chapter, DemoFrame } from "./chapter";
import { useLazyMount } from "./scroll-hooks";

const RoadmapGantt = lazy(() =>
  import("@/nqgantt/demos/roadmap-gantt").then((m) => ({
    default: m.RoadmapGantt,
  })),
);

function GanttSkeleton() {
  return (
    <div className="flex h-full flex-col gap-3 p-4">
      <Skeleton className="h-7 w-56" />
      {Array.from({ length: 8 }, (_, i) => (
        <Skeleton key={i} className="h-9" style={{ width: `${88 - i * 6}%` }} />
      ))}
    </div>
  );
}

export function GanttChapter() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useLazyMount(ref);

  return (
    <Chapter
      id="timeline"
      eyebrow="nqgantt — timeline"
      headline="Plans you can actually read."
      lede="Grouped rows, dependencies, drag-to-reschedule and critical paths — rendered from the same task model your grid already holds. Drag a bar to see it live."
    >
      <div ref={ref}>
        <DemoFrame title="nqgantt — roadmap">
          <div className="h-[60vh] min-h-[440px] overflow-hidden bg-background">
            {inView ? (
              <SurfaceErrorBoundary>
                <Suspense fallback={<GanttSkeleton />}>
                  <RoadmapGantt className="h-full" grouped colorBy="status" />
                </Suspense>
              </SurfaceErrorBoundary>
            ) : (
              <GanttSkeleton />
            )}
          </div>
        </DemoFrame>
      </div>
    </Chapter>
  );
}
