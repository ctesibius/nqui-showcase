import { useEffect } from "react";
import { showcaseRouteLabel } from "@/components/showcase/config/showcase-nav";

/** Landing title — also the static `<title>` in index.html. */
export const SITE_TITLE = "nqlib — the product interface stack";

/** Marketing routes, named for what a visitor came to see. */
const MARKETING_TITLES: Record<string, string> = {
  "/": SITE_TITLE,
  "/blocks": "Blocks · nqlib",
  "/charts": "Charts · nqchart",
  "/charts/lab": "Interaction lab · nqchart",
  "/gantt-lab": "Gantt lab · dev",
  "/grid-lab": "Grid lab · dev",
};

/** Operate-chrome routes (sidebar shell) — labels come from the sidebar nav. */
const OPERATE_ROUTES = new Set([
  "/nqui",
  "/catalog",
  "/patterns",
  "/recipes/elevation",
  "/recipes/sliders",
  "/design-system",
  "/command",
]);

/**
 * Title for a pathname, or `null` when the page sets its own (docs read their
 * frontmatter title, which a route table can't know).
 */
export function titleForPath(pathname: string): string | null {
  if (pathname === "/docs" || pathname.startsWith("/docs/")) return null;
  const marketing = MARKETING_TITLES[pathname];
  if (marketing) return marketing;
  if (OPERATE_ROUTES.has(pathname)) return `${showcaseRouteLabel(pathname)} · nqui`;
  return SITE_TITLE;
}

export function useDocumentTitle(title: string | null | undefined) {
  useEffect(() => {
    if (title) document.title = title;
  }, [title]);
}
