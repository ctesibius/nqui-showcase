/** Summary / group bracket geometry — top rail + grid-aligned feet. */

/** Screen-pixel width of bracket feet at the rail line (constant across zoom/range). */
export const SUMMARY_BRACKET_CAP_PX_DEFAULT = 12
/** Top-rail corner radius — matches task pill `rounded-md`. */
export const GANTT_BAR_RADIUS_PX = 6
/** SVG viewBox height for summary bracket geometry. */
export const SUMMARY_BAR_VIEW_HEIGHT = 14
/** Overlap at rail/foot seam to avoid sub-pixel gaps when the SVG stretches. */
export const SUMMARY_BRACKET_SEAM_OVERLAP = 0.2
/** Minimum bar width before rendering the progress fill. */
export const SUMMARY_PROGRESS_MIN_BAR_WIDTH_PX = 24

/**
 * Leading-edge feather (screen px) for the bracket progress fill — mirrors the
 * task-pill `+6px` overshoot so the completed slice reads as a soft tone shift
 * rather than a hard seam.
 */
export const SUMMARY_PROGRESS_FEATHER_PX = 6

/**
 * Width (in viewBox units, 0–100) of the left-anchored clip rect that reveals
 * the progress veil across the whole bracket (rail + feet). Returns 0 when there
 * is nothing to fill so the caller can skip the overlay entirely.
 */
export function getSummaryProgressClipWidthVb(
  progress: number | null | undefined,
  barWidthPx: number,
  featherPx = SUMMARY_PROGRESS_FEATHER_PX,
  viewBoxWidth = 100,
): number {
  if (barWidthPx <= 0 || progress == null || progress <= 0) return 0
  const filledPx = (progress / 100) * barWidthPx + featherPx
  return Math.min(viewBoxWidth, (filledPx / barWidthPx) * viewBoxWidth)
}

/** Feather width in viewBox units — mirrors task-pill `6px` leading-edge soft seam. */
export function getSummaryProgressFeatherVb(
  barWidthPx: number,
  featherPx = SUMMARY_PROGRESS_FEATHER_PX,
  viewBoxWidth = 100,
): number {
  if (barWidthPx <= 0) return 0
  return (featherPx / barWidthPx) * viewBoxWidth
}

/**
 * Solid-stop offset (0–100) for the progress veil gradient. The completed slice
 * stays full `doneColor` until the last feather band, then fades to transparent
 * — same contract as task pills (`calc(100% - 6px), transparent`).
 */
export function getSummaryProgressSolidStopPercent(
  clipWidthVb: number,
  barWidthPx: number,
  featherPx = SUMMARY_PROGRESS_FEATHER_PX,
  viewBoxWidth = 100,
): number {
  if (clipWidthVb <= 0) return 0
  const featherVb = getSummaryProgressFeatherVb(barWidthPx, featherPx, viewBoxWidth)
  const solidEndVb = Math.max(0, clipWidthVb - featherVb)
  return (solidEndVb / clipWidthVb) * 100
}

export type GanttSummaryFootStyle =
  | "triangle"
  | "chamfer"
  | "round"
  | "flare"
  | "step"
  | "taper"

export type GanttSummaryBracketPresetId =
  | "classic"
  | "soft"
  | "flare"
  | "chamfer"
  | "step"
  | "taper"

export interface GanttSummaryBracketStyle {
  presetId: GanttSummaryBracketPresetId | "custom"
  /** Top rail share of bracket height (0.45–0.7). */
  topRailRatio: number
  footStyle: GanttSummaryFootStyle
  /** Screen px — inner inset where the foot meets the top rail. */
  footCapPx: number
  /** 0–1 — chamfer shelf, step shelf, or taper spread within the foot zone. */
  footCutDepth: number
  /** Screen px — inner corner radius for `round` feet. */
  innerRadiusPx: number
}

export const GANTT_SUMMARY_BRACKET_STYLE_DEFAULT: GanttSummaryBracketStyle = {
  presetId: "classic",
  topRailRatio: 0.6,
  footStyle: "triangle",
  footCapPx: 12,
  footCutDepth: 0.4,
  innerRadiusPx: 3,
}

const PRESET_STYLES: Record<GanttSummaryBracketPresetId, Omit<GanttSummaryBracketStyle, "presetId">> = {
  classic: {
    topRailRatio: 0.6,
    footStyle: "triangle",
    footCapPx: 12,
    footCutDepth: 0.4,
    innerRadiusPx: 3,
  },
  soft: {
    topRailRatio: 0.58,
    footStyle: "round",
    footCapPx: 5,
    footCutDepth: 0.45,
    innerRadiusPx: 4,
  },
  flare: {
    topRailRatio: 0.55,
    footStyle: "flare",
    footCapPx: 6,
    footCutDepth: 0.5,
    innerRadiusPx: 3,
  },
  chamfer: {
    topRailRatio: 0.6,
    footStyle: "chamfer",
    footCapPx: 5,
    footCutDepth: 0.35,
    innerRadiusPx: 3,
  },
  step: {
    topRailRatio: 0.57,
    footStyle: "step",
    footCapPx: 7,
    footCutDepth: 0.55,
    innerRadiusPx: 2,
  },
  taper: {
    topRailRatio: 0.56,
    footStyle: "taper",
    footCapPx: 4,
    footCutDepth: 0.5,
    innerRadiusPx: 2,
  },
}

