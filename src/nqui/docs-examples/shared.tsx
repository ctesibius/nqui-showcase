/**
 * Shared chrome for nqui guide embeds at `/docs/nqui`.
 * Teaching aids only — keep each example focused on one rule.
 */
import type { ReactNode } from "react";
import { cn } from "@nqlib/nqui";

export function ExampleFrame({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex h-full min-h-0 flex-col gap-4 overflow-auto p-4 sm:p-5",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function ExampleHint({ children }: { children: ReactNode }) {
  return <p className="text-sm leading-snug text-muted-foreground">{children}</p>;
}

export function ExampleSplit({
  left,
  right,
  className,
}: {
  left: ReactNode;
  right: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid min-h-0 flex-1 gap-4 sm:grid-cols-2", className)}>
      <div className="flex min-w-0 flex-col gap-3 rounded-lg border border-border bg-muted/20 p-3">
        {left}
      </div>
      <div className="flex min-w-0 flex-col gap-3 rounded-lg border border-border bg-muted/20 p-3">
        {right}
      </div>
    </div>
  );
}

export function ExampleLabel({ children }: { children: ReactNode }) {
  return (
    <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
      {children}
    </span>
  );
}
