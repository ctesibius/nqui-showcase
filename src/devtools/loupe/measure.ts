/**
 * Read the spec of one element from the live DOM: its box, its spacing, its corners,
 * its type and its colours, each checked against the scales in `config()`.
 *
 * The radius steps and the colour tokens are read as the browser resolves them in the
 * current theme, so a theme change needs no new configuration.
 */
import { config } from "./config";
import {
  contrastRatio,
  isOnGrid,
  isRadiusStep,
  isSpacingStep,
  isTypeSize,
  matchTypeRoles,
  over,
  requiredContrast,
  type Rgb,
} from "./scale";

export interface Sides {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface Check {
  ok: boolean;
  /** Why the value is off the scale, for the info card. */
  note?: string;
}

export interface Gap {
  /** The space between two children, in viewport coordinates. */
  rect: DOMRect;
  px: number;
  ok: boolean;
}

export interface TextSpec {
  sizePx: number;
  lineHeightPx: number | null;
  weight: number;
  /** The matching role tokens, best first; empty when the size is off the scale. */
  roles: string[];
  size: Check;
  lineHeight: Check;
  color: string;
  colorToken: string | null;
  background: string;
  backgroundToken: string | null;
  contrast: number | null;
  contrastCheck: Check;
}

export interface Spec {
  el: Element;
  label: string;
  rect: DOMRect;
  padding: Sides;
  margin: Sides;
  paddingOk: Check;
  marginOk: Check;
  gaps: Gap[];
  radius: { tl: number; tr: number; br: number; bl: number };
  radiusOk: Check;
  /** Null when the element holds no text of its own. */
  text: TextSpec | null;
}

function num(value: string): number {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

function sides(style: CSSStyleDeclaration, prop: "padding" | "margin"): Sides {
  return {
    top: num(style.getPropertyValue(`${prop}-top`)),
    right: num(style.getPropertyValue(`${prop}-right`)),
    bottom: num(style.getPropertyValue(`${prop}-bottom`)),
    left: num(style.getPropertyValue(`${prop}-left`)),
  };
}

function checkSides(s: Sides, what: string, limit = Infinity): Check {
  const off = Object.values(s).filter(
    (v) => Math.abs(v) <= limit && !isSpacingStep(v, config().spacingSteps),
  );
  if (off.length === 0) return { ok: true };
  const values = [
    ...new Set(off.map((v) => Math.round(Math.abs(v) * 10) / 10)),
  ];
  return {
    ok: false,
    note: `${what} ${values.join(", ")}px is off the 4px scale`,
  };
}

/** A short name for the element: its tag, its slot or role, and its first class. */
function describe(el: Element): string {
  const slot = el.getAttribute("data-slot");
  const role = el.getAttribute("role");
  const tag = el.tagName.toLowerCase();
  const extra = slot ? `[${slot}]` : role ? `[role=${role}]` : "";
  return `${tag}${extra}`;
}

/** One probe element, reused, to let the browser resolve a token. */
let probe: HTMLDivElement | null = null;
function getProbe(): HTMLDivElement {
  if (probe && probe.isConnected) return probe;
  probe = document.createElement("div");
  probe.setAttribute("aria-hidden", "true");
  probe.style.cssText =
    "position:fixed;left:-9999px;top:0;width:1px;height:1px;pointer-events:none";
  document.body.appendChild(probe);
  return probe;
}

/** The radius steps as the browser resolves them in the current theme. */
export function radiusSteps(): number[] {
  const p = getProbe();
  const out = new Set<number>();
  for (const token of config().radiusTokens) {
    p.style.borderTopLeftRadius = `var(${token})`;
    const v = num(getComputedStyle(p).borderTopLeftRadius);
    if (v > 0) out.add(Math.round(v * 10) / 10);
  }
  p.style.borderTopLeftRadius = "";
  return [...out].sort((a, b) => a - b);
}

/** The colour tokens of the current theme, by computed value and by sRGB. */
export interface ColorTokens {
  exact: Map<string, string>;
  rgb: Array<{ token: string; rgb: Rgb }>;
}

export function colorTokens(): ColorTokens {
  const p = getProbe();
  const exact = new Map<string, string>();
  const rgb: ColorTokens["rgb"] = [];
  for (const token of config().colorTokenNames) {
    p.style.color = `var(${token})`;
    const value = getComputedStyle(p).color;
    if (!value) continue;
    if (!exact.has(value)) exact.set(value, token);
    const rgba = toRgba(value);
    if (rgba && rgba[3] >= 1)
      rgb.push({ token, rgb: [rgba[0], rgba[1], rgba[2]] });
  }
  p.style.color = "";
  return { exact, rgb };
}

/**
 * The token name of a colour: the token itself, or "<token> at 80%" for a token with
 * alpha (`text-foreground/80`). Null when no token matches.
 */
export function nameColor(color: string, tokens: ColorTokens): string | null {
  const hit = tokens.exact.get(color);
  if (hit) return hit;
  const rgba = toRgba(color);
  if (!rgba || rgba[3] >= 1 || rgba[3] === 0) return null;
  const near = tokens.rgb.find(
    (t) =>
      Math.abs(t.rgb[0] - rgba[0]) <= 4 &&
      Math.abs(t.rgb[1] - rgba[1]) <= 4 &&
      Math.abs(t.rgb[2] - rgba[2]) <= 4,
  );
  return near ? `${near.token} at ${Math.round(rgba[3] * 100)}%` : null;
}

/** Any CSS colour to sRGB 0–255 with alpha 0–1, through a 1×1 canvas. */
let ctx: CanvasRenderingContext2D | null = null;
function toRgba(color: string): [number, number, number, number] | null {
  if (!ctx) {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    ctx = canvas.getContext("2d", { willReadFrequently: true });
  }
  if (!ctx) return null;
  ctx.clearRect(0, 0, 1, 1);
  ctx.fillStyle = "#000";
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
  return [r, g, b, a / 255];
}

/** The opaque colour behind an element: its own background composited up the tree. */
function backdrop(el: Element): { color: string; rgb: Rgb } {
  const layers: [number, number, number, number][] = [];
  let first = "";
  for (let node: Element | null = el; node; node = node.parentElement) {
    const bg = getComputedStyle(node).backgroundColor;
    const rgba = toRgba(bg);
    if (!rgba || rgba[3] === 0) continue;
    if (!first) first = bg;
    layers.push(rgba);
    if (rgba[3] >= 1) break;
  }
  let rgb: Rgb = [255, 255, 255];
  for (let i = layers.length - 1; i >= 0; i -= 1) rgb = over(layers[i], rgb);
  return { color: first || "transparent", rgb };
}

function hasOwnText(el: Element): boolean {
  for (const node of el.childNodes) {
    if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim())
      return true;
  }
  return false;
}

/** The space between consecutive children of a flex or grid container. */
function childGaps(el: Element, style: CSSStyleDeclaration): Gap[] {
  const display = style.display;
  if (!display.includes("flex") && !display.includes("grid")) return [];
  const kids = [...el.children]
    .map((c) => c.getBoundingClientRect())
    .filter((r) => r.width > 0 && r.height > 0);
  const gaps: Gap[] = [];
  for (let i = 1; i < kids.length; i += 1) {
    const a = kids[i - 1];
    const b = kids[i];
    if (b.left >= a.right - 0.5 && Math.abs(b.top - a.top) < a.height) {
      const w = b.left - a.right;
      if (w > 0.5) {
        const top = Math.max(a.top, b.top);
        const bottom = Math.min(a.bottom, b.bottom);
        gaps.push({
          rect: new DOMRect(a.right, top, w, Math.max(bottom - top, 2)),
          px: w,
          ok: isSpacingStep(w, config().spacingSteps),
        });
      }
    } else if (b.top >= a.bottom - 0.5) {
      const h = b.top - a.bottom;
      if (h > 0.5) {
        const left = Math.max(a.left, b.left);
        const right = Math.min(a.right, b.right);
        gaps.push({
          rect: new DOMRect(left, a.bottom, Math.max(right - left, 2), h),
          px: h,
          ok: isSpacingStep(h, config().spacingSteps),
        });
      }
    }
  }
  return gaps;
}

/** The full spec of one element. */
export function readSpec(
  el: Element,
  scales: { radius: readonly number[]; colors: ColorTokens },
): Spec {
  const style = getComputedStyle(el);
  const rect = el.getBoundingClientRect();
  const padding = sides(style, "padding");
  const margin = sides(style, "margin");
  const radius = {
    tl: num(style.borderTopLeftRadius),
    tr: num(style.borderTopRightRadius),
    br: num(style.borderBottomRightRadius),
    bl: num(style.borderBottomLeftRadius),
  };
  const short = Math.min(rect.width, rect.height);
  const offRadius = Object.values(radius).filter(
    (r) => !isRadiusStep(scales.radius, r, short),
  );

  let text: TextSpec | null = null;
  if (hasOwnText(el)) {
    const sizePx = num(style.fontSize);
    const lh = style.lineHeight === "normal" ? null : num(style.lineHeight);
    const weight = num(style.fontWeight) || 400;
    const roles = matchTypeRoles(config().typeRoles, sizePx, lh, weight).map(
      (r) => r.role,
    );
    const back = backdrop(el);
    const fg = toRgba(style.color);
    const contrast = fg ? contrastRatio(over(fg, back.rgb), back.rgb) : null;
    const need = requiredContrast(sizePx, weight);
    text = {
      sizePx,
      lineHeightPx: lh,
      weight,
      roles,
      size: isTypeSize(config().typeRoles, sizePx)
        ? { ok: true }
        : { ok: false, note: `${sizePx}px is not a type role size` },
      lineHeight:
        lh === null || isOnGrid(lh, config().gridPx)
          ? { ok: true }
          : { ok: false, note: `line height ${lh}px is off the 4px grid` },
      color: style.color,
      colorToken: nameColor(style.color, scales.colors),
      background: back.color,
      backgroundToken: nameColor(back.color, scales.colors),
      contrast,
      contrastCheck:
        contrast === null || contrast >= need
          ? { ok: true }
          : {
              ok: false,
              note: `contrast ${contrast.toFixed(2)}:1 is under ${need}:1`,
            },
    };
  }

  return {
    el,
    label: describe(el),
    rect,
    padding,
    margin,
    paddingOk: checkSides(padding, "padding"),
    // A large margin is usually `auto` or layout, not a spacing step.
    marginOk: checkSides(margin, "margin", config().marginLimitPx),
    gaps: childGaps(el, style),
    radius,
    radiusOk:
      offRadius.length === 0
        ? { ok: true }
        : {
            ok: false,
            note: `radius ${[...new Set(offRadius)].join(", ")}px is off the scale`,
          },
    text,
  };
}

/** The horizontal and vertical space between two boxes; 0 when they overlap. */
export function distance(a: DOMRect, b: DOMRect): { x: number; y: number } {
  const x =
    b.left >= a.right
      ? b.left - a.right
      : a.left >= b.right
        ? a.left - b.right
        : 0;
  const y =
    b.top >= a.bottom
      ? b.top - a.bottom
      : a.top >= b.bottom
        ? a.top - b.bottom
        : 0;
  return { x, y };
}
