import type { ReactNode } from "react";
import { cn } from "@nqlib/nqui";

export function Steps({ children, className }: { children?: ReactNode; className?: string }) {
  return <div className={cn("my-6 flex flex-col gap-6", className)}>{children}</div>;
}

export function Step({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <div className={cn("relative border-l border-border pl-6 [&:not(:last-child)]:pb-2", className)}>
      <span className="absolute -left-1.5 top-1.5 size-3 rounded-full border-2 border-border bg-background" />
      {children}
    </div>
  );
}

export function StepTitle({ children, className }: { children?: ReactNode; className?: string }) {
  return <h3 className={cn("text-base font-semibold text-foreground", className)}>{children}</h3>;
}

export function StepContent({ children, className }: { children?: ReactNode; className?: string }) {
  return <div className={cn("mt-2 flex flex-col gap-3", className)}>{children}</div>;
}

export function StepDescription({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) {
  // div, not p: MDX children are often <p>, and <p><p> is invalid HTML.
  return (
    <div className={cn("text-sm leading-relaxed text-muted-foreground", className)}>{children}</div>
  );
}
