import { Suspense, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Badge,
  Button,
  NquiLogo,
  Skeleton,
  Tabs,
  TabsList,
  TabsTrigger,
  cn,
} from "@nqlib/nqui";
import { ShowcaseTopBar , devTopBarLinks } from "../components/showcase-top-bar";
import { LiquidGlassBar } from "../components/liquid-glass-bar";
import {
  contrastSlidingTabsListClass,
  contrastSlidingTabsTriggerClass,
} from "../components/contrast-sliding-segment";
import { BLOCKS, LIBS, blockMatchesLib, isFullBleed, libCount, resolveStage, type Lib } from "../components/blocks/registry";
import { LazyMount } from "../components/blocks/lazy-mount";
import {
  Tray,
  trayMeta,
  trayTags,
  type TrayStageVariant,
} from "../components/showcase/tray";
import "../components/landing/landing.css";
import "../components/blocks/blocks.css";

/*
 * The blocks gallery — the tour. Same room as the landing (grid wallpaper, one
 * bloom), but the shelf uses shared Tray (muted rim → background stage).
 * Every block is live nqlib.
 *
 * Tray size follows the component's job (`stage`): charts stay 4:3 tiles,
 * tables get vertical room, gantt/report claim the full shelf — never cram a
 * timeline into minmax(310px).
 */

function stageVariant(stage: ReturnType<typeof resolveStage>): TrayStageVariant {
  if (stage === "compact") return "default";
  return stage;
}

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
        <ShowcaseTopBar
          brand={
            <Link to="/" className="flex items-center gap-2.5">
              <NquiLogo className="size-[22px]" />
              <span className="text-sm font-semibold tracking-tight">
                nqlib<span className="font-medium text-muted-foreground"> · blocks</span>
              </span>
            </Link>
          }
          links={[
            { to: "/catalog", label: "Catalog" },
            { to: "/charts", label: "Charts" },
            { to: "/docs", label: "Docs" },
            ...devTopBarLinks,
          ]}
        />

        <div className="mt-14 max-w-[46ch] md:mt-20">
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground/80">
            {BLOCKS.length} patterns · copy the idea, keep the pieces
          </p>
          <h1 className="mt-3 text-4xl font-semibold leading-[1.07] tracking-[-0.028em] md:text-5xl">
            Blocks, not screenshots.
          </h1>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            Every card below is live and built only from nqlib. Toggle a switch,
            drag a slider, sort a table — this page is the library running.
          </p>
        </div>

        {/* ── Filter — nqui Tabs sliding pill (ToggleGroup only cross-fades) ─ */}
        <div className="sticky top-3 z-[var(--z-sticky-content)] mt-8 max-w-full">
          <Tabs
            value={lib}
            onValueChange={(v) => setLib(v as Lib | "all")}
            className="w-fit max-w-full"
          >
            <LiquidGlassBar shape="pill" className="max-w-full" contentClassName="p-0.5">
              <TabsList
                aria-label="Filter blocks by library"
                className={contrastSlidingTabsListClass(
                  "max-w-full overflow-x-auto border-transparent bg-transparent [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
                )}
              >
                {LIBS.map((l) => (
                  <TabsTrigger
                    key={l.id}
                    value={l.id}
                    className={contrastSlidingTabsTriggerClass()}
                  >
                    {l.label}
                    <span className="ml-1.5 tabular-nums opacity-70">{libCount(l.id)}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </LiquidGlassBar>
          </Tabs>
        </div>

        {/* ── The shelf ──────────────────────────────────────────────────── */}
        <div className="blk-shelf mt-8">
          {shown.map((b) => {
            const stage = resolveStage(b);
            const fullBleed = isFullBleed(stage);
            const heavy =
              b.lib === "nqchart" || b.lib === "report" || b.lib === "nqgrid" || b.lib === "nqgantt";
            return (
              <Tray
                key={b.id}
                interactive
                className={cn(
                  (fullBleed || b.wide) && "col-span-full",
                  stage === "gantt" && "min-h-[28rem]",
                  stage === "report" && "min-h-[48rem]",
                  stage === "table" && "min-h-[22rem]",
                  b.tall && "min-h-[28rem]",
                )}
              >
                <Tray.Caption>
                  <span className="truncate text-sm font-medium">{b.name}</span>
                  <Badge variant="outline" className="shrink-0 font-mono text-xs font-normal">
                    {b.lib}
                  </Badge>
                </Tray.Caption>

                <Tray.Stage variant={stageVariant(stage)}>
                  {heavy ? (
                    <LazyMount fallback={<Skeleton className="size-full rounded-md" />}>
                      <div className="size-full min-h-0">
                        <b.Render />
                      </div>
                    </LazyMount>
                  ) : (
                    <Suspense fallback={<Skeleton className="size-full rounded-md" />}>
                      <b.Render />
                    </Suspense>
                  )}
                </Tray.Stage>

                <p className={cn(trayMeta, "text-xs leading-relaxed text-muted-foreground")}>
                  {b.blurb}
                </p>
                <ul className={trayTags}>
                  {b.bom.map((p) => (
                    <li
                      key={p}
                      className="rounded-full bg-foreground/5 px-2 py-0.5 font-mono text-xs text-muted-foreground"
                    >
                      {p}
                    </li>
                  ))}
                </ul>
              </Tray>
            );
          })}
        </div>

        <footer className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t pt-6">
          <p className="font-mono text-xs tracking-[0.04em] text-muted-foreground/70">
            nqlib · this page is built with its own packages
          </p>
          <Button size="sm" variant="outline" className="rounded-full" asChild>
            <Link to="/docs">Install guide</Link>
          </Button>
        </footer>
      </div>
    </div>
  );
}
