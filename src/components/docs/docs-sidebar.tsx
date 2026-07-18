import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { ScrollArea, cn } from "@nqlib/nqui";
import type * as PageTree from "fumadocs-core/page-tree";
import { source } from "@/lib/docs-source";

function isSeparator(node: PageTree.Node): node is PageTree.Separator {
  return node.type === "separator";
}

function isFolder(node: PageTree.Node): node is PageTree.Folder {
  return node.type === "folder";
}

function isPage(node: PageTree.Node): node is PageTree.Item {
  return node.type === "page";
}

function nodeName(node: PageTree.Node): string {
  if (typeof node.name === "string") return node.name;
  return "";
}

function linkClass(active: boolean, depth: number) {
  return cn(
    "block rounded-[var(--radius-sm)] px-2.5 py-1.5 text-[0.8125rem] leading-snug transition-colors duration-150",
    depth > 0 && "pl-2.5",
    active
      ? "bg-muted font-medium text-foreground"
      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
  );
}

function DocsTreeNodes({ nodes, depth = 0 }: { nodes: PageTree.Node[]; depth?: number }) {
  const { pathname } = useLocation();

  return (
    <ul
      className={cn(
        "flex flex-col gap-0.5",
        depth > 0 && "mt-1 ml-2.5 border-l border-border/70 pl-2.5",
      )}
    >
      {nodes.map((node, i) => {
        if (isSeparator(node)) {
          return (
            <li
              key={`sep-${i}-${nodeName(node)}`}
              className="mt-5 mb-1.5 px-2.5 font-mono text-[0.625rem] font-medium uppercase tracking-[0.16em] text-muted-foreground first:mt-0"
            >
              {nodeName(node)}
            </li>
          );
        }

        if (isFolder(node)) {
          const folderUrl = node.index?.url;
          const childActive = node.children.some(
            (c) => isPage(c) && (pathname === c.url || pathname.startsWith(`${c.url}/`)),
          );
          const active = (folderUrl != null && pathname === folderUrl) || childActive;
          return (
            <li key={`folder-${nodeName(node)}-${i}`} className="flex flex-col gap-0.5">
              {folderUrl ? (
                <Link to={folderUrl} className={linkClass(pathname === folderUrl, depth)}>
                  {nodeName(node)}
                </Link>
              ) : (
                <div
                  className={cn(
                    "px-2.5 py-1.5 text-[0.8125rem] font-medium text-foreground",
                    active && "text-foreground",
                  )}
                >
                  {nodeName(node)}
                </div>
              )}
              <DocsTreeNodes nodes={node.children} depth={depth + 1} />
            </li>
          );
        }

        if (isPage(node)) {
          const active = pathname === node.url;
          return (
            <li key={node.url}>
              <Link to={node.url} className={linkClass(active, depth)} aria-current={active ? "page" : undefined}>
                {nodeName(node)}
              </Link>
            </li>
          );
        }

        return null;
      })}
    </ul>
  );
}

/** Sticky under ShowcaseTopBar (~h-12 / py-3 + control). */
const DOCS_STICKY_TOP = "top-12";
const DOCS_STICKY_HEIGHT = "h-[calc(100dvh-3rem)]";

export function DocsSidebar({ className }: { className?: string }) {
  const tree = source.getPageTree();
  const title = typeof tree.name === "string" ? tree.name : "nqlib Docs";

  return (
    <nav
      aria-label="Docs"
      className={cn(
        // Keep `flex` in the caller too (`hidden xl:flex`) — `xl:block` drops flex via tw-merge.
        "sticky z-[var(--z-sticky-content)] flex w-56 shrink-0 flex-col self-start overflow-hidden",
        DOCS_STICKY_TOP,
        DOCS_STICKY_HEIGHT,
        className,
      )}
    >
      <p className="mb-3 shrink-0 truncate px-2.5 text-sm font-semibold tracking-tight text-foreground">
        {title}
      </p>
      <ScrollArea
        fadeMask={false}
        className="relative min-h-0 w-full flex-1 overflow-hidden"
        viewportStyle={{ position: "absolute", inset: 0, minHeight: 0 }}
      >
        <div className="pb-6 pr-2">
          <DocsTreeNodes nodes={tree.children} />
        </div>
      </ScrollArea>
    </nav>
  );
}

export function DocsSidebarMobile(): ReactNode {
  return (
    <DocsSidebar
      className={cn(
        "relative top-0 mb-8 flex h-64 max-h-64 w-full overflow-hidden xl:hidden",
      )}
    />
  );
}
