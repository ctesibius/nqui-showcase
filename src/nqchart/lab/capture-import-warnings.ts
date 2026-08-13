/**
 * Page-level spy for the 0.3.1 failure mode: ECharts logs
 * `Component X is used but not imported` / `Series X is used but not imported`
 * when a family compiles a key it never registered.
 *
 * Installed in `useLayoutEffect` so it is on before child `useEffect` inits
 * the canvas. Matches that phrase only — everything else still goes to the
 * real console.
 */

const MATCH = /is used but not imported/i;

let installed = false;
let origWarn: typeof console.warn | null = null;
let origError: typeof console.error | null = null;
const seen: string[] = [];
const listeners = new Set<(msg: string) => void>();

function textOf(args: unknown[]): string {
  return args.map((a) => (typeof a === "string" ? a : String(a))).join(" ");
}

function capture(args: unknown[]) {
  const text = textOf(args);
  if (!MATCH.test(text)) return;
  if (seen.includes(text)) return;
  seen.push(text);
  listeners.forEach((fn) => fn(text));
}

export function startImportWarningCapture() {
  seen.length = 0;
  if (installed) return;
  installed = true;
  origWarn = console.warn;
  origError = console.error;
  console.warn = ((...args: unknown[]) => {
    capture(args);
    origWarn?.apply(console, args);
  }) as typeof console.warn;
  console.error = ((...args: unknown[]) => {
    capture(args);
    origError?.apply(console, args);
  }) as typeof console.error;
}

export function stopImportWarningCapture() {
  if (!installed) return;
  if (origWarn) console.warn = origWarn;
  if (origError) console.error = origError;
  origWarn = null;
  origError = null;
  installed = false;
}

export function subscribeImportWarnings(fn: (msg: string) => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function snapshotImportWarnings(): string[] {
  return [...seen];
}
