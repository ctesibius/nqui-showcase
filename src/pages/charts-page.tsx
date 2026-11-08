import { Suspense, use, useEffect, useMemo, useRef, useState, type ComponentType, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import {
  Badge,
  Button,
  Label,
  NativeSelect,
  NativeSelectOption,
  Skeleton,
  Switch,
  Tabs,
  TabsList,
  TabsTrigger,
  ToggleGroup,
  ToggleGroupItem,
  cn,
} from "@nqlib/nqui";
import type { BackgroundVariant } from "@nqlib/nqchart";
import { GalleryPage } from "../components/gallery/gallery-shell";
import {
  RailFilter,
  RailGroup,
  RailHeader,
  RailLinks,
  RailSearch,
} from "../components/gallery/rail";
import { useScrollSpy } from "../components/gallery/gallery-scroll";
import {
  CATALOG_COUNT,
  NQCHART_CATALOG,
  NQCHART_FAMILIES,
  type CatalogEntry,
} from "../nqchart/catalog";
import { loadCatalogComponent } from "../nqchart/catalog/load-entry";
import {
  FEATURED_GROUPS,
  type FeaturedChart,
} from "../nqchart/catalog/featured";
import {
  contrastSlidingTabsListClass,
  contrastSlidingTabsTriggerClass,
} from "../components/contrast-sliding-segment";
import {
  applyChartPreviewControls,
  type TooltipPreviewMode,
} from "../nqchart/catalog/apply-preview-controls";
import { LazyMount } from "../components/blocks/lazy-mount";
import { Tray, trayMeta } from "../components/showcase/tray";
import { isNew } from "../nqchart/lab/whats-new";
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
  { id: "all", label: "Everything" },
  { id: "example", label: "Examples" },
  { id: "variant", label: "Variants" },
  { id: "recipe", label: "Recipes" },
  { id: "legend", label: "Legends" },
  { id: "loading", label: "Loading" },
  { id: "matrix", label: "Matrix" },
  { id: "block", label: "Blocks" },
] as const;

type ChartsView = "featured" | "all";

const CATALOG_BY_ID = new Map(NQCHART_CATALOG.map((e) => [e.id, e]));

/** Featured groups resolved against the generated catalog; unknown ids drop out. */
const FEATURED_SECTIONS = FEATURED_GROUPS.map((g) => ({
  ...g,
  items: g.charts.flatMap((chart) => {
    const entry = CATALOG_BY_ID.get(chart.id);
    if (!entry) {
      if (import.meta.env.DEV) console.warn(`[charts] featured id not in catalog: ${chart.id}`);
      return [];
    }
    return [{ chart, entry }];
  }),
})).filter((g) => g.items.length > 0);

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
  hoverFocus,
}: {
  entry: CatalogEntry;
  background: BackgroundVariant | "none";
  tooltip: TooltipPreviewMode;
  hoverFocus: boolean;
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
        hoverFocus,
        family: entry.family,
      })}
    </>
  );
}

function ChartCard({
  entry,
  feature,
  background,
  tooltip,
  hoverFocus,
}: {
  entry: CatalogEntry;
  /** Curated framing — the card then leads with the job, not the registry id. */
  feature?: FeaturedChart;
  background: BackgroundVariant | "none";
  tooltip: TooltipPreviewMode;
  hoverFocus: boolean;
}) {
  return (
    <Tray interactive>
      <Tray.Caption>
        <span className="truncate text-sm font-medium">{feature?.title ?? entry.name}</span>
        <span className="flex shrink-0 items-center gap-1.5">
          {isNew(entry.id) ? (
            <Badge className="font-mono text-xs font-normal">New</Badge>
          ) : null}
          <Badge variant="outline" className="font-mono text-xs font-normal">
            {entry.family}
          </Badge>
        </span>
      </Tray.Caption>
      <Tray.Stage
        variant="chart"
        className={cn(
          entry.category === "block" && "charts-stage--tall",
          entry.id.includes("workload-dashboard") && "charts-stage--dashboard",
        )}
      >
        <LazyMount fallback={<Skeleton className="size-full rounded-none" />}>
          <Suspense fallback={<Skeleton className="size-full rounded-none" />}>
            <div className="size-full min-h-0">
              <ChartPreview
                entry={entry}
                background={background}
                tooltip={tooltip}
                hoverFocus={hoverFocus}
              />
            </div>
          </Suspense>
        </LazyMount>
      </Tray.Stage>
      <div className={cn(trayMeta, "space-y-1 pb-2")}>
        {feature ? (
          <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">{feature.note}</p>
        ) : null}
        <p className="truncate font-mono text-xs text-muted-foreground">
          @nqlib/nqchart/{entry.component}
        </p>
      </div>
    </Tray>
  );
}

type CategoryId = (typeof CATEGORIES)[number]["id"];

const FAMILY_LABEL = (f: string) => (f === "kpi" ? "KPI" : f.charAt(0).toUpperCase() + f.slice(1));

function matchesQuery(e: CatalogEntry, q: string) {
  return (
    !q ||
    e.id.toLowerCase().includes(q) ||
    e.name.toLowerCase().includes(q) ||
    e.exportName.toLowerCase().includes(q)
  );
}

