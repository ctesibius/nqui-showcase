import { Suspense, use, useEffect, useMemo, useState, type ComponentType, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  Badge,
  Button,
  Input,
  NquiLogo,
  Skeleton,
  ToggleGroup,
  ToggleGroupItem,
  cn,
} from "@nqlib/nqui";
import type { BackgroundVariant } from "@nqlib/nqchart";
import { ThemeToggle } from "../components/theme-toggle";
import {
  CATALOG_COUNT,
  NQCHART_CATALOG,
  NQCHART_FAMILIES,
  type CatalogEntry,
} from "../nqchart/catalog";
import { loadCatalogComponent } from "../nqchart/catalog/load-entry";
import {
  applyChartPreviewControls,
  type TooltipPreviewMode,
} from "../nqchart/catalog/apply-preview-controls";
import { LazyMount } from "../components/blocks/lazy-mount";
import "../components/landing/landing.css";
import "../components/blocks/blocks.css";
import "./charts-page.css";

const PAGE_SIZE = 12;

const BG_OPTIONS: Array<BackgroundVariant | "none"> = [
  "none",
  "dots",
  "graph-paper",
  "cross-hatch",
  "diagonal-lines",
  "plus",
  "falling-triangles",
  "4-pointed-star",
  "tiny-checkers",
  "overlapping-circles",
  "wiggle-lines",
  "bubbles",
];

const TIP_OPTIONS: Array<{ id: TooltipPreviewMode; label: string }> = [
  { id: "default", label: "Default" },
  { id: "frosted-glass", label: "Frosted" },
  { id: "hidden", label: "Hidden" },
];

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "example", label: "Examples" },
  { id: "variant", label: "Variants" },
  { id: "recipe", label: "Recipes" },
  { id: "legend", label: "Legends" },
  { id: "loading", label: "Loading" },
  { id: "matrix", label: "Matrix" },
  { id: "block", label: "Blocks" },
] as const;

const componentCache = new Map<string, Promise<ComponentType>>();

function loadCached(entry: CatalogEntry): Promise<ComponentType> {
  const existing = componentCache.get(entry.id);
  if (existing) return existing;
  const promise = loadCatalogComponent(entry);
  componentCache.set(entry.id, promise);
  return promise;
}

function ChartPreview({
  entry,
  background,
  tooltip,
}: {
  entry: CatalogEntry;
  background: BackgroundVariant | "none";
  tooltip: TooltipPreviewMode;
}) {
  const Comp = use(loadCached(entry));
  /*
   * Catalog adapters are wrapper components (`function NQExampleX() { return <NQAreaChart>…`).
   * Cloning `<Comp />` only rewrites Comp's props.children, which wrappers ignore — so
   * background / tooltip controls never reached the real chart. Invoke Comp during render
   * (hooks attach to this fiber; Comp is stable per card) and patch the returned tree.
   */
  const tree = (Comp as (props: Record<string, never>) => ReactNode)({});
  return (
    <>
      {applyChartPreviewControls(tree, {
        background,
        tooltip,
        family: entry.family,
      })}
    </>
  );
}

function ChartCard({
  entry,
  background,
  tooltip,
}: {
  entry: CatalogEntry;
  background: BackgroundVariant | "none";
  tooltip: TooltipPreviewMode;
}) {
  return (
    <figure className="blk-card">
      <figcaption className="flex items-baseline justify-between gap-3">
        <span className="truncate text-sm font-medium">{entry.name}</span>
        <Badge variant="outline" className="shrink-0 font-mono text-[10px] font-normal">
          {entry.family}
        </Badge>
      </figcaption>
      <div
        className={cn(
          "blk-stage blk-stage--chart",
          entry.category === "block" && "charts-stage--tall",
          entry.id.includes("workload-dashboard") && "charts-stage--dashboard",
        )}
      >
        <LazyMount fallback={<Skeleton className="size-full rounded-lg" />}>
          <Suspense fallback={<Skeleton className="size-full rounded-lg" />}>
            <div className="size-full min-h-0">
              <ChartPreview entry={entry} background={background} tooltip={tooltip} />
            </div>
          </Suspense>
        </LazyMount>
      </div>
      <p className="font-mono text-[10px] text-muted-foreground">{entry.id}</p>
      <ul className="flex flex-wrap gap-1">
        <li className="rounded-full bg-foreground/5 px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
          {entry.category}
        </li>
        <li className="rounded-full bg-foreground/5 px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
          {entry.component}
        </li>
      </ul>
    </figure>
  );
}

