/**
 * Live gantt embed for the PM / PMO guide.
 *
 * `ComponentPreview` resolves against the nqchart catalog, so it cannot render
 * these; this is the gantt equivalent, wearing the same `Tray` chrome so a
 * gantt and a chart sit at the same elevation on a docs page.
 *
 * Deliberately no code tab. The PM guide's reader is a project manager, and a
 * wall of TSX beside every chart is noise for them. Engineers get the
 * source-bearing previews on the library's own docs site.
 */
import { Suspense } from "react";
import { Skeleton, cn } from "@nqlib/nqui";
import { Tray } from "@/components/showcase/tray";
import { lazyGanttExample, resolveGanttExample } from "@/nqgantt/docs-examples";

export function GanttExample({
  name,
  title,
  className,
}: {
  name?: string;
  title?: string;
  className?: string;
}) {
  const entry = resolveGanttExample(name);

  if (!entry) {
    return (
      <div
        className={cn(
          "my-4 rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm",
          className,
        )}
      >
        Unknown gantt example <code className="font-mono">{name}</code>.
      </div>
    );
  }

  const Example = lazyGanttExample(entry);

  return (
    <div className={cn("my-5", className)}>
      <Tray as="div">
        <Tray.Caption className="items-center">
          <span className="line-clamp-1 font-mono text-xs text-muted-foreground">
            {title ?? entry.title}
          </span>
          <span className="text-[0.6875rem] uppercase tracking-wider text-muted-foreground">
            live
          </span>
        </Tray.Caption>

        {/*
          Mounted directly rather than on scroll. The scroll-deferred variant
          used for the chart catalog exists because fourteen ECharts instances
          on one page fight each other; a guide page carries exactly one gantt,
          so the deferral buys nothing and its observer fires inconsistently on
          reload — which shows the reader an empty box.
        */}
        <Tray.Stage variant="flush" className={entry.height}>
          <Suspense fallback={<Skeleton className="h-full w-full" />}>
            <Example />
          </Suspense>
        </Tray.Stage>
      </Tray>
    </div>
  );
}