const FEATURED_IDS = FEATURED_SECTIONS.map((g) => g.id);

export function ChartsPage() {
  const [view, setView] = useState<ChartsView>("featured");
  const [query, setQuery] = useState("");
  const [family, setFamily] = useState<string>("all");
  const [category, setCategory] = useState<CategoryId>("all");
  const [background, setBackground] = useState<BackgroundVariant | "none">("none");
  const [tooltip, setTooltip] = useState<TooltipPreviewMode>("default");
  const [hoverFocus, setHoverFocus] = useState(true);
  const [page, setPage] = useState(0);
  const resultsRef = useRef<HTMLDivElement>(null);

  const q = query.trim().toLowerCase();

  const filtered = useMemo(
    () =>
      NQCHART_CATALOG.filter(
        (e) =>
          (family === "all" || e.family === family) &&
          (category === "all" || e.category === category) &&
          matchesQuery(e, q),
      ),
    [q, family, category],
  );

  // Faceted counts: each list counts what you'd get by picking that row,
  // given the other filters — so a row never promises charts it can't show.
  const familyItems = useMemo(() => {
    const pool = NQCHART_CATALOG.filter(
      (e) => (category === "all" || e.category === category) && matchesQuery(e, q),
    );
    return [
      { value: "all", label: "All families", count: pool.length },
      ...NQCHART_FAMILIES.map((f) => ({
        value: f,
        label: FAMILY_LABEL(f),
        count: pool.filter((e) => e.family === f).length,
      })),
    ];
  }, [q, category]);

  const categoryItems = useMemo(() => {
    const pool = NQCHART_CATALOG.filter(
      (e) => (family === "all" || e.family === family) && matchesQuery(e, q),
    );
    return CATEGORIES.map((c) => ({
      value: c.id,
      label: c.label,
      count: c.id === "all" ? pool.length : pool.filter((e) => e.category === c.id).length,
    }));
  }, [q, family]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const pageItems = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  const activeQuestion = useScrollSpy(view === "featured" ? FEATURED_IDS : []);

  useEffect(() => {
    document.documentElement.dataset.nqTooltip = tooltip;
    return () => {
      delete document.documentElement.dataset.nqTooltip;
    };
  }, [tooltip]);

  const goToPage = (next: number) => {
    setPage(next);
    const top = resultsRef.current;
    if (top && top.getBoundingClientRect().top < 0) top.scrollIntoView({ block: "start" });
  };

  const resetFilters = () => {
    setQuery("");
    setFamily("all");
    setCategory("all");
    setPage(0);
  };
  const hasFilters = family !== "all" || category !== "all" || q !== "";

  const familyLabel = family === "all" ? null : FAMILY_LABEL(family);
  const categoryLabel = category === "all" ? null : CATEGORIES.find((c) => c.id === category)?.label;

  const rail = (
    <>
      <RailHeader pkg="@nqlib/nqchart" count={CATALOG_COUNT} unit="charts" />

      <Tabs value={view} onValueChange={(v) => setView(v as ChartsView)} className="w-full">
        <TabsList aria-label="Charts view" className={contrastSlidingTabsListClass("w-full")}>
          <TabsTrigger value="featured" className={contrastSlidingTabsTriggerClass("flex-1 px-2")}>
            By question
          </TabsTrigger>
          <TabsTrigger value="all" className={contrastSlidingTabsTriggerClass("flex-1 px-2")}>
            Everything
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {view === "featured" ? (
        <RailGroup label="Questions">
          <RailLinks
            label="Chart questions"
            activeId={activeQuestion}
            items={FEATURED_SECTIONS.map((g) => ({ id: g.id, label: g.title, count: g.items.length }))}
          />
        </RailGroup>
      ) : (
        <>
          <RailSearch
            label="Search charts"
            placeholder="Search charts"
            value={query}
            onChange={(v) => {
              setQuery(v);
              setPage(0);
            }}
          />
          <RailGroup label="Family">
            <RailFilter
              label="Chart family"
              value={family}
              onValueChange={(v) => {
                setFamily(v);
                setPage(0);
              }}
              items={familyItems}
            />
          </RailGroup>
          <RailGroup label="Kind">
            <RailFilter
              label="Example kind"
              value={category}
              onValueChange={(v) => {
                setCategory(v);
                setPage(0);
              }}
              items={categoryItems}
            />
          </RailGroup>
          <RailGroup label="Preview">
            <div className="flex flex-col gap-3 px-2">
              <Label className="flex-col items-stretch gap-1.5 text-xs font-normal text-muted-foreground">
                Background
                <NativeSelect
                  size="sm"
                  className="w-full text-foreground"
                  value={background}
                  onChange={(e) => setBackground(e.target.value as BackgroundVariant | "none")}
                >
                  {BG_OPTIONS.map((v) => (
                    <NativeSelectOption key={v} value={v}>
                      {v === "none" ? "None" : v.replace(/-/g, " ")}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </Label>
              <div className="flex flex-col gap-1.5">
                <span id="charts-tooltip-label" className="text-xs text-muted-foreground">
                  Tooltip
                </span>
                <ToggleGroup
                  type="single"
                  aria-labelledby="charts-tooltip-label"
                  value={tooltip}
                  onValueChange={(v) => v && setTooltip(v as TooltipPreviewMode)}
                  className="w-full"
                >
                  {TIP_OPTIONS.map((t) => (
                    <ToggleGroupItem key={t.id} value={t.id} className="h-7 flex-1 text-xs">
                      {t.label}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>
              <Label className="justify-between text-xs font-normal text-muted-foreground">
                Dim others on hover
                <Switch size="sm" checked={hoverFocus} onCheckedChange={setHoverFocus} />
              </Label>
            </div>
          </RailGroup>
        </>
      )}
    </>
  );

  const railSummary =
    view === "featured"
      ? (FEATURED_SECTIONS.find((g) => g.id === activeQuestion)?.title ?? "By question")
      : [familyLabel ?? "All families", categoryLabel, q && `“${query.trim()}”`].filter(Boolean).join(" · ") +
        ` — ${filtered.length}`;

  return (
    <GalleryPage
      section="charts"
      title="Pick the chart by the question."
      lede="Compare, trend, composition, conversion, spread and capacity — one composable API, themed by your tokens. Hover any chart; the import is under each card."
      aside={
        <>
          Want to feel the interactions — brush, legend focus, drill?{" "}
          <Link
            to="/charts/lab"
            className="font-medium text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground"
          >
            Try the interaction lab
          </Link>
          .
        </>
      }
      rail={rail}
      railSummary={railSummary}
      railLabel="Browse charts"
      footer={
        <Button size="sm" variant="outline" asChild>
          <Link to="/catalog">Component catalog</Link>
        </Button>
      }
    >
      {view === "featured" ? (
        <div className="flex flex-col gap-16">
          {FEATURED_SECTIONS.map((g) => (
            <section key={g.id} id={g.id} aria-labelledby={`${g.id}-title`} className="scroll-mt-24">
              <header className="max-w-[60ch]">
                <h2 id={`${g.id}-title`} className="text-xl font-semibold tracking-tight">
                  {g.title}
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{g.question}</p>
              </header>
              <div className="blk-shelf charts-shelf--pairs mt-6">
                {g.items.map(({ chart, entry }) => (
                  <ChartCard
                    key={entry.id}
                    entry={entry}
                    feature={chart}
                    background="none"
                    tooltip="default"
                    hoverFocus
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div ref={resultsRef} className="scroll-mt-24">
          <div className="flex min-h-8 flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <p className="text-sm text-muted-foreground" aria-live="polite">
              <span className="font-medium tabular-nums text-foreground">{filtered.length}</span>{" "}
              {filtered.length === 1 ? "chart" : "charts"}
              {familyLabel ? ` · ${familyLabel}` : ""}
              {categoryLabel ? ` · ${categoryLabel}` : ""}
              {q ? ` matching “${query.trim()}”` : ""}
              {hasFilters ? (
                <Button variant="link" size="sm" className="ml-2 h-auto p-0 text-sm" onClick={resetFilters}>
                  Clear
                </Button>
              ) : null}
            </p>
            {pageCount > 1 ? (
              <Pager page={safePage} pageCount={pageCount} onPage={goToPage} />
            ) : null}
          </div>

          {filtered.length === 0 ? (
            <div className="mt-6 rounded-lg border border-dashed border-border px-6 py-14 text-center">
              <p className="text-sm font-medium">No charts match these filters.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try another family, or search by component name — “bar”, “Funnel”, “sankey”.
              </p>
              <Button size="sm" variant="outline" className="mt-4" onClick={resetFilters}>
                Clear filters
              </Button>
            </div>
          ) : (
            <>
              <div className="blk-shelf charts-shelf--pairs mt-5">
                {pageItems.map((entry) => (
                  <ChartCard
                    key={entry.id}
                    entry={entry}
                    background={background}
                    tooltip={tooltip}
                    hoverFocus={hoverFocus}
                  />
                ))}
              </div>
              {pageCount > 1 ? (
                <div className="mt-10 flex justify-center">
                  <Pager page={safePage} pageCount={pageCount} onPage={goToPage} />
                </div>
              ) : null}
            </>
          )}
        </div>
      )}
    </GalleryPage>
  );
}

function Pager({ page, pageCount, onPage }: { page: number; pageCount: number; onPage: (page: number) => void }) {
  return (
    <nav aria-label="Pages" className="flex items-center gap-1">
      <Button
        size="icon"
        variant="ghost"
        aria-label="Previous page"
        disabled={page <= 0}
        onClick={() => onPage(page - 1)}
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} />
      </Button>
      <span className="min-w-[4.5rem] text-center text-xs tabular-nums text-muted-foreground">
        {page + 1} of {pageCount}
      </span>
      <Button
        size="icon"
        variant="ghost"
        aria-label="Next page"
        disabled={page >= pageCount - 1}
        onClick={() => onPage(page + 1)}
      >
        <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} />
      </Button>
    </nav>
  );
}

export default ChartsPage;
