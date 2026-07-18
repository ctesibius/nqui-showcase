/** nqui catalog navigation — SSOT for sidebar, hub, and command palette. */

export type ShowcaseRoute = {
  title: string
  path: string
  description: string
}

export type RecipeEntry = ShowcaseRoute & {
  teaches: string
}

/** Recipes hub (marketing `/` stays the landing page). */
export const NQUI_HUB_PATH = "/nqui"

export const recipeEntries: RecipeEntry[] = [
  {
    title: "Commerce dashboard",
    path: "/patterns",
    description: "Dense product UI — tables, menus, overlays, and workspace chrome.",
    teaches: "Page hierarchy, ≤3 surfaces, composed patterns (not a card per control).",
  },
  {
    title: "Workspace settings",
    path: "/recipes/settings",
    description: "Settings form with FieldSet, FieldGroup, and realistic field types.",
    teaches: "Forms without a card grid — one topic, clear save/cancel.",
  },
  {
    title: "Sprint tracker",
    path: "/recipes/tracker",
    description: "Issue tracker with master-detail split, Tracker build history, and toolbar filtering.",
    teaches: "Resizable panels, ToggleGroup in toolbar context, Tracker in product UI, Empty + Skeleton states.",
  },
  {
    title: "Elevation philosophy",
    path: "/recipes/elevation",
    description: "The 2+1 surface hybrid rule — rendered with live nqui tokens. Cap inline nesting at 2, let spacing do the rest.",
    teaches: "Surface tokens, anti-nested-card pattern, when to use continuous vs alternating vs hybrid.",
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

/** Primary sidebar destinations */
export const showcaseRoutes: ShowcaseRoute[] = [
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

export const showcaseCatalogSections: ShowcaseSection[] = [
  { title: "Buttons & Actions", path: "/catalog", hash: "buttons-actions" },
  { title: "Form Components", path: "/catalog", hash: "form-components" },
  { title: "Display Components", path: "/catalog", hash: "display-components" },
  { title: "Navigation & Menus", path: "/catalog", hash: "navigation-menus" },
  { title: "Overlays & Dialogs", path: "/catalog", hash: "overlays-dialogs" },
  { title: "Data Visualization", path: "/catalog", hash: "data-visualization" },
  { title: "Layout Components", path: "/catalog", hash: "layout-components" },
  { title: "Advanced Components", path: "/catalog", hash: "advanced-components" },
]

export const showcasePatternSections: ShowcaseSection[] = [
  { title: "Overview", path: "/patterns", hash: "overview" },
  { title: "Workspace", path: "/patterns", hash: "workspace" },
  { title: "Operations", path: "/patterns", hash: "operations" },
  { title: "Patterns & menus", path: "/patterns", hash: "patterns" },
  { title: "Preferences", path: "/patterns", hash: "preferences" },
]

const routeLabels: Record<string, string> = {
  [NQUI_HUB_PATH]: "Recipes",
  "/patterns": "Commerce dashboard",
  "/recipes/settings": "Workspace settings",
  "/recipes/tracker": "Sprint tracker",
  "/recipes/elevation": "Elevation philosophy",
  "/catalog": "Component catalog",
  "/design-system": "Design system",
}

export function showcaseRouteLabel(pathname: string): string {
  return routeLabels[pathname] ?? "nqui catalog"
}

export function showcaseSectionsForPath(pathname: string): ShowcaseSection[] {
  if (pathname === "/catalog") return showcaseCatalogSections
  if (pathname === "/patterns") return showcasePatternSections
  return []
}
