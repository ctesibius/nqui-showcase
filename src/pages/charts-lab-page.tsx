import { useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Badge, NquiLogo, cn } from "@nqlib/nqui";
import { ShowcaseTopBar, devTopBarLinks } from "../components/showcase-top-bar";
import { LAB_CASES, LAB_GROUPS } from "../nqchart/lab/cases";
import { LabCaseCard } from "../nqchart/lab/case-card";
import { LabEventPanel } from "../nqchart/lab/event-panel";
import {
  INITIAL_LAB_EVENTS,
  type LabEventState,
} from "../nqchart/lab/lab-events";
import type { ChartBrushRange, NQMarkEvent } from "../nqchart/lab/nqchart-030";
import type { CheckStatus } from "../nqchart/lab/probe-types";
import type { PageSink } from "../nqchart/lab/use-case-probe";
import { CURRENT_RELEASE, whatsNewIds } from "../nqchart/lab/whats-new";
import "../components/landing/landing.css";
import "../components/blocks/blocks.css";
import "./charts-page.css";

export function ChartsLabPage() {
  const [events, setEvents] = useState<LabEventState>(INITIAL_LAB_EVENTS);
  const [statuses, setStatuses] = useState<Record<string, CheckStatus>>({});
  const newIds = useMemo(() => whatsNewIds(), []);

  /**
   * `?eager=1` mounts every chart at once instead of on scroll.
   *
   * Off by default for the reason `LazyMount` exists — three dozen ECharts
   * instances at once floods zrender's animation loop and breaks hover. Worth
   * having anyway: a full acceptance run visits every card regardless, and in
   * any environment where IntersectionObserver does not fire (a backgrounded
   * tab, an automated pass) lazy mounting leaves checks reading `pending` for
   * reasons that have nothing to do with the library.
   */
  const eager = useMemo(
    () => new URLSearchParams(window.location.search).has("eager"),
    [],
  );

  /**
   * `?only=Interaction` renders a single capability group.
   *
   * Pairs with `?eager=1`: mounting all three dozen charts at once while the
   * page is still laying out leaves the deeper ones measuring zero, and a chart
   * host that sizes itself at mount then never paints. One group at a time is
   * both small enough to mount cleanly and how a tester actually works through
   * a failing capability.
   */
  const only = useMemo(() => {
    const raw = new URLSearchParams(window.location.search).get("only");
    if (!raw) return null;
    const wanted = raw.toLowerCase();
    return LAB_GROUPS.find((g) => g.toLowerCase() === wanted) ?? null;
  }, []);

  const groups = only ? [only] : LAB_GROUPS;

  const onMarkClick = useCallback((event: NQMarkEvent) => {
    setEvents((prev) => ({
      ...prev,
      markClick: event,
      clickCount: prev.clickCount + 1,
    }));
  }, []);

  const onLegendSelect = useCallback((selected: string | null) => {
    setEvents((prev) => ({ ...prev, legend: selected }));
  }, []);

  const onBrushChange = useCallback((range: ChartBrushRange) => {
    setEvents((prev) => ({ ...prev, brush: range }));
  }, []);

  const setExportNote = useCallback((note: string) => {
    setEvents((prev) => ({ ...prev, exportNote: note }));
  }, []);

  const sink: PageSink = useMemo(
    () => ({ onMarkClick, onLegendSelect, onBrushChange, setExportNote }),
    [onMarkClick, onLegendSelect, onBrushChange, setExportNote],
  );

  const onStatus = useCallback((id: string, status: CheckStatus) => {
    setStatuses((prev) => (prev[id] === status ? prev : { ...prev, [id]: status }));
  }, []);

  // Counts follow what is on screen: reporting "3 / 34" while filtered to one
  // group would read as a catastrophic run rather than a focused one.
  const shown = only ? LAB_CASES.filter((c) => c.group === only) : LAB_CASES;
  const total = shown.length;
  const passed = shown.filter((c) => statuses[c.id] === "pass").length;
  const failed = shown.filter((c) => statuses[c.id] === "fail").length;
  const pendingCount = total - passed - failed;
  const gateOpen = passed === total && !only;

  return (
    <div className="fl-page">
      <div className="fl-grid" aria-hidden />
      <div className="fl-glow" aria-hidden />

      <div className="relative z-[var(--z-base)] mx-auto w-[var(--fl-shell)] pb-24 pt-8">
        <ShowcaseTopBar
          brand={
            <Link to="/" className="flex items-center gap-2.5">
              <NquiLogo className="size-[22px]" />
              <span className="text-sm font-semibold tracking-tight">
                nqlib<span className="font-medium text-muted-foreground"> · charts lab</span>
              </span>
            </Link>
          }
          links={[
            { to: "/charts", label: "Gallery" },
            { to: "/blocks", label: "Blocks" },
            { to: "/docs/nqchart", label: "Docs" },
            ...devTopBarLinks,
          ]}
        />

        <div className="mt-14 flex flex-wrap items-end justify-between gap-4 md:mt-20">
          <div className="max-w-[56ch]">
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground/80">
              BI acceptance · {CURRENT_RELEASE}
            </p>
            <h1 className="mt-3 text-4xl font-semibold leading-[1.07] tracking-[-0.028em] md:text-5xl">
              Feature lab
            </h1>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Perform the interaction; the page decides the verdict. Every check reads the
              compiled chart, the painted canvas or the events the library actually emitted —
              so a case you skip stays <span className="text-foreground">pending</span> and a
              case that misbehaves goes <span className="text-foreground">fail</span> whatever
              you think of it.
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <p className="font-mono text-sm tabular-nums">
              <span className="text-foreground">{passed}</span>
              <span className="text-muted-foreground"> / {total} pass</span>
              {failed ? <span className="text-destructive"> · {failed} fail</span> : null}
              {pendingCount ? (
                <span className="text-muted-foreground"> · {pendingCount} pending</span>
              ) : null}
            </p>
            <p
              className={cn(
                "rounded-md border px-2.5 py-1 font-mono text-xs",
                gateOpen
                  ? "border-transparent bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                  : "border-border bg-muted text-muted-foreground",
              )}
            >
              {only
                ? `filtered to ${only} — not a full run`
                : gateOpen
                  ? `release gate open — nqchart ${CURRENT_RELEASE} may publish`
                  : `release gate closed — ${failed ? `${failed} failing` : `${pendingCount} unproven`}`}
            </p>
          </div>
        </div>

        {newIds.length > 0 ? (
          <section className="mt-8 rounded-lg border border-border bg-muted/40 p-4">
            <h2 className="text-sm font-medium">What&apos;s new in {CURRENT_RELEASE}</h2>
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {newIds.map((id) => (
                <li key={id}>
                  <Badge variant="outline" className="font-mono text-xs font-normal">
                    {id}
                  </Badge>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <div className="mt-8">
          <LabEventPanel state={events} />
        </div>

        <div className="mt-12 space-y-14">
          {groups.map((group) => {
            const cases = LAB_CASES.filter((c) => c.group === group);
            if (cases.length === 0) return null;
            return (
              <section key={group} className="space-y-4">
                <h2 className="text-lg font-semibold tracking-tight">{group}</h2>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {cases.map((c) => (
                    <LabCaseCard
                      key={c.id}
                      labCase={c}
                      sink={sink}
                      onStatus={onStatus}
                      eager={eager}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        <p className="mt-16 max-w-[70ch] font-mono text-xs leading-relaxed text-muted-foreground">
          Structural checks need the ECharts handle, which landed with{" "}
          <code className="text-foreground">chartRef</code> in {CURRENT_RELEASE} — run{" "}
          <code className="text-foreground">pnpm dev:local:charts</code> or they all read
          pending. Charts mount as you scroll to them; append{" "}
          <code className="text-foreground">?eager=1</code> to mount all{" "}
          {LAB_CASES.length} at once, and{" "}
          <code className="text-foreground">?only={LAB_GROUPS[0]}</code> to work through a
          single group. Repeat the page in dark mode and with OS reduced motion on.
        </p>
      </div>
    </div>
  );
}
