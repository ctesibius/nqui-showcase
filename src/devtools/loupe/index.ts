/**
 * Loupe — the public API. Import only from this file.
 *
 * <Loupe config={LOUPE_CONFIG} /> mounts the overlay. Mount it behind
 * `import.meta.env.DEV`. See README.md for the configuration and for how to copy the
 * folder into another app.
 */
export { Loupe } from "./loupe";
export type { LoupeConfig } from "./config";
export {
  elementSnippet,
  elementSource,
  grabText,
  resolveSource,
  type SourceLocation,
} from "./source";
