/**
 * Live gantt examples embedded in the PM / PMO guide at `/docs/nqgantt`.
 *
 * These are teaching aids, not product. Each one demonstrates exactly the thing
 * its page is explaining and nothing else — a reader should be able to press one
 * button and see the point of the page happen.
 *
 * Kept small and self-contained on purpose: a doc example that depends on the
 * showcase's shared task fixture drifts the moment that fixture changes, and
 * then the prose describes a chart that no longer does what it says.
 */
import { lazy, type ComponentType } from "react";

export interface GanttExampleEntry {
  id: string;
  title: string;
  /** Rendered height. Examples with a control strip need more room. */
  height: string;
  load: () => Promise<{ default: ComponentType }>;
}

export const GANTT_DOC_EXAMPLES: GanttExampleEntry[] = [
  {
    id: "bars-basics",
    title: "Bars, progress and a milestone",
    height: "h-[460px]",
    load: () => import("./ex-bars-basics"),
  },
  {
    id: "editable-columns",
    title: "Editing in the sidebar",
    height: "h-[460px]",
    load: () => import("./ex-editable-columns"),
  },
  {
    id: "dependencies",
    title: "Link types and lag",
    height: "h-[420px]",
    load: () => import("./ex-dependencies"),
  },
  {
    id: "auto-schedule",
    title: "Strict versus flexible",
    height: "h-[470px]",
    load: () => import("./ex-auto-schedule"),
  },
  {
    id: "critical-path",
    title: "The long path through the network",
    height: "h-[500px]",
    load: () => import("./ex-critical-path"),
  },
  {
    id: "earned-value",
    title: "A baseline that stops moving",
    height: "h-[620px]",
    load: () => import("./ex-earned-value"),
  },
  {
    id: "worklog",
    title: "Actual cost from logged hours",
    height: "h-[560px]",
    load: () => import("./ex-worklog"),
  },
  {
    id: "resource-availability",
    title: "Levelling around leave",
    height: "h-[520px]",
    load: () => import("./ex-resource-availability"),
  },
  {
    id: "ms-project",
    title: "Out to XML and back",
    height: "h-[500px]",
    load: () => import("./ex-ms-project"),
  },
];

const byId = new Map(GANTT_DOC_EXAMPLES.map((e) => [e.id, e]));

export function resolveGanttExample(id?: string): GanttExampleEntry | undefined {
  return id ? byId.get(id) : undefined;
}

const cache = new Map<string, ComponentType>();

export function lazyGanttExample(entry: GanttExampleEntry): ComponentType {
  const hit = cache.get(entry.id);
  if (hit) return hit;
  const Comp = lazy(entry.load);
  cache.set(entry.id, Comp);
  return Comp;
}
