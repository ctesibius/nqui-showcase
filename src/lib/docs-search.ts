import { createFromSource } from "fumadocs-core/search/server";
import { source } from "./docs-source";

/**
 * Orama-backed search over the docs page tree (titles + structured content).
 * Runs client-side in the Vite SPA via fumadocs-core createFromSource.
 */
export const docsSearch = createFromSource(source);
