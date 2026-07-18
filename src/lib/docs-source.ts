import { loader } from "fumadocs-core/source";
import { docs } from "collections/server";

/**
 * Fumadocs content loader for the showcase docs hub.
 * Page tree + getPage come from fumadocs-mdx generated collections.
 */
export const source = loader({
  baseUrl: "/docs",
  source: docs.toFumadocsSource(),
});

export type DocsPage = NonNullable<ReturnType<typeof source.getPage>>;
