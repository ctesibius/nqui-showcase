/**
 * Live nqgrid embed for the docs (`<GridExample name="pivot-basics" />`).
 * Same `Tray` chrome as `GanttExample`, so grid and gantt examples sit at the
 * same elevation on a docs page.
 */
import { Suspense } from "react";
import { Skeleton, cn } from "@nqlib/nqui";
import { Tray } from "@/components/showcase/tray";
import { lazyGridExample, resolveGridExample } from "@/nqgrid/docs-examples";

export function GridExample({
  name,
  title,
  className,
}: {
  name?: string;
  title?: string;
  className?: string;
}) {
  const entry = resolveGridExample(name);

  if (!entry) {
    return (
      <div
        className={cn(
          "my-4 rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm",
          className,
        )}
      >
        Unknown grid example <code className="font-mono">{name}</code>.
      </div>
    );
  }

  const Example = lazyGridExample(entry);

  return (
    <div className={cn("my-5", className)}>
      <Tray as="div">
        <Tray.Heading as="p" title={title ?? entry.title} meta="@nqlib/nqgrid" />
        <Tray.Stage variant="flush" className={entry.height}>
          <Suspense fallback={<Skeleton className="h-full w-full" />}>
            <Example />
          </Suspense>
        </Tray.Stage>
      </Tray>
    </div>
  );
}
