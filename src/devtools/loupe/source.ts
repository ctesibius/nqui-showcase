/**
 * Where an element comes from: its React component and the line of source that
 * rendered it. Loupe shows it on the card and copies it for an agent, in
 * the format React Grab used (`<a …>Text</a> in LoginForm (at src/…/login-form.tsx:46:19)`).
 *
 * React 19 has no `_debugSource`. In development it keeps two things on a fiber:
 *
 * - `_debugOwner`: the fiber of the component that rendered the element;
 * - `_debugStack`: an `Error` captured when the JSX ran. Its first frame under `src/`
 *   is the line that wrote the element, in the module Vite served.
 *
 * Vite serves each module with an inline source map, so `resolveSource` maps that frame
 * back to the line in the `.tsx` file. Development builds only: a release build has
 * neither field, and the overlay is not in it.
 */

export interface StackFrame {
  /** The module URL without its query (`http://localhost:5180/src/a/b.tsx`). */
  url: string;
  /** 1-based, as the browser prints them. */
  line: number;
  column: number;
}

export interface SourceLocation {
  /** Relative to the frontend root: `src/features/x/y.tsx`. */
  file: string;
  /** 1-based. */
  line: number;
  column: number;
}

/** The first frame of a JSX debug stack that is app code (under `/src/`). */
export function firstAppFrame(stack: string): StackFrame | null {
  for (const raw of stack.split("\n")) {
    const m =
      /(https?:\/\/[^\s)]+?\/src\/[^\s)?]+)(?:\?[^\s):]*)?:(\d+):(\d+)/.exec(
        raw,
      );
    if (m) return { url: m[1], line: Number(m[2]), column: Number(m[3]) };
  }
  return null;
}

/** `http://host/src/a/b.tsx` → `src/a/b.tsx`. */
export function fileOfUrl(url: string): string {
  const i = url.indexOf("/src/");
  return i >= 0 ? url.slice(i + 1) : url;
}

const B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

/** Decode one Base64 VLQ segment of a source map into its numbers. */
export function decodeVlq(segment: string): number[] {
  const out: number[] = [];
  let value = 0;
  let shift = 0;
  for (const ch of segment) {
    const digit = B64.indexOf(ch);
    if (digit < 0) throw new Error(`Not a VLQ digit: ${ch}`);
    value += (digit & 31) << shift;
    if (digit & 32) {
      shift += 5;
    } else {
      out.push(value & 1 ? -(value >>> 1) : value >>> 1);
      value = 0;
      shift = 0;
    }
  }
  return out;
}

/**
 * The original position of a generated position, from a source map's `mappings`.
 * `line` and `column` are 1-based in and out, as in a stack frame.
 */
export function originalPosition(
  mappings: string,
  line: number,
  column: number,
): { source: number; line: number; column: number } | null {
  const lines = mappings.split(";");
  // The source, line and column fields are deltas across the whole map, so every line
  // up to the target is decoded.
  let source = 0;
  let srcLine = 0;
  let srcCol = 0;
  for (let l = 0; l < lines.length && l < line; l += 1) {
    let genCol = 0;
    let best: { source: number; line: number; column: number } | null = null;
    for (const seg of lines[l].split(",")) {
      if (!seg) continue;
      const v = decodeVlq(seg);
      genCol += v[0];
      if (v.length >= 4) {
        source += v[1];
        srcLine += v[2];
        srcCol += v[3];
        if (l === line - 1 && genCol <= column - 1) {
          best = { source, line: srcLine + 1, column: srcCol + 1 };
        }
      }
    }
    if (l === line - 1) return best;
  }
  return null;
}

/** The inline source map of a module served by Vite, or null. */
export function inlineSourceMap(
  code: string,
): { sources: string[]; mappings: string } | null {
  const m =
    /\/\/# sourceMappingURL=data:application\/json;(?:charset=utf-8;)?base64,([A-Za-z0-9+/=]+)\s*$/.exec(
      code,
    );
  if (!m) return null;
  try {
    const json = JSON.parse(atob(m[1])) as {
      sources?: string[];
      mappings?: string;
    };
    if (!json.mappings) return null;
    return { sources: json.sources ?? [], mappings: json.mappings };
  } catch {
    return null;
  }
}