export const GANTT_SUMMARY_BRACKET_PRESET_OPTIONS: {
  id: GanttSummaryBracketPresetId
  label: string
  description: string
}[] = [
  { id: "classic", label: "Classic", description: "Sharp triangle feet — 60/40 rail split, 12px inner width." },
  { id: "soft", label: "Soft", description: "Filleted inner corners — smooth rail-to-foot transition." },
  { id: "flare", label: "Flare", description: "Continuous curved inner edge flowing into the rail." },
  { id: "chamfer", label: "Chamfer", description: "Angled inner cut with a flat bottom shelf." },
  { id: "step", label: "Step", description: "Rectangular notch foot with a horizontal shelf." },
  { id: "taper", label: "Taper", description: "Feet widen toward the baseline for a flared bracket." },
]

export const GANTT_SUMMARY_FOOT_STYLE_OPTIONS: {
  value: GanttSummaryFootStyle
  label: string
}[] = [
  { value: "triangle", label: "Triangle" },
  { value: "chamfer", label: "Chamfer" },
  { value: "round", label: "Round" },
  { value: "flare", label: "Flare" },
  { value: "step", label: "Step" },
  { value: "taper", label: "Taper" },
]

const FOOT_STYLES: GanttSummaryFootStyle[] = [
  "triangle",
  "chamfer",
  "round",
  "flare",
  "step",
  "taper",
]

export function isGanttSummaryFootStyle(value: unknown): value is GanttSummaryFootStyle {
  return typeof value === "string" && FOOT_STYLES.includes(value as GanttSummaryFootStyle)
}

export function isGanttSummaryBracketPresetId(value: unknown): value is GanttSummaryBracketPresetId {
  return typeof value === "string" && value in PRESET_STYLES
}

export function getSummaryBracketPresetStyle(
  presetId: GanttSummaryBracketPresetId,
): GanttSummaryBracketStyle {
  return { presetId, ...PRESET_STYLES[presetId] }
}

export function normalizeSummaryBracketStyle(
  partial?: Partial<GanttSummaryBracketStyle> | null,
): GanttSummaryBracketStyle {
  const base = GANTT_SUMMARY_BRACKET_STYLE_DEFAULT
  const presetId =
    partial?.presetId === "custom" || isGanttSummaryBracketPresetId(partial?.presetId)
      ? partial.presetId
      : base.presetId

  const presetBase =
    presetId !== "custom" && isGanttSummaryBracketPresetId(presetId)
      ? PRESET_STYLES[presetId]
      : null

  const merged = {
    ...base,
    ...presetBase,
    ...partial,
    presetId,
  }

  return {
    presetId: merged.presetId,
    topRailRatio: clamp(merged.topRailRatio, 0.45, 0.7),
    footStyle: isGanttSummaryFootStyle(merged.footStyle) ? merged.footStyle : base.footStyle,
    footCapPx: clamp(merged.footCapPx, 3, 12),
    footCutDepth: clamp(merged.footCutDepth, 0.15, 0.85),
    innerRadiusPx: clamp(merged.innerRadiusPx, 1, 8),
  }
}

export function getSummaryRailEndY(
  viewBoxHeight = SUMMARY_BAR_VIEW_HEIGHT,
  topRailRatio = GANTT_SUMMARY_BRACKET_STYLE_DEFAULT.topRailRatio,
): number {
  return viewBoxHeight * topRailRatio
}

export function summaryBracketCapViewBoxWidth(
  barWidthPx: number,
  capPx = SUMMARY_BRACKET_CAP_PX_DEFAULT,
  viewBoxWidth = 100,
): number {
  if (barWidthPx <= 0) return 8
  const units = (capPx / barWidthPx) * viewBoxWidth
  return Math.min(16, Math.max(0.2, units))
}

export function summaryTopRailPath(
  railEndY: number,
  barWidthPx: number,
  railHeightPx: number,
  viewBoxWidth = 100,
): string {
  const rx = barWidthPx > 0
    ? Math.min(viewBoxWidth / 2, (GANTT_BAR_RADIUS_PX / barWidthPx) * viewBoxWidth)
    : 1.5
  const ry = railHeightPx > 0
    ? Math.min(railEndY / 2, (GANTT_BAR_RADIUS_PX / railHeightPx) * railEndY)
    : Math.min(railEndY / 2, 1.5)

  return [
    `M ${rx},0`,
    `H ${viewBoxWidth - rx}`,
    `A ${rx} ${ry} 0 0 1 ${viewBoxWidth},${ry}`,
    `V ${railEndY}`,
    `H 0`,
    `V ${ry}`,
    `A ${rx} ${ry} 0 0 1 ${rx},0`,
    "Z",
  ].join(" ")
}

export interface SummaryFootGeometry {
  leftPath: string
  rightPath: string
}

