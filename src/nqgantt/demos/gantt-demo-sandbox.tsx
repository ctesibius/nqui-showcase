/**
 * Path A — GanttDemo with built-in stress/sample payload (showcase dev only).
 */
import { GanttDemo } from "@nqlib/nqgantt/ui";
import { cn } from "@nqlib/nqui";

export function GanttDemoSandbox({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex min-h-0 flex-1 flex-col overflow-hidden rounded-none border-0 bg-card",
        className,
      )}
    >
      <GanttDemo className="min-h-0 flex-1" defaultRange="weekly" hideInsights />
    </div>
  );
}