const mapCache = new Map<
  string,
  Promise<{ sources: string[]; mappings: string } | null>
>();

/** Map a stack frame back to the line in the source file. Falls back to the frame. */
export async function resolveSource(
  frame: StackFrame,
): Promise<SourceLocation> {
  const fallback = {
    file: fileOfUrl(frame.url),
    line: frame.line,
    column: frame.column,
  };
  let map = mapCache.get(frame.url);
  if (!map) {
    map = fetch(frame.url)
      .then((res) => (res.ok ? res.text() : ""))
      .then(inlineSourceMap)
      .catch(() => null);
    mapCache.set(frame.url, map);
  }
  const sm = await map;
  if (!sm) return fallback;
  const pos = originalPosition(sm.mappings, frame.line, frame.column);
  if (!pos) return fallback;
  return { file: fallback.file, line: pos.line, column: pos.column };
}

interface FiberLike {
  type?: unknown;
  return?: FiberLike | null;
  _debugOwner?: FiberLike | null;
  _debugStack?: { stack?: string } | null;
}

/** The React fiber of an element, or of its nearest ancestor that has one. */
export function fiberOf(el: Element): FiberLike | null {
  for (let node: Element | null = el; node; node = node.parentElement) {
    const key = Object.keys(node).find((k) => k.startsWith("__reactFiber$"));
    if (key) return (node as unknown as Record<string, FiberLike>)[key];
  }
  return null;
}

function nameOf(type: unknown): string | null {
  if (typeof type === "function") {
    const t = type as { displayName?: string; name?: string };
    return t.displayName || t.name || null;
  }
  if (type && typeof type === "object") {
    // memo() and forwardRef() wrap the component.
    const t = type as {
      displayName?: string;
      type?: unknown;
      render?: unknown;
    };
    return t.displayName || nameOf(t.type) || nameOf(t.render);
  }
  return null;
}

export interface ElementSource {
  /** The component that rendered the element, then its owners, nearest first. */
  components: string[];
  frame: StackFrame | null;
}

/** The owner chain and the JSX frame of an element. */
export function elementSource(el: Element): ElementSource | null {
  const fiber = fiberOf(el);
  if (!fiber) return null;
  const components: string[] = [];
  for (
    let owner = fiber._debugOwner;
    owner && components.length < 4;
    owner = owner._debugOwner
  ) {
    const name = nameOf(owner.type);
    if (name && !components.includes(name)) components.push(name);
  }
  const stack = fiber._debugStack?.stack;
  return { components, frame: stack ? firstAppFrame(stack) : null };
}

const KEPT_ATTRIBUTES = [
  "class",
  "role",
  "aria-label",
  "href",
  "data-slot",
  "type",
  "name",
];

/** A short HTML snippet of the element: its tag, a few attributes and its text. */
export function elementSnippet(el: Element, maxText = 60): string {
  const tag = el.tagName.toLowerCase();
  const attrs = KEPT_ATTRIBUTES.flatMap((name) => {
    const value = el.getAttribute(name);
    if (value === null) return [];
    const v = value.length > 120 ? `${value.slice(0, 117)}...` : value;
    return [`${name}="${v.replace(/"/g, "&quot;")}"`];
  });
  const text = (el.textContent ?? "").replace(/\s+/g, " ").trim();
  const shown =
    text.length > maxText ? `${text.slice(0, maxText - 3)}...` : text;
  const open = `<${tag}${attrs.length ? ` ${attrs.join(" ")}` : ""}>`;
  return `${open}${shown}</${tag}>`;
}

/**
 * The text to paste into an agent: the element, the component that rendered it with
 * the source location, then the owners. `pathPrefix` makes the path start at the
 * repository root, e.g. `frontend/`.
 */
export function grabText(
  snippet: string,
  components: readonly string[],
  location: SourceLocation | null,
  pathPrefix = "",
): string {
  const where = location
    ? ` (at ${pathPrefix}${location.file}:${location.line}:${location.column})`
    : "";
  const [first, ...rest] = components;
  const lines = [snippet];
  if (first) lines.push(`  in ${first}${where}`);
  else if (where) lines.push(`  at${where.slice(4, -1)}`);
  for (const name of rest) lines.push(`  in ${name}`);
  return lines.join("\n");
}
