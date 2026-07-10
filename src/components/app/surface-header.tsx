import type { ReactNode } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";

export interface SurfaceHeaderProps {
  /** Crumb trail leading to this surface, e.g. ["Acme Workspace", "Finance"]. */
  breadcrumb?: readonly string[];
  title: string;
  /** Muted qualifier shown after the title, e.g. "Workbook" or "Sprint 24". */
  meta?: ReactNode;
  /** Right-aligned actions (share, view switch, presence, …). */
  actions?: ReactNode;
}

/**
 * The product chrome that sits above a grid surface — gives Sheets/Projects the
 * "real app" framing (workspace breadcrumb, document title, surface actions)
 * rather than a bare embedded table.
 */
export function SurfaceHeader({ breadcrumb, title, meta, actions }: SurfaceHeaderProps) {
  return (
    <header className="flex h-12 shrink-0 items-center gap-3 border-b border-border bg-card px-4">
      <div className="flex min-w-0 items-center gap-2">
        {breadcrumb?.map((crumb) => (
          <span key={crumb} className="flex shrink-0 items-center gap-2">
            <span className="truncate text-xs font-medium text-muted-foreground">{crumb}</span>
            <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5 text-muted-foreground/60" aria-hidden />
          </span>
        ))}
        <h1 className="truncate text-sm font-semibold tracking-tight">{title}</h1>
        {meta ? (
          <span className="shrink-0 truncate text-xs text-muted-foreground">{meta}</span>
        ) : null}
      </div>
      {actions ? <div className="ml-auto flex shrink-0 items-center gap-2">{actions}</div> : null}
    </header>
  );
}
