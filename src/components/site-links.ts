/*
 * Marketing nav data. Lives apart from `showcase-top-bar.tsx` so that file only
 * exports components (React fast refresh).
 */

export type ShowcaseTopBarLink = {
  to: string;
  label: string;
  /** Small pill after the label — for surfaces that aren't part of the product. */
  badge?: string;
};

/**
 * Nav entries that only exist while `pnpm dev` is running.
 *
 * `import.meta.env.DEV` is a build-time literal, so in a production bundle this
 * is `[]` and the routes it points at aren't registered either (see `App.tsx`).
 * Spread it into any page's `links` — the tab appears locally and evaporates on
 * deploy, so a dev surface can never leak into the shipped nav.
 */
export const devTopBarLinks: ReadonlyArray<ShowcaseTopBarLink> =
  import.meta.env.DEV
    ? [
        { to: "/gantt-lab", label: "Gantt lab", badge: "dev" },
        { to: "/grid-lab", label: "Grid lab", badge: "dev" },
      ]
    : [];

/**
 * The one marketing nav. Every marketing page passes this as-is so a visitor
 * sees the same four destinations wherever they land; a page that needs a
 * deeper link (e.g. /charts → interaction lab) puts it in its own content.
 */
export const siteLinks: ReadonlyArray<ShowcaseTopBarLink> = [
  { to: "/blocks", label: "Blocks" },
  { to: "/charts", label: "Charts" },
  { to: "/catalog", label: "Components" },
  { to: "/docs", label: "Docs" },
  ...devTopBarLinks,
];