export function ChartsPage() {
  const [query, setQuery] = useState("");
  const [family, setFamily] = useState<string>("all");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]["id"]>("all");
  const [background, setBackground] = useState<BackgroundVariant | "none">("none");
  const [tooltip, setTooltip] = useState<TooltipPreviewMode>("default");
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return NQCHART_CATALOG.filter((e) => {
      if (family !== "all" && e.family !== family) return false;
      if (category !== "all" && e.category !== category) return false;
      if (!q) return true;
      return (
        e.id.toLowerCase().includes(q) ||
        e.name.toLowerCase().includes(q) ||
        e.exportName.toLowerCase().includes(q)
      );
    });
  }, [query, family, category]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const pageItems = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  useEffect(() => {
    document.documentElement.dataset.nqTooltip = tooltip;
    return () => {
      delete document.documentElement.dataset.nqTooltip;
    };
  }, [tooltip]);

  return (
    <div className="fl-page">
      <div className="fl-grid" aria-hidden />
      <div className="fl-glow" aria-hidden />

      <div className="relative z-[var(--z-base)] mx-auto w-[var(--fl-shell)] pb-24 pt-8">
        <header className="flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5">
            <NquiLogo className="size-[22px]" />
            <span className="text-sm font-semibold tracking-tight">
              nqlib<span className="font-medium text-muted-foreground"> · charts</span>
            </span>
          </Link>
          <div className="flex items-center gap-1.5">
            <Button size="sm" variant="ghost" className="rounded-full" asChild>
              <Link to="/blocks">Blocks</Link>
            </Button>
            <Button size="sm" variant="ghost" className="rounded-full" asChild>
              <Link to="/readme/nqchart">Docs</Link>
            </Button>
            <ThemeToggle />
          </div>
        </header>

        <div className="mt-14 max-w-[52ch] md:mt-20">
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground/80">
            {CATALOG_COUNT} examples · synced from becocharts registry
          </p>
          <h1 className="mt-3 text-[clamp(1.9rem,3.6vw,2.55rem)] font-semibold leading-[1.07] tracking-[-0.028em]">
            Every NQChart, live.
          </h1>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            Full catalog of registry examples. Background and tooltip controls
            apply to every chart on the page — no duplicate cards per chrome variant.
          </p>
        </div>

        <div className="charts-toolbar sticky top-3 z-[var(--z-sticky-content)] mt-8 space-y-3 rounded-2xl border bg-background/80 p-3 backdrop-blur-md">
          <div className="flex flex-wrap items-center gap-2">
            <Input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(0);
              }}
              placeholder="Search examples…"
              className="h-8 max-w-xs rounded-full text-xs"
            />
            <ToggleGroup
              type="single"
              value={family}
              onValueChange={(v) => {
                if (!v) return;
                setFamily(v);
                setPage(0);
              }}
              /* No flex-wrap: nqui's ToggleGroup is deliberately a single row
                 that scrolls horizontally (hidden scrollbar) when it runs out
                 of width. Adding flex-wrap defeats that — the pill wraps and
                 grows tall, and because nqui sets overflow-x:auto, CSS forces
                 overflow-y to auto too, so the wrapped rows become draggable
                 and slide out of alignment.
                 No gap-* either: spacing=0 is nqui's segmented mode, where items are
                 rounded-none because they're meant to sit flush. A gap re-exposes the
                 shell between them, so a hover fill stops short of its neighbour and
                 reads as a sliver. Use the `spacing` prop if separation is ever wanted. */
            >
              <ToggleGroupItem value="all" className="h-7 rounded-full px-2.5 text-[11px]">
                All families
              </ToggleGroupItem>
              {NQCHART_FAMILIES.map((f) => (
                <ToggleGroupItem key={f} value={f} className="h-7 rounded-full px-2.5 text-[11px]">
                  {f}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Category
            </span>
            <ToggleGroup
              type="single"
              value={category}
              onValueChange={(v) => {
                if (!v) return;
                setCategory(v as typeof category);
                setPage(0);
              }}
              /* No flex-wrap: nqui's ToggleGroup is deliberately a single row
                 that scrolls horizontally (hidden scrollbar) when it runs out
                 of width. Adding flex-wrap defeats that — the pill wraps and
                 grows tall, and because nqui sets overflow-x:auto, CSS forces
                 overflow-y to auto too, so the wrapped rows become draggable
                 and slide out of alignment.
                 No gap-* either: spacing=0 is nqui's segmented mode, where items are
                 rounded-none because they're meant to sit flush. A gap re-exposes the
                 shell between them, so a hover fill stops short of its neighbour and
                 reads as a sliver. Use the `spacing` prop if separation is ever wanted. */
            >
              {CATEGORIES.map((c) => (
                <ToggleGroupItem key={c.id} value={c.id} className="h-7 rounded-full px-2.5 text-[11px]">
                  {c.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Background
              <select
                className="h-7 rounded-full border bg-background px-2 text-[11px] normal-case tracking-normal text-foreground"
                value={background}
                onChange={(e) => setBackground(e.target.value as BackgroundVariant | "none")}
              >
                {BG_OPTIONS.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </label>

            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Tooltip
            </span>
            <ToggleGroup
              type="single"
              value={tooltip}
              onValueChange={(v) => v && setTooltip(v as TooltipPreviewMode)}
            >
              {TIP_OPTIONS.map((t) => (
                <ToggleGroupItem key={t.id} value={t.id} className="h-7 rounded-full px-2.5 text-[11px]">
                  {t.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>

            <span className="ml-auto font-mono text-[11px] tabular-nums text-muted-foreground">
              {filtered.length} match · page {safePage + 1}/{pageCount}
            </span>
          </div>
        </div>

        <div className="blk-shelf mt-8">
          {pageItems.map((entry) => (
            <ChartCard
              key={entry.id}
              entry={entry}
              background={background}
              tooltip={tooltip}
            />
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="mt-10 text-sm text-muted-foreground">No examples match these filters.</p>
        ) : (
          <div className="mt-10 flex items-center justify-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="rounded-full"
              disabled={safePage <= 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="rounded-full"
              disabled={safePage >= pageCount - 1}
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            >
              Next
            </Button>
          </div>
        )}

        <footer className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t pt-6">
          <p className="font-mono text-[0.72rem] tracking-[0.04em] text-muted-foreground/70">
            synced via <code>pnpm nqchart:sync</code> · {PAGE_SIZE} charts mounted per page
          </p>
          <Button size="sm" variant="outline" className="rounded-full" asChild>
            <Link to="/blocks">Component blocks</Link>
          </Button>
        </footer>
      </div>
    </div>
  );
}

export default ChartsPage;
