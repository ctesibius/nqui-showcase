/** nqui catalog navigation — SSOT for sidebar, hub, and command palette. */

export type ShowcaseRoute = {
  title: string
  path: string
  description: string
}

export type RecipeEntry = ShowcaseRoute & {
  teaches: string
}

/** Recipes hub (marketing `/` is the landing page). */
export const LANDING_PATH = "/"
export const NQUI_HUB_PATH = "/nqui"

/**
 * Full-page composition demos only.
 * Compact patterns (settings, toolbar, forms) live on `/blocks` — do not duplicate them here.
 */
export const recipeEntries: RecipeEntry[] = [
  {
    title: "Commerce dashboard",
    path: "/patterns",
    description: "Dense product UI — tables, menus, overlays, and workspace chrome.",
    teaches: "Page hierarchy, ≤3 surfaces, composed patterns (not a card per control).",
  },
  {
    title: "Elevation philosophy",
    path: "/recipes/elevation",
    description: "The 2+1 surface hybrid rule — rendered with live nqui tokens. Cap inline nesting at 2, let spacing do the rest.",
    teaches: "Surface tokens, anti-nested-card pattern, when to use continuous vs alternating vs hybrid.",
  },
  {
    title: "Slider lab",
    path: "/recipes/sliders",
    description: "Every Slider variant in a realistic context — settings, inspectors, filters, media, maps, scheduling, finance.",
    teaches: "Which variant fits which data: default, field, segments, ruler; log scale, origin, marks, typed values.",
  },
]

export const referenceEntries: ShowcaseRoute[] = [
  {
    title: "Component catalog",
    path: "/catalog",
    description: "All variants and states — use when you need props, not layout advice.",
  },
  {
    title: "Design system",
    path: "/design-system",
    description: "Tokens, radius, spacing, and theme surfaces.",
  },
]

/** Primary sidebar destinations — Home = landing; Recipes = composition hub. */
export const showcaseRoutes: ShowcaseRoute[] = [
  {
    title: "Home",
    path: LANDING_PATH,
    description: "Marketing landing — tour, packages, and CTAs",
  },
  {
    title: "Recipes",
    path: NQUI_HUB_PATH,
    description: "Composition recipes and how to assemble product UI",
  },
  ...recipeEntries,
  ...referenceEntries,
]

export type ShowcaseSection = {
  title: string
  path: string
  hash: string
}

export const showcasePatternSections: ShowcaseSection[] = [
  { title: "Overview", path: "/patterns", hash: "overview" },
  { title: "Workspace", path: "/patterns", hash: "workspace" },
  { title: "Operations", path: "/patterns", hash: "operations" },
  { title: "Patterns & menus", path: "/patterns", hash: "patterns" },
  { title: "Preferences", path: "/patterns", hash: "preferences" },
]

const routeLabels: Record<string, string> = {
  [LANDING_PATH]: "Home",
  [NQUI_HUB_PATH]: "Recipes",
  "/patterns": "Commerce dashboard",
  "/recipes/elevation": "Elevation philosophy",
  "/recipes/sliders": "Slider lab",
  "/catalog": "Component catalog",
  "/design-system": "Design system",
  "/command": "Command lab",
}

export function showcaseRouteLabel(pathname: string): string {
  return routeLabels[pathname] ?? "nqui catalog"
}

export function showcaseSectionsForPath(pathname: string): ShowcaseSection[] {
  if (pathname === "/patterns") return showcasePatternSections
  return []
}
