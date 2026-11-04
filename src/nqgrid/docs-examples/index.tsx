/**
 * Live pivot examples embedded in the nqgrid docs at `/docs/nqgrid/pivot-*`.
 *
 * Teaching aids, not product: each one shows exactly what its page explains.
 * They share one seeded dataset (`shared.tsx`) so the prose can point at numbers
 * that stay put. Unlike `/grid-lab`, these ship in the deployed showcase.
 */
import { lazy, type ComponentType } from "react";

export interface GridExampleEntry {
  id: string;
  title: string;
  /** Rendered height. Examples with slicers or a side panel need more room. */
  height: string;
  load: () => Promise<{ default: ComponentType }>;
}

export const GRID_DOC_EXAMPLES: GridExampleEntry[] = [
  {
    id: "pivot-basics",
    title: "Revenue by region and category, per fiscal quarter",
    height: "h-[520px]",
    load: () => import("./ex-pivot-basics"),
  },
  {
    id: "pivot-filters",
    title: "Slicers and Top N",
    height: "h-[640px]",
    load: () => import("./ex-pivot-filters"),
  },
  {
    id: "pivot-field-list",
    title: "Build the layout from the field list",
    height: "h-[900px]",
    load: () => import("./ex-pivot-field-list"),
  },
  {
    id: "pivot-show-as",
    title: "Show values as",
    height: "h-[540px]",
    load: () => import("./ex-pivot-show-as"),
  },
  {
    id: "pivot-calculated",
    title: "Calculated measure and drill-through",
    height: "h-[660px]",
    load: () => import("./ex-pivot-calculated"),
  },
];

const byId = new Map(GRID_DOC_EXAMPLES.map((e) => [e.id, e]));

export function resolveGridExample(id?: string): GridExampleEntry | undefined {
  return id ? byId.get(id) : undefined;
}

const cache = new Map<string, ComponentType>();

export function lazyGridExample(entry: GridExampleEntry): ComponentType {
  const hit = cache.get(entry.id);
  if (hit) return hit;
  const Comp = lazy(entry.load);
  cache.set(entry.id, Comp);
  return Comp;
}
