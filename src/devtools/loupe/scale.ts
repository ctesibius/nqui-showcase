/**
 * The pure rules of Loupe: which value is on a scale. Every scale is a parameter, so
 * the rules hold no app's numbers; the host app passes its scales in `LoupeConfig`.
 */

/** True when `px` is 0 or one of the spacing steps, to within half a pixel. */
export function isSpacingStep(px: number, steps: readonly number[]): boolean {
  const abs = Math.abs(px);
  if (abs < 0.5) return true;
  return steps.some((step) => Math.abs(step - abs) < 0.5);
}

/** The root font size the rem tokens resolve against. */
const REM_PX = 16;

export interface TypeRole {
  /** The token name without the prefix: `body` for `--text-body`. */
  role: string;
  sizePx: number;
  /** Null when the role carries no line height (micro, fine). */
  lineHeightPx: number | null;
  /** The weight the role sets, or null when the call site sets it. */
  weight: number | null;
}

/** A CSS length or a unitless number to px, against `basePx` for a unitless value. */
function toPx(raw: string, basePx: number): number | null {
  let value = raw.trim();
  // Tailwind 4 writes a unitless line height as `calc(1.25 / 0.875)`.
  const ratio = /^calc\(\s*([\d.]+)\s*\/\s*([\d.]+)\s*\)$/.exec(value);
  if (ratio) value = String(Number(ratio[1]) / Number(ratio[2]));
  const m = /^(-?[\d.]+)(rem|px|em)?$/.exec(value);
  if (!m) return null;
  const n = Number(m[1]);
  if (!Number.isFinite(n)) return null;
  if (m[2] === "rem") return n * REM_PX;
  if (m[2] === "px") return n;
  return n * basePx;
}

/**
 * The type roles of `typography.css`: every `--text-<role>: <size>` with its
 * `--text-<role>--line-height`, if the role has one.
 */
export function parseTypeRoles(css: string): TypeRole[] {
  const sizes = new Map<string, number>();
  const heights = new Map<string, string>();
  const weights = new Map<string, number>();
  for (const m of css.matchAll(/--text-([a-z0-9]+):\s*([^;]+);/g)) {
    const px = toPx(m[2], REM_PX);
    if (px !== null) sizes.set(m[1], px);
  }
  for (const m of css.matchAll(/--text-([a-z0-9]+)--line-height:\s*([^;]+);/g)) {
    heights.set(m[1], m[2]);
  }
  for (const m of css.matchAll(/--text-([a-z0-9]+)--font-weight:\s*(\d+);/g)) {
    weights.set(m[1], Number(m[2]));
  }
  return [...sizes.entries()].map(([role, sizePx]) => {
    const lh = heights.get(role);
    return {
      role,
      sizePx,
      lineHeightPx: lh === undefined ? null : toPx(lh, sizePx),
      weight: weights.get(role) ?? null,
    };
  });
}

/**
 * The roles whose size matches a measured text, best match first: a matching line
 * height counts most, then a matching weight. A role with no weight of its own is
 * read as 400, the weight of plain text.
 */
export function matchTypeRoles(
  roles: readonly TypeRole[],
  sizePx: number,
  lineHeightPx: number | null,
  weight = 400,
): TypeRole[] {
  const sameSize = roles.filter((r) => Math.abs(r.sizePx - sizePx) < 0.5);
  return sameSize.sort((a, b) => score(b) - score(a));
  function score(r: TypeRole): number {
    let s = 0;
    if (r.lineHeightPx !== null && lineHeightPx !== null) {
      s += Math.abs(r.lineHeightPx - lineHeightPx) < 0.5 ? 2 : -2;
    }
    if ((r.weight ?? 400) === weight) s += 1;
    return s;
  }
}

/** True when a font size is one of the role sizes. */
export function isTypeSize(
  roles: readonly TypeRole[],
  sizePx: number,
): boolean {
  return roles.some((r) => Math.abs(r.sizePx - sizePx) < 0.5);
}

/** True when a line height is a multiple of the grid, to within half a pixel. */
export function isOnGrid(px: number, gridPx = 4): boolean {
  const rest = px % gridPx;
  return rest < 0.5 || gridPx - rest < 0.5;
}

/**
 * True when a corner radius is on the radius scale: 0, a token step, or a pill (a
 * radius of half the short side or more draws the same shape as `rounded-full`).
 */
export function isRadiusStep(
  steps: readonly number[],
  px: number,
  shortSidePx: number,
): boolean {
  if (px < 0.5) return true;
  if (shortSidePx > 0 && px >= shortSidePx / 2 - 0.5) return true;
  return steps.some((step) => Math.abs(step - px) < 0.5);
}

export type Rgb = readonly [number, number, number];

/** The WCAG relative luminance of an sRGB colour with 0–255 channels. */
export function luminance([r, g, b]: Rgb): number {
  const lin = (c: number) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/** The WCAG contrast ratio of two colours, from 1 to 21. */
export function contrastRatio(a: Rgb, b: Rgb): number {
  const la = luminance(a);
  const lb = luminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * The contrast a text needs (WCAG 2.1 AA): 3:1 for large text (24px, or 18.66px at
 * weight 700), else 4.5:1.
 */
export function requiredContrast(sizePx: number, weight: number): number {
  const large = sizePx >= 24 || (sizePx >= 18.66 && weight >= 700);
  return large ? 3 : 4.5;
}

/** Composite a colour with alpha over an opaque one. */
export function over(
  top: readonly [number, number, number, number],
  under: Rgb,
): Rgb {
  const a = top[3];
  return [
    top[0] * a + under[0] * (1 - a),
    top[1] * a + under[1] * (1 - a),
    top[2] * a + under[2] * (1 - a),
  ];
}

/** A px value for a label: whole numbers stay whole, others keep one decimal. */
export function px(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}
