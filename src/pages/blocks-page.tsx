import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ScrollArea,
  Badge,
  Button,
  NquiLogo,
  Skeleton,
  Tabs,
  TabsList,
  TabsTrigger,
  cn,
} from "@nqlib/nqui";
import { ShowcaseTopBar } from "../components/showcase-top-bar";
import { siteLinks } from "../components/site-links";
import { LiquidGlassBar } from "../components/liquid-glass-bar";
import {
  contrastSlidingTabsListClass,
  contrastSlidingTabsTriggerClass,
} from "../components/contrast-sliding-segment";
import {
  BLOCKS,
  GROUPS,
  LIBS,
  blockMatchesLib,
  isFullBleed,
  libCount,
  resolveStage,
  type Block,
  type Lib,
} from "../components/blocks/registry";
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
  const { hash } = useLocation();

  // One bar, not two: on desktop the filter sits under the intro, and once it
  // scrolls out of view the same filter docks into the floating site nav.
  const filterRef = useRef<HTMLDivElement>(null);
  const [docked, setDocked] = useState(false);
  useEffect(() => {
    const el = filterRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      setDocked(!entry.isIntersecting && entry.boundingClientRect.top < 0);
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Deep links (/blocks#timeline-lab). The router doesn't scroll to hashes,
  // and engine cards above the target grow as they mount, so re-align a few
  // times while layout settles — and stop the moment the reader scrolls.
  useEffect(() => {
    if (!hash) return;
    const id = decodeURIComponent(hash.slice(1));
    let cancelled = false;
    const stop = () => {
      cancelled = true;
    };
    const align = () => {
      if (!cancelled) document.getElementById(id)?.scrollIntoView({ block: "start" });
    };
    const timers = [0, 250, 700, 1500, 2500].map((ms) => window.setTimeout(align, ms));
    window.addEventListener("wheel", stop, { passive: true, once: true });
    window.addEventListener("touchstart", stop, { passive: true, once: true });
    window.addEventListener("keydown", stop, { once: true });
    return () => {
      stop();
      timers.forEach(window.clearTimeout);
      window.removeEventListener("wheel", stop);
      window.removeEventListener("touchstart", stop);
      window.removeEventListener("keydown", stop);
    };
  }, [hash]);
  const sections = useMemo(
    () =>
      GROUPS.map((g) => ({
        ...g,
        blocks: BLOCKS.filter((b) => b.group === g.id && blockMatchesLib(b, lib)),
      })).filter((g) => g.blocks.length > 0),
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
          links={siteLinks}
          dock={docked ? <LibFilter value={lib} onChange={setLib} /> : null}
        />

        <div className="mt-14 max-w-[46ch] md:mt-20">
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground/80">
            {GROUPS.length} jobs · every card is live
          </p>
          <h1 className="mt-3 text-4xl font-semibold leading-[1.07] tracking-[-0.028em] md:text-5xl">
            Blocks, not screenshots.
          </h1>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            Finance reports, revenue pivots, delivery plans and the product
            screens around them — each one running on nqlib, with the parts
            you’d import listed underneath.
          </p>
        </div>

        {/* ── Filter — sticky on phones (the nav scrolls away there); on
             desktop it scrolls with the page and docks into the nav. ───── */}
        <div
          ref={filterRef}
          className="sticky top-3 z-[var(--z-sticky-page)] mt-8 max-w-full lg:static"
        >
          <LiquidGlassBar className="max-w-full [--glass-pad:2px]">
            <LibFilter value={lib} onChange={setLib} />
          </LiquidGlassBar>
        </div>

        {/* ── The shelf, one section per job ─────────────────────────────── */}
        {sections.map((g) => (
          <section
            key={g.id}
            id={g.id}
            aria-labelledby={`${g.id}-title`}
            className="mt-16 scroll-mt-20 first-of-type:mt-10"
          >
            <header className="max-w-[60ch]">
              <h2 id={`${g.id}-title`} className="text-xl font-semibold tracking-tight">
                {g.title}
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{g.lede}</p>
            </header>
            <div className="blk-shelf mt-6">
              {g.blocks.map((b) => (
                <BlockCard key={b.id} b={b} />
              ))}
            </div>
          </section>
        ))}

        <footer className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t pt-6">
          <p className="font-mono text-xs tracking-[0.04em] text-muted-foreground/70">
            nqlib · this page is built with its own packages
          </p>
          <Button size="sm" variant="outline" asChild>
            <Link to="/docs">Install guide</Link>
          </Button>
        </footer>
      </div>
    </div>
  );
}

/** Package filter — nqui Tabs sliding pill (ToggleGroup only cross-fades). */
function LibFilter({
  value,
  onChange,
}: {
  value: Lib | "all";
  onChange: (lib: Lib | "all") => void;
}) {
  return (
    <Tabs
      value={value}
      onValueChange={(v) => onChange(v as Lib | "all")}
      className="w-fit max-w-full"
    >
      <ScrollArea orientation="horizontal" hideScrollbar className="max-w-full min-w-0 rounded-lg">
      <TabsList
        aria-label="Filter blocks by library"
        className={contrastSlidingTabsListClass("w-max border-transparent bg-transparent")}
      >
        {LIBS.map((l) => (
          <TabsTrigger key={l.id} value={l.id} className={contrastSlidingTabsTriggerClass()}>
            {l.label}
            <span className="ml-1.5 tabular-nums opacity-70">{libCount(l.id)}</span>
          </TabsTrigger>
        ))}
      </TabsList>
      </ScrollArea>
    </Tabs>
  );
}

function BlockCard({ b }: { b: Block }) {
  const stage = resolveStage(b);
  // Name the packages actually imported — "report" is a layout, not a package.
  const packages = (b.libs ?? [b.lib]).filter((l) => l !== "report");
  const fullBleed = isFullBleed(stage);
  // Anything past a compact nqui tile pulls an engine or a big table —
  // mount it only once it scrolls near the viewport.
  const heavy = b.lib !== "nqui" || stage !== "compact";
  return (
    <Tray
      id={b.id}
      interactive
      className={cn(
        "scroll-mt-24",
        (fullBleed || b.wide) && "col-span-full",
        stage === "gantt" && "min-h-[48rem]",
        stage === "report" && "min-h-[48rem]",
        stage === "table" && "min-h-[22rem]",
        b.tall && "min-h-[28rem]",
      )}
    >
      <Tray.Caption>
        <span className="truncate text-sm font-medium">{b.name}</span>
        <Badge variant="outline" className="shrink-0 font-mono text-xs font-normal">
          {packages.join(" · ")}
        </Badge>
      </Tray.Caption>

      <Tray.Stage variant={stageVariant(stage)}>
        {heavy ? (
          <LazyMount fallback={<Skeleton className="size-full rounded-none" />}>
            <div className="size-full min-h-0">
              <b.Render />
            </div>
          </LazyMount>
        ) : (
          <Suspense fallback={<Skeleton className="size-full rounded-none" />}>
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
}
