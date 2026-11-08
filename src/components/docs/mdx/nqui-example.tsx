/**
 * Live nqui embed for the app-builder guide.
 *
 * Same Tray chrome as GanttExample / chart previews. Includes a catalog deep
 * link — full variants stay on `/catalog`, not duplicated here.
 */
import { Suspense, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Skeleton, cn } from "@nqlib/nqui";
import { Tray, trayActionLink } from "@/components/showcase/tray";
import { lazyNquiExample, resolveNquiExample } from "@/nqui/docs-examples";

export function NquiExample({
  name,
  title,
  className,
}: {
  name?: string;
  title?: string;
  className?: string;
}) {
  const entry = resolveNquiExample(name);

  if (!entry) {
    return (
      <div
        className={cn(
          "my-4 rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm",
          className,
        )}
      >
        Unknown nqui example <code className="font-mono">{name}</code>.
      </div>
    );
  }

  const Example = lazyNquiExample(entry);
  const catalogHref = `/catalog#${entry.catalogHash}`;

  return (
    <div className={cn("my-5", className)}>
      <Tray as="div">
        <Tray.Heading
          as="p"
          title={title ?? entry.title}
          meta={`@nqlib/nqui · ${entry.imports}`}
          action={
            <Link to={catalogHref} className={trayActionLink}>
              Catalog
            </Link>
          }
        />
        <Tray.Stage variant="flush" className={entry.height}>
          <Suspense fallback={<Skeleton className="h-full w-full" />}>
            <Example />
          </Suspense>
        </Tray.Stage>
      </Tray>
    </div>
  );
}

/** Quiet deep-link helper for guide prose (section map / “see also”). */
export function CatalogLink({
  hash,
  children,
  className,
}: {
  hash: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <Link
      to={`/catalog#${hash}`}
      className={cn(
        "text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground",
        className,
      )}
    >
      {children ?? "Open in catalog"}
    </Link>
  );
}
