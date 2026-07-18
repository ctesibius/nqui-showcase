import { NQCHART_CATALOG, type CatalogEntry } from "./manifest";
import { DOCS_EXTRA_CATALOG } from "./docs-extra-entries";

const BY_ID = new Map<string, CatalogEntry>(
  [...NQCHART_CATALOG, ...DOCS_EXTRA_CATALOG].map((e) => [e.id, e]),
);

/** Resolve an MDX `<ComponentPreview name>` to a catalog entry (includes docs-only bg/tooltip). */
export function resolveDocsCatalogEntry(name: string | undefined): CatalogEntry | undefined {
  if (!name) return undefined;
  return BY_ID.get(name);
}

export function listDocsCatalogIds(): string[] {
  return [...BY_ID.keys()].sort();
}
