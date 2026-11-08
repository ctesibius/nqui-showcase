/**
 * Live nqui examples embedded in the app-builder guide at `/docs/nqui`.
 *
 * Teaching aids only — one rule per embed. Full variants live on `/catalog`.
 */
import { lazy, type ComponentType } from "react";

export interface NquiExampleEntry {
  id: string;
  /** The rule the example shows, in a few words. */
  title: string;
  /** Exports it uses — the tray's mono import line. */
  imports: string;
  height: string;
  /** Catalog section hash for “Open in catalog”. */
  catalogHash: string;
  load: () => Promise<{ default: ComponentType }>;
}

export const NQUI_DOC_EXAMPLES: NquiExampleEntry[] = [
  {
    id: "actions-selection",
    title: "Toolbar choice or form choice",
    imports: "ToggleGroup, RadioGroup",
    height: "h-[280px]",
    catalogHash: "buttons-actions",
    load: () => import("./ex-actions-selection"),
  },
  {
    id: "forms-field",
    title: "Fields that line up",
    imports: "FieldGroup, Field, InputGroup",
    height: "h-[240px]",
    catalogHash: "form-components",
    load: () => import("./ex-forms-field"),
  },
  {
    id: "layout-surfaces",
    title: "Content card or quiet panel",
    imports: "Card",
    height: "h-[300px]",
    catalogHash: "layout-components",
    load: () => import("./ex-layout-surfaces"),
  },
  {
    id: "overlays-pick",
    title: "Pick the overlay by the job",
    imports: "Dialog, Sheet, AlertDialog",
    height: "h-20",
    catalogHash: "overlays-dialogs",
    load: () => import("./ex-overlays-pick"),
  },
  {
    id: "feedback-states",
    title: "Empty and loading",
    imports: "Empty, Skeleton",
    height: "h-[320px]",
    catalogHash: "display-components",
    load: () => import("./ex-feedback-states"),
  },
  {
    id: "theming-tokens",
    title: "Variants, not new colours",
    imports: "Button, Badge",
    height: "h-[240px]",
    catalogHash: "buttons-actions",
    load: () => import("./ex-theming-tokens"),
  },
];

const byId = new Map(NQUI_DOC_EXAMPLES.map((e) => [e.id, e]));

export function resolveNquiExample(id?: string): NquiExampleEntry | undefined {
  return id ? byId.get(id) : undefined;
}

const cache = new Map<string, ComponentType>();

export function lazyNquiExample(entry: NquiExampleEntry): ComponentType {
  const hit = cache.get(entry.id);
  if (hit) return hit;
  const Comp = lazy(entry.load);
  cache.set(entry.id, Comp);
  return Comp;
}
