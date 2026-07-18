import { Suspense, use, useState, type ComponentType, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Skeleton, cn } from "@nqlib/nqui";
import { resolveDocsCatalogEntry, loadCatalogComponent, type CatalogEntry } from "@/nqchart/catalog";
import { LazyMount } from "@/components/blocks/lazy-mount";

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
  align = "center",
  hideCode = false,
}: {
  name?: string;
  title?: string;
  className?: string;
  /** Extra classes on the live preview viewport (height, padding, etc.). */
  containerClassName?: string;
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
      <div className="flex flex-col rounded-lg bg-muted p-1">
        <div className="flex items-center justify-between gap-2 px-2 py-1">
          <span className="line-clamp-1 font-mono text-xs text-muted-foreground">
            {title ?? entry.name}
          </span>
          {!hideCode ? (
            <div className="flex items-center gap-1">
              <button
                type="button"
                className={cn(
                  "rounded px-1.5 py-0.5 font-mono text-[0.6875rem] transition-colors",
                  tab === "code"
                    ? "bg-background text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
                onClick={() => setTab("code")}
              >
                Code
              </button>
              <button
                type="button"
                className={cn(
                  "rounded px-1.5 py-0.5 font-mono text-[0.6875rem] transition-colors",
                  tab === "preview"
                    ? "bg-background text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
                onClick={() => setTab("preview")}
              >
                Preview
              </button>
            </div>
          ) : null}
        </div>

        <div className="overflow-hidden rounded-md border border-border bg-background">
          {tab === "preview" ? (
            <div
              className={cn(
                "flex w-full justify-center",
                tallPreview ? "h-[22rem] sm:h-[28rem]" : "h-64 sm:h-[22.5rem]",
                containerClassName,
              )}
              data-align={align}
              style={{
                alignItems:
                  align === "start" ? "flex-start" : align === "end" ? "flex-end" : "center",
              }}
            >
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
            </div>
          ) : (
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
          )}
        </div>
      </div>
    </div>
  );
}
