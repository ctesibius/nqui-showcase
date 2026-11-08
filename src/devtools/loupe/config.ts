/**
 * The configuration of Loupe. The host app passes it to `<Loupe config={…} />`; the
 * engine reads it through `config()`. Loupe holds no scale of its own: every scale it
 * checks comes from here, so the same engine works in another app with that app's
 * tokens.
 */
import { parseTypeRoles, type TypeRole } from "./scale";

export interface LoupeConfig {
  /**
   * CSS text that defines the type roles as `--text-<role>: <size>`, with an optional
   * `--text-<role>--line-height` and `--text-<role>--font-weight`. In Vite, import the
   * file with `?raw`.
   */
  typeCss?: string;
  /**
   * CSS text that defines the colour tokens (`--name: oklch(…)`, `rgb(…)`, `hsl(…)` or
   * `#…`). The card names a colour by its token.
   */
  tokenCss?: string;
  /** The spacing steps in px. 0 is always allowed. */
  spacingSteps?: readonly number[];
  /** Every line height should be a multiple of this. Default 4. */
  gridPx?: number;
  /** The height of one chrome band, drawn on the grid. Default 40. */
  bandPx?: number;
  /** The radius tokens, resolved by the browser in the current theme. */
  radiusTokens?: readonly string[];
  /** A margin larger than this is not checked: it is usually `auto`. Default 48. */
  marginLimitPx?: number;
  /** How to tell the person that a copy worked or failed. Default: the console. */
  notify?: { success(message: string): void; error(message: string): void };
  /** The localStorage key that keeps measuring on across reloads. */
  storageKey?: string;
  /**
   * The dev-server endpoint that opens a file in the editor (`?file=path:line:col`).
   * Vite serves `/__open-in-editor`. Null hides Open in editor.
   */
  editorEndpoint?: string | null;
  /** Put before each source path in the copied text, e.g. `frontend/`. */
  pathPrefix?: string;
}

export interface ResolvedConfig {
  typeRoles: readonly TypeRole[];
  colorTokenNames: readonly string[];
  spacingSteps: readonly number[];
  gridPx: number;
  bandPx: number;
  radiusTokens: readonly string[];
  marginLimitPx: number;
  notify: { success(message: string): void; error(message: string): void };
  storageKey: string;
  editorEndpoint: string | null;
  pathPrefix: string;
}

/** The radius token names of Tailwind 4 and shadcn. */
const DEFAULT_RADIUS_TOKENS = [
  "--radius-xs",
  "--radius-sm",
  "--radius-md",
  "--radius-lg",
  "--radius-xl",
  "--radius-2xl",
];

/** The custom properties of a CSS text whose value is a colour. */
export function colorTokenNames(css: string): string[] {
  const re = /(--[a-z][a-z0-9-]*):\s*(?:oklch|oklab|rgba?|hsla?|#)/g;
  return [...new Set([...css.matchAll(re)].map((m) => m[1]))];
}

export function resolveConfig(c: LoupeConfig): ResolvedConfig {
  return {
    typeRoles: parseTypeRoles(c.typeCss ?? ""),
    colorTokenNames: colorTokenNames(c.tokenCss ?? ""),
    spacingSteps: c.spacingSteps ?? [2, 4, 6, 8, 12, 16, 24, 32, 48],
    gridPx: c.gridPx ?? 4,
    bandPx: c.bandPx ?? 40,
    radiusTokens: c.radiusTokens ?? DEFAULT_RADIUS_TOKENS,
    marginLimitPx: c.marginLimitPx ?? 48,
    notify: c.notify ?? {
      success: (m) => console.info(`[loupe] ${m}`),
      error: (m) => console.warn(`[loupe] ${m}`),
    },
    storageKey: c.storageKey ?? "loupe",
    editorEndpoint:
      c.editorEndpoint === undefined ? "/__open-in-editor" : c.editorEndpoint,
    pathPrefix: c.pathPrefix ?? "",
  };
}

let current: ResolvedConfig = resolveConfig({});
let source: LoupeConfig | null = null;

/** Set the configuration. A second call with the same object does nothing. */
export function configure(c: LoupeConfig): void {
  if (c === source) return;
  source = c;
  current = resolveConfig(c);
}

/** The configuration in force. */
export function config(): ResolvedConfig {
  return current;
}
