/**
 * Catalog index — how `/catalog`'s rail knows what is on the page.
 *
 * The catalog is hand-written JSX (every specimen is a real composition, not a
 * config row), so the page can't list its specimens up front. Instead each
 * `CatalogSpecimen` registers itself while it is shown; the rail reads the
 * index for per-section counts and the entries under the active section, and
 * the search query flows down so non-matching specimens render nothing.
 */
import { createContext, isValidElement, useSyncExternalStore, type ReactNode } from "react"

export type CatalogIndexEntry = { id: string; title: string; sectionId: string }

export class CatalogIndex {
  private entries = new Map<string, CatalogIndexEntry>()
  /** First-seen order — the initial, unfiltered mount is document order. */
  private order = new Map<string, number>()
  private listeners = new Set<() => void>()
  private snapshot: CatalogIndexEntry[] = []
  private pending = false

  register(entry: CatalogIndexEntry) {
    if (!this.order.has(entry.id)) this.order.set(entry.id, this.order.size)
    this.entries.set(entry.id, entry)
    this.changed()
    return () => {
      if (this.entries.get(entry.id) === entry) {
        this.entries.delete(entry.id)
        this.changed()
      }
    }
  }

  subscribe = (listener: () => void) => {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  getSnapshot = () => this.snapshot

  /** Every specimen that has ever registered — the unfiltered total. */
  get seen() {
    return this.order.size
  }

  /** Batch a mount's worth of registrations into one rail render. */
  private changed() {
    if (this.pending) return
    this.pending = true
    queueMicrotask(() => {
      this.pending = false
      this.snapshot = [...this.entries.values()].sort(
        (a, b) => (this.order.get(a.id) ?? 0) - (this.order.get(b.id) ?? 0),
      )
      for (const l of this.listeners) l()
    })
  }
}

export function useCatalogEntries(index: CatalogIndex) {
  return useSyncExternalStore(index.subscribe, index.getSnapshot, index.getSnapshot)
}

export const CatalogIndexContext = createContext<CatalogIndex | null>(null)
export const CatalogQueryContext = createContext("")
export const CatalogSectionContext = createContext<{ id: string; title: string } | null>(null)

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")

export function catalogSpecimenId(sectionId: string | undefined, title: string) {
  return `${sectionId ?? "catalog"}--${slug(title)}`
}

/** Text content of a description node — strings, numbers and nested elements. */
function textOf(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return ""
  if (typeof node === "string" || typeof node === "number") return String(node)
  if (Array.isArray(node)) return node.map(textOf).join(" ")
  if (isValidElement<{ children?: ReactNode }>(node)) return textOf(node.props.children)
  return ""
}

/** Every query word must appear in the title, description or keywords. */
export function specimenMatches(
  query: string,
  title: string,
  description?: ReactNode,
  keywords?: string,
) {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
  if (words.length === 0) return true
  const hay = `${title} ${textOf(description)} ${keywords ?? ""}`.toLowerCase()
  return words.every((w) => hay.includes(w))
}
