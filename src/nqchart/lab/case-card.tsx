import { useEffect } from "react";
import { Badge, Button, Skeleton, cn } from "@nqlib/nqui";
import { LazyMount } from "../../components/blocks/lazy-mount";
import { Tray, trayMeta } from "../../components/showcase/tray";
import { runCaseChecks } from "./case-checks";
import type { LabCase } from "./cases";
import { rollUp, type CheckResult, type CheckStatus } from "./probe-types";
import { useCaseProbe, type PageSink } from "./use-case-probe";
import { isNew } from "./whats-new";

const STATUS_LABEL: Record<CheckStatus, string> = {
  pass: "pass",
  fail: "fail",
  pending: "pending",
};

const STATUS_TONE: Record<CheckStatus, string> = {
  pass: "border-transparent bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  fail: "border-transparent bg-destructive/15 text-destructive",
  pending: "border-border bg-muted text-muted-foreground",
};

const MARK: Record<CheckStatus, string> = { pass: "✓", fail: "✕", pending: "○" };

const MARK_TONE: Record<CheckStatus, string> = {
  pass: "text-emerald-600 dark:text-emerald-400",
  fail: "text-destructive",
  pending: "text-muted-foreground/70",
};

function CheckRow({ check }: { check: CheckResult }) {
  return (
    <li className="flex gap-2">
      <span
        aria-hidden
        className={cn("mt-px shrink-0 font-mono text-xs leading-snug", MARK_TONE[check.status])}
      >
        {MARK[check.status]}
      </span>
      <span className="min-w-0">
        <span
          className={cn(
            "text-xs leading-snug",
            check.status === "pending" ? "text-muted-foreground" : "text-foreground",
          )}
        >
          {check.label}
        </span>
        <span className="sr-only"> — {STATUS_LABEL[check.status]}</span>
        {check.need ? (
          <span className="block font-mono text-[11px] leading-snug text-muted-foreground/80">
            needs: {check.need}
          </span>
        ) : null}
        {check.detail ? (
          <span
            className={cn(
              "block font-mono text-[11px] leading-snug",
              check.status === "fail" ? "text-destructive/90" : "text-muted-foreground/80",
            )}
          >
            {check.detail}
          </span>
        ) : null}
      </span>
    </li>
  );
}

/**
 * One case. The card owns the probe, so each chart is instrumented in isolation
 * and one case's clicks can never satisfy another's checks.
 *
 * There is no pass/fail control. The status shown is `rollUp` of the case's
 * checks against what was actually observed: any violated check fails the case,
 * any unmet requirement holds it at pending. The only buttons are "Re-check"
 * (re-read the compiled option) and "Clear" (discard this case's evidence) —
 * neither can turn a fail into a pass.
 */
export function LabCaseCard({
  labCase,
  sink,
  onStatus,
  eager = false,
}: {
  labCase: LabCase;
  sink: PageSink;
  onStatus: (id: string, status: CheckStatus) => void;
  /** Mount the chart immediately instead of waiting for it to scroll into view. */
  eager?: boolean;
}) {
  const probe = useCaseProbe(sink, labCase.id);
  const { evidence, attachRoot } = probe;
  const checks = runCaseChecks(labCase.id, evidence);
  const status = rollUp(checks);

  useEffect(() => {
    onStatus(labCase.id, status);
  }, [labCase.id, status, onStatus]);

  const counts = checks.reduce(
    (acc, c) => ({ ...acc, [c.status]: acc[c.status] + 1 }),
    { pass: 0, fail: 0, pending: 0 } as Record<CheckStatus, number>,
  );

  return (
    <Tray as="div" className="h-full">
      <Tray.Caption>
        <span className="truncate text-sm font-medium">{labCase.title}</span>
        <span className="flex shrink-0 items-center gap-1.5">
          {isNew(labCase.id) ? (
            <Badge className="font-mono text-xs font-normal">New</Badge>
          ) : null}
          <Badge variant="outline" className={cn("font-mono text-xs font-normal", STATUS_TONE[status])}>
            {STATUS_LABEL[status]}
          </Badge>
        </span>
      </Tray.Caption>

      <Tray.Stage variant="chart" className="aspect-[16/10]">
        {eager ? (
          <div ref={attachRoot} className="size-full min-h-0">
            {labCase.render(probe)}
          </div>
        ) : (
          <LazyMount fallback={<Skeleton className="size-full rounded-md" />}>
            <div ref={attachRoot} className="size-full min-h-0">
              {labCase.render(probe)}
            </div>
          </LazyMount>
        )}
      </Tray.Stage>

      <div className={cn(trayMeta, "space-y-2")}>
        {labCase.instruction ? (
          <p className="text-xs leading-snug text-muted-foreground">
            <span className="font-medium text-foreground">Do: </span>
            {labCase.instruction}
          </p>
        ) : (
          <p className="text-xs leading-snug text-muted-foreground">
            <span className="font-medium text-foreground">Do: </span>
            nothing — this case decides itself from the compiled chart.
          </p>
        )}

        <ul className="space-y-1.5 border-t border-border/60 pt-2">
          {checks.length ? (
            checks.map((c) => <CheckRow key={c.id} check={c} />)
          ) : (
            <li className="text-xs text-muted-foreground">No checks defined for this case.</li>
          )}
        </ul>

        <div className="flex items-center gap-2 pt-1">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-7 px-2.5 text-xs"
            onClick={() => probe.refresh()}
          >
            Re-check
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-7 px-2.5 text-xs text-muted-foreground"
            onClick={() => probe.reset()}
          >
            Clear
          </Button>
          <span className="ml-auto font-mono text-xs text-muted-foreground tabular-nums">
            {counts.pass}/{checks.length}
            {counts.fail ? ` · ${counts.fail} failed` : ""}
          </span>
        </div>
      </div>
    </Tray>
  );
}
