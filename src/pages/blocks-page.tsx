import { Suspense, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Badge,
  Button,
  NquiLogo,
  Skeleton,
  ToggleGroup,
  ToggleGroupItem,
  cn,
} from "@nqlib/nqui";
import { ThemeToggle } from "../components/theme-toggle";
import { BLOCKS, LIBS, blockMatchesLib, isFullBleed, libCount, resolveStage, type Lib } from "../components/blocks/registry";
import { LazyMount } from "../components/blocks/lazy-mount";
import "../components/landing/landing.css";
import "../components/blocks/blocks.css";

/*
 * The blocks gallery — the tour. Same room as the landing (grid wallpaper, one
 * bloom, calm engineered chrome), but where the landing shows one window, this
 * shows the whole shelf: every block is a real, interactive pattern built only
 * from nqlib components. Filter by library; each card names its bill of
 * materials so you can read a block and know what to import.
 *
 * Card size follows the component's job (`stage`): charts stay 4:3 tiles,
 * tables get vertical room, gantt/report claim the full shelf — never cram a
 * timeline into minmax(310px).
 */

export function BlocksPage() {
  const [lib, setLib] = useState<Lib | "all">("all");
  const shown = useMemo(
    () => (lib === "all" ? BLOCKS : BLOCKS.filter((b) => blockMatchesLib(b, lib))),
    [lib],
  );

  return (
    <div className="fl-page">
      <div className="fl-grid" aria-hidden />
      <div className="fl-glow" aria-hidden />

      <div className="relative z-[var(--z-base)] mx-auto w-[var(--fl-shell)] pb-24 pt-8">
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <header className="flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5">
            <NquiLogo className="size-[22px]" />
            <span className="text-sm font-semibold tracking-tight">
              nqlib<span className="font-medium text-muted-foreground"> · blocks</span>
            </span>
          </Link>
          <div className="flex items-center gap-1.5">
            <Button size="sm" variant="ghost" className="rounded-full" asChild>
              <Link to="/catalog">Catalog</Link>
            </Button>
            <Button size="sm" variant="ghost" className="rounded-full" asChild>
              <Link to="/charts">Charts</Link>
            </Button>
            <Button size="sm" variant="ghost" className="rounded-full" asChild>
              <Link to="/readme">Docs</Link>
            </Button>
            <ThemeToggle />
          </div>
        </header>

        <div className="mt-14 max-w-[46ch] md:mt-20">
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground/80">
            {BLOCKS.length} patterns · copy the idea, keep the pieces
          </p>
          <h1 className="mt-3 text-[clamp(1.9rem,3.6vw,2.55rem)] font-semibold leading-[1.07] tracking-[-0.028em]">
            Blocks, not screenshots.
          </h1>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            Every card below is live and built only from nqlib. Toggle a switch,
            drag a slider, sort a table — this page is the library running.
          </p>
        </div>

        {/* ── Filter ─────────────────────────────────────────────────────── */}
        <div className="sticky top-3 z-[var(--z-sticky-content)] mt-8 flex max-w-full w-fit flex-wrap rounded-full border bg-background/70 p-1 backdrop-blur-md">
          <ToggleGroup
            type="single"
            value={lib}
            onValueChange={(v) => v && setLib(v as Lib | "all")}
          >
            {LIBS.map((l) => (
              <ToggleGroupItem
                key={l.id}
                value={l.id}
                className="rounded-full px-3 text-xs data-[state=on]:bg-foreground data-[state=on]:text-background"
              >
                {l.label}
                <span className="ml-1.5 tabular-nums opacity-60">{libCount(l.id)}</span>
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        {/* ── The shelf ──────────────────────────────────────────────────── */}
        <div className="blk-shelf mt-8">
          {shown.map((b) => {
            const stage = resolveStage(b);
            const fullBleed = isFullBleed(stage);
            const heavy =
              b.lib === "nqchart" || b.lib === "report" || b.lib === "nqgrid" || b.lib === "nqgantt";
            return (
              <figure
                key={b.id}
                className={cn(
                  "blk-card",
                  fullBleed && "blk-card--wide",
                  stage === "gantt" && "blk-card--gantt",
                  stage === "report" && "blk-card--report",
                  stage === "table" && "blk-card--table",
                  (b.tall || stage === "compact") &&                   b.tall && "blk-card--tall",
                )}
              >
                <figcaption className="flex items-baseline justify-between gap-3">
                  <span className="text-sm font-medium">{b.name}</span>
                  <Badge variant="outline" className="shrink-0 font-mono text-[10px] font-normal">
                    {b.lib}
                  </Badge>
                </figcaption>

                {/* Live surface. Stage CSS is intentional: size follows the job. */}
                <div
                  className={cn(
                    "blk-stage",
                    stage === "chart" && "blk-stage--chart",
                    stage === "table" && "blk-stage--table",
                    stage === "gantt" && "blk-stage--gantt",
                    stage === "report" && "blk-stage--report",
                  )}
                >
                  {heavy ? (
                    <LazyMount fallback={<Skeleton className="size-full rounded-lg" />}>
                      <div className="size-full min-h-0">
                        <b.Render />
                      </div>
                    </LazyMount>
                  ) : (
                    <Suspense fallback={<Skeleton className="size-full rounded-lg" />}>
                      <b.Render />
                    </Suspense>
                  )}
                </div>

                <p className="text-xs leading-relaxed text-muted-foreground">{b.blurb}</p>
                <ul className="flex flex-wrap gap-1">
                  {b.bom.map((p) => (
                    <li
                      key={p}
                      className="rounded-full bg-foreground/5 px-2 py-0.5 font-mono text-[10px] text-muted-foreground"
                    >
                      {p}
                    </li>
                  ))}
                </ul>
              </figure>
            );
          })}
        </div>

        <footer className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t pt-6">
          <p className="font-mono text-[0.72rem] tracking-[0.04em] text-muted-foreground/70">
            nqlib · this page is built with its own packages
          </p>
          <Button size="sm" variant="outline" className="rounded-full" asChild>
            <Link to="/readme">Install guide</Link>
          </Button>
        </footer>
      </div>
    </div>
  );
}
