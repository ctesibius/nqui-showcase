import { formatMarkClick, type LabEventState } from "./lab-events";

export function LabEventPanel({ state }: { state: LabEventState }) {
  return (
    <section
      className="sticky top-3 z-[var(--z-sticky-content)] rounded-lg border border-border bg-background/95 p-4 font-mono text-xs shadow-(--shadow-elevated) backdrop-blur-sm"
      aria-live="polite"
    >
      <p className="mb-2 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
        Event panel
      </p>
      <dl className="grid gap-1.5 sm:grid-cols-2">
        <div className="min-w-0 sm:col-span-2">
          <dt className="text-muted-foreground">last mark click</dt>
          <dd className="truncate text-foreground">
            {state.markClick ? formatMarkClick(state.markClick) : "— nothing yet —"}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">clicks fired</dt>
          <dd className="text-foreground">{state.clickCount}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">legend selection</dt>
          <dd className="text-foreground">{state.legend ?? "(none)"}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">brush range</dt>
          <dd className="text-foreground">
            {state.brush
              ? `${state.brush.startIndex}…${state.brush.endIndex}`
              : "— nothing yet —"}
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-muted-foreground">export</dt>
          <dd className="truncate text-foreground">{state.exportNote ?? "—"}</dd>
        </div>
      </dl>
    </section>
  );
}