export function buildSummaryFootGeometry({
  style,
  barWidthPx,
  barHeightPx,
  viewBoxHeight = SUMMARY_BAR_VIEW_HEIGHT,
  viewBoxWidth = 100,
}: {
  style: GanttSummaryBracketStyle
  barWidthPx: number
  barHeightPx: number
  viewBoxHeight?: number
  viewBoxWidth?: number
}): SummaryFootGeometry {
  const railEndY = getSummaryRailEndY(viewBoxHeight, style.topRailRatio)
  const capWidth = summaryBracketCapViewBoxWidth(barWidthPx, style.footCapPx, viewBoxWidth)
  const footZone = viewBoxHeight - railEndY
  const innerRadius = pxToViewBoxY(style.innerRadiusPx, barHeightPx, viewBoxHeight)

  const args = {
    footStyle: style.footStyle,
    railEndY,
    height: viewBoxHeight,
    capWidth,
    footZone,
    footCutDepth: style.footCutDepth,
    innerRadius,
    viewBoxWidth,
  }

  return {
    leftPath: buildFootPath({ ...args, side: "left" }),
    rightPath: buildFootPath({ ...args, side: "right" }),
  }
}

function buildFootPath({
  side,
  footStyle,
  railEndY,
  height,
  capWidth,
  footZone,
  footCutDepth,
  innerRadius,
  viewBoxWidth,
}: {
  side: "left" | "right"
  footStyle: GanttSummaryFootStyle
  railEndY: number
  height: number
  capWidth: number
  footZone: number
  footCutDepth: number
  innerRadius: number
  viewBoxWidth: number
}): string {
  const outerX = side === "left" ? 0 : viewBoxWidth
  const innerX = side === "left" ? capWidth : viewBoxWidth - capWidth

  switch (footStyle) {
    case "triangle":
      return `M ${outerX},${railEndY} L ${outerX},${height} L ${innerX},${railEndY} Z`

    case "chamfer": {
      const tipX = side === "left"
        ? capWidth * clamp(footCutDepth, 0.2, 0.9)
        : viewBoxWidth - capWidth * clamp(footCutDepth, 0.2, 0.9)
      return `M ${outerX},${railEndY} L ${outerX},${height} L ${tipX},${height} L ${innerX},${railEndY} Z`
    }

    case "step": {
      const shelfY = railEndY + footZone * clamp(footCutDepth, 0.25, 0.85)
      const tipX = side === "left"
        ? capWidth * clamp(0.35 + footCutDepth * 0.35, 0.25, 0.85)
        : viewBoxWidth - capWidth * clamp(0.35 + footCutDepth * 0.35, 0.25, 0.85)
      return `M ${outerX},${railEndY} L ${innerX},${railEndY} L ${innerX},${shelfY} L ${tipX},${height} L ${outerX},${height} Z`
    }

    case "taper": {
      const baseCap = Math.min(capWidth * 2.2, capWidth * (1 + footCutDepth * 0.85))
      const baseX = side === "left" ? baseCap : viewBoxWidth - baseCap
      return `M ${outerX},${railEndY} L ${outerX},${height} L ${baseX},${height} L ${innerX},${railEndY} Z`
    }

    case "round": {
      const r = Math.min(innerRadius, footZone * 0.75, capWidth * 0.85)
      const arcEndY = height - r
      if (side === "left") {
        return [
          `M ${outerX},${railEndY}`,
          `L ${innerX},${railEndY}`,
          `L ${innerX},${railEndY + footZone * 0.35}`,
          `Q ${capWidth * 0.35},${height} ${outerX},${arcEndY}`,
          `A ${r} ${r} 0 0 1 ${outerX},${height}`,
          "Z",
        ].join(" ")
      }
      return [
        `M ${outerX},${railEndY}`,
        `L ${innerX},${railEndY}`,
        `L ${innerX},${railEndY + footZone * 0.35}`,
        `Q ${viewBoxWidth - capWidth * 0.35},${height} ${outerX},${arcEndY}`,
        `A ${r} ${r} 0 0 0 ${outerX},${height}`,
        "Z",
      ].join(" ")
    }

    case "flare": {
      const c1y = railEndY + footZone * (0.35 + footCutDepth * 0.25)
      if (side === "left") {
        const c2x = capWidth * (0.15 + footCutDepth * 0.2)
        return `M ${outerX},${railEndY} L ${outerX},${height} C ${c2x},${height} ${innerX},${c1y} ${innerX},${railEndY} Z`
      }
      const c2x = viewBoxWidth - capWidth * (0.15 + footCutDepth * 0.2)
      return `M ${outerX},${railEndY} L ${outerX},${height} C ${c2x},${height} ${innerX},${c1y} ${innerX},${railEndY} Z`
    }

    default:
      return `M ${outerX},${railEndY} L ${outerX},${height} L ${innerX},${railEndY} Z`
  }
}

function pxToViewBoxY(px: number, barHeightPx: number, viewBoxHeight: number): number {
  if (barHeightPx <= 0) return px
  return (px / barHeightPx) * viewBoxHeight
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}
