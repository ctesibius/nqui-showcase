import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import { PanelLeftCloseIcon, PanelLeftOpenIcon } from "@hugeicons/core-free-icons";
import {
  Button,
  ScrollArea,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  cn,
} from "@nqlib/nqui";
import type * as PageTree from "fumadocs-core/page-tree";
import { docsSidebarScope, docsUrlMatches } from "@/lib/docs-nav";
import { usePinnedColumnLeft } from "./use-pinned-column-left";

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
    "block rounded-[var(--radius-sm)] px-2.5 py-1.5 text-sm leading-snug transition-colors duration-150",
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
              className="mt-5 mb-1.5 px-2.5 font-mono text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground first:mt-0"
            >
              {nodeName(node)}
            </li>
          );
        }

        if (isFolder(node)) {
          const folderUrl = node.index?.url;
          const childActive = node.children.some(
            (c) =>
              isPage(c) &&
              (docsUrlMatches(pathname, c.url) || pathname.startsWith(`${c.url}/`)),
          );
          const folderActive = folderUrl != null && docsUrlMatches(pathname, folderUrl);
          const active = folderActive || childActive;
          return (
            <li key={`folder-${nodeName(node)}-${i}`} className="flex flex-col gap-0.5">
              {folderUrl ? (
                <Link to={folderUrl} className={linkClass(folderActive, depth)}>
                  {nodeName(node)}
                </Link>
              ) : (
                <div
                  className={cn(
                    "px-2.5 py-1.5 text-sm font-medium text-foreground",
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
          const active = docsUrlMatches(pathname, node.url);
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

const STORAGE_KEY = "nqui-docs-sidebar-collapsed";

type ToggleIcon = typeof PanelLeftCloseIcon;

function SidebarChrome({
  title,
  nodes,
  onToggle,
  toggleLabel,
  toggleIcon,
}: {
  title: string;
  nodes: PageTree.Node[];
  onToggle: () => void;
  toggleLabel: string;
  toggleIcon: ToggleIcon;
}) {
  return (
    <>
      <div className="mb-3 flex shrink-0 items-center gap-1 px-1">
        <p className="min-w-0 flex-1 truncate px-1.5 text-sm font-semibold tracking-tight text-foreground">
          {title}
        </p>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0 text-muted-foreground"
              aria-label={toggleLabel}
              onClick={onToggle}
            >
              <HugeiconsIcon icon={toggleIcon} size={16} strokeWidth={2} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">{toggleLabel}</TooltipContent>
        </Tooltip>
      </div>
      <ScrollArea
        fadeMask={false}
        className="relative min-h-0 w-full flex-1 overflow-hidden"
        viewportStyle={{ position: "absolute", inset: 0, minHeight: 0 }}
      >
        <div className="pb-6 pr-2">
          <DocsTreeNodes nodes={nodes} />
        </div>
      </ScrollArea>
    </>
  );
}

export function DocsSidebar({
  className,
  collapsed,
  onCollapsedChange,
}: {
  className?: string;
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}) {
  const { pathname } = useLocation();
  const { title, nodes } = docsSidebarScope(pathname);
  const [peekOpen, setPeekOpen] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setPeekOpen(false);
  }, [pathname, collapsed]);

  useEffect(() => {
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  const openPeek = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setPeekOpen(true);
  };

  const scheduleClosePeek = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setPeekOpen(false), 160);
  };

  const { anchorRef, box } = usePinnedColumnLeft([collapsed, pathname]);

  return (
    <TooltipProvider>
      {/* In-flow spacer preserves column width; chrome is viewport-fixed. */}
      <div
        ref={anchorRef}
        className={cn("hidden shrink-0 sidebar:block", collapsed ? "w-10" : "w-56", className)}
        aria-hidden
      />
      <div
        className={cn(
          "fixed z-[var(--z-sticky-content)] hidden flex-col sidebar:flex",
          collapsed ? "w-10" : "w-56 overflow-hidden",
        )}
        style={
          box == null
            ? { visibility: "hidden" }
            : { left: box.left, top: box.top, height: box.height }
        }
        onMouseEnter={collapsed ? openPeek : undefined}
        onMouseLeave={collapsed ? scheduleClosePeek : undefined}
      >
        {collapsed ? (
          <>
            <div className="flex h-full flex-col items-center pt-0.5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground"
                    aria-label="Show docs menu"
                    aria-expanded={peekOpen}
                    onClick={() => onCollapsedChange(false)}
                    onMouseEnter={openPeek}
                    onFocus={openPeek}
                  >
                    <HugeiconsIcon icon={PanelLeftCloseIcon} size={16} strokeWidth={2} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Hover menu · click to pin</TooltipContent>
              </Tooltip>
            </div>

            <nav
              aria-label="Docs"
              data-docs-sidebar-peek={peekOpen ? "open" : "closed"}
              className={cn(
                "absolute top-0 left-0 z-[var(--z-floating)] flex h-full w-56 flex-col overflow-hidden rounded-[var(--radius-lg)] border border-border bg-background/95 p-2 shadow-(--shadow-elevated) transition-opacity duration-150",
                peekOpen
                  ? "pointer-events-auto opacity-100"
                  : "pointer-events-none opacity-0",
              )}
              onMouseEnter={openPeek}
              onMouseLeave={scheduleClosePeek}
            >
              <SidebarChrome
                title={title}
                nodes={nodes}
                onToggle={() => onCollapsedChange(false)}
                toggleLabel="Exit max view"
                toggleIcon={PanelLeftCloseIcon}
              />
            </nav>
          </>
        ) : (
          <nav aria-label="Docs" className="flex h-full min-h-0 flex-col overflow-hidden">
            <SidebarChrome
              title={title}
              nodes={nodes}
              onToggle={() => onCollapsedChange(true)}
              toggleLabel="Max view"
              toggleIcon={PanelLeftOpenIcon}
            />
          </nav>
        )}
      </div>
    </TooltipProvider>
  );
}

export function useDocsSidebarCollapsed(): [boolean, (collapsed: boolean) => void] {
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return window.localStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      return false;
    }
  });

  const setCollapsedPersist = (next: boolean) => {
    setCollapsed(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
    } catch {
      /* ignore quota / private mode */
    }
  };

  return [collapsed, setCollapsedPersist];
}
