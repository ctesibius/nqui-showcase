import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@nqlib/nqui";
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

function DocsTreeNodes({ nodes, depth = 0 }: { nodes: PageTree.Node[]; depth?: number }) {
  const { pathname } = useLocation();

  return (
    <ul className={cn("flex flex-col gap-0.5", depth > 0 && "mt-1 border-l border-border pl-3")}>
      {nodes.map((node, i) => {
        if (isSeparator(node)) {
          return (
            <li
              key={`sep-${i}-${nodeName(node)}`}
              className="mt-4 mb-1 px-2 text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground first:mt-0"
            >
              {nodeName(node)}
            </li>
          );
        }

        if (isFolder(node)) {
          const folderUrl = node.index?.url;
          const active =
            (folderUrl && pathname === folderUrl) ||
            node.children.some(
              (c) => isPage(c) && (pathname === c.url || pathname.startsWith(`${c.url}/`)),
            );
          return (
            <li key={`folder-${nodeName(node)}-${i}`}>
              {folderUrl ? (
                <Link
                  to={folderUrl}
                  className={cn(
                    "block rounded-md px-2 py-1.5 text-sm transition-colors",
                    active
                      ? "bg-muted font-medium text-foreground"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                  )}
                >
                  {nodeName(node)}
                </Link>
              ) : (
                <div className="px-2 py-1.5 text-sm font-medium text-foreground">
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
              <Link
                to={node.url}
                className={cn(
                  "block rounded-md px-2 py-1.5 text-sm transition-colors",
                  active
                    ? "bg-muted font-medium text-foreground"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                )}
              >
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

export function DocsSidebar({ className }: { className?: string }) {
  const tree = source.getPageTree();

  return (
    <nav
      aria-label="Docs"
      className={cn(
        "sticky top-24 max-h-[calc(100dvh-8rem)] w-56 shrink-0 overflow-y-auto pr-2",
        className,
      )}
    >
      <DocsTreeNodes nodes={tree.children} />
    </nav>
  );
}

export function DocsSidebarMobile(): ReactNode {
  return <DocsSidebar className="mb-8 w-full max-h-none xl:hidden" />;
}
