import { Suspense, use, useState, type ComponentType, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ScrollArea, Skeleton, cn, ToggleGroup, ToggleGroupItem } from "@nqlib/nqui";
import { resolveDocsCatalogEntry, loadCatalogComponent, type CatalogEntry } from "@/nqchart/catalog";
import { LazyMount } from "@/components/blocks/lazy-mount";
import { Tray } from "@/components/showcase/tray";
import "@/components/blocks/blocks.css";

const componentCache = new Map<string, Promise<ComponentType>>();

function loadCached(entry: CatalogEntry): Promise<ComponentType> {
  const existing = componentCache.get(entry.id);
  if (existing) return existing;
  const promise = loadCatalogComponent(entry);
  componentCache.set(entry.id, promise);
  return promise;
}

function LiveChart({ entry }: { entry: CatalogEntry }) {
  const Comp = use(loadCached(entry));
  return <Comp />;
}

/**
 * Live nqchart registry embed for docs MDX (parity with becocharts ComponentPreview).
 */
export function ComponentPreview({
  name,
  title,
  className,
  containerClassName,
  previewClassName,
  align = "center",
  hideCode = false,
}: {
  name?: string;
  title?: string;
  className?: string;
  /** Extra classes on the live preview viewport (height, padding, etc.). */
  containerClassName?: string;
  /** Upstream (becocharts) name for the same thing; synced pages use it. */
  previewClassName?: string;
  align?: "center" | "start" | "end";
  hideCode?: boolean;
  children?: ReactNode;
}) {
  const entry = resolveDocsCatalogEntry(name);
  const [tab, setTab] = useState<"preview" | "code">("preview");
  const tallPreview =
    entry?.category === "block" ||
    entry?.id.includes("monospace") ||
    entry?.id.includes("hover-trace") ||
    entry?.id.includes("isometric") ||
    entry?.id.includes("workload-dashboard");

  if (!entry) {
    return (
      <div
        className={cn(
          "my-4 rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm",
          className,
        )}
      >
        <p className="font-medium text-destructive">Preview not found</p>
        <p className="mt-1 text-muted-foreground">
          <code className="font-mono text-xs">{name ?? "(missing name)"}</code> is not in the
          showcase catalog. Run <code className="font-mono text-xs">pnpm nqchart:sync</code> or add
          a docs-extra entry.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("group relative my-4 mb-10", className)}>
      <Tray as="div">
        <Tray.Heading
          as="p"
          title={
            // MDX often titles a variant with the prop itself (`areaVariant='dotted'`).
            title && /[=<{]/.test(title) ? (
              <code className="font-mono text-xs font-medium">{title}</code>
            ) : (
              (title ?? entry.name)
            )
          }
          meta={`@nqlib/nqchart/${entry.component}`}
          action={
            !hideCode ? (
            <ToggleGroup
              type="single"
              size="sm"
              value={tab}
              onValueChange={(v) => v && setTab(v as typeof tab)}
              aria-label="Preview or code"
            >
              <ToggleGroupItem value="code" className="font-mono text-[0.6875rem]">Code</ToggleGroupItem>
              <ToggleGroupItem value="preview" className="font-mono text-[0.6875rem]">Preview</ToggleGroupItem>
            </ToggleGroup>
            ) : null
          }
        />

        <Tray.Stage
          variant="flush"
          className={cn(
            tallPreview ? "h-[22rem] sm:h-[28rem]" : "h-64 sm:h-[22.5rem]",
            containerClassName,
            previewClassName,
          )}
          data-align={align}
        >
          {tab === "preview" ? (
            <LazyMount
              className="size-full min-h-0"
              fallback={<Skeleton className="size-full rounded-md" />}
            >
              <Suspense fallback={<Skeleton className="size-full rounded-md" />}>
                <div className="size-full min-h-0 [&_[data-slot=chart]]:size-full">
                  <LiveChart entry={entry} />
                </div>
              </Suspense>
            </LazyMount>
          ) : (
            <ScrollArea className="size-full min-h-0">
            <div className="space-y-2 p-4 text-sm text-muted-foreground">
              <p>
                Registry id{" "}
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">
                  {entry.id}
                </code>
              </p>
              <p>
                Open the live{" "}
                <Link
                  to={`/charts#${entry.id}`}
                  className="font-medium text-foreground underline-offset-4 hover:underline"
                >
                  charts catalog
                </Link>{" "}
                for the same specimen, or install via the NQChart registry.
              </p>
            </div>
            </ScrollArea>
          )}
        </Tray.Stage>
      </Tray>
    </div>
  );
}
