/** Shared progress tokens for task pills and summary brackets. */

/** Bracket opacity while rollup is incomplete — full strength only at 100%. */
export const SUMMARY_BRACKET_MIN_OPACITY = 0.74
export const SUMMARY_BRACKET_INCOMPLETE_MAX_OPACITY = 0.92

/** nqui default control radius (SelectTrigger, Input) — shared by task bars and summary rails. */
export const GANTT_BAR_RADIUS_CSS = "var(--gantt-bar-radius, var(--radius-md))"

/** Fallback px for SVG geometry when CSS tokens are unavailable (≈ radius-md). */
export const GANTT_BAR_RADIUS_PX = 6

/**
 * Task-bar corner radius: nqui `--radius-md` (same as SelectTrigger), clamped
 * to half the short side so Appearance → Pill becomes a stadium and Sharp
 * stays a rounded rect — never an over-round capsule from the token alone.
 */
export function getGanttBarBorderRadius(
  barWidthPx: number,
  barHeightPx = 0,
): string {
  if (barWidthPx <= 0 && barHeightPx <= 0) return GANTT_BAR_RADIUS_CSS
  const caps = [GANTT_BAR_RADIUS_CSS]
  if (barWidthPx > 0) caps.push(`${barWidthPx / 2}px`)
  if (barHeightPx > 0) caps.push(`${barHeightPx / 2}px`)
  return `min(${caps.join(", ")})`
}

export function getSummaryBracketOpacity(progress: number | null): number {
  if (progress == null || progress >= 100) return 1
  const t = progress / 100
  return (
    SUMMARY_BRACKET_MIN_OPACITY
    + t * (SUMMARY_BRACKET_INCOMPLETE_MAX_OPACITY - SUMMARY_BRACKET_MIN_OPACITY)
  )
}

// Fallbacks used only when the `.gantt` theme tokens are absent (unit tests,
// Storybook). In the app the tokens in gantt-theme.css supply these values and
// consumers can override them. Keep these in sync with that token contract.
const FALLBACK_TRACK_TINT = 30
const FALLBACK_DONE_TINT = 84
const FALLBACK_HOVER_TINT = 36

const PILL_RING_TINT = 60

export interface GanttPillFillColors {
  /** Open / unfilled track — `--gantt-bar-track-tint` on `--gantt-bar-track-base`. */
  baseColor: string
  /** Completed fill — `--gantt-bar-done-tint` on `--gantt-bar-done-base`. */
  doneColor: string
  /** Open track on hover — `--gantt-bar-hover-tint`. */
  hoverColor: string
  /** Hue-derived hairline edge — guarantees a visible silhouette. */
  ringColor: string
}

/** Reads bar progress tokens from `.gantt` (see gantt-theme.css). */
function themedMix(
  accent: string | undefined,
  tintVar: string,
  baseVar: string,
  fallbackTint: number,
): string {
  const a = accent ?? "var(--muted-foreground)"
  return `color-mix(in srgb, ${a} calc(var(${tintVar}, ${fallbackTint}) * 1%), var(${baseVar}, var(--background)))`
}

/** Borderless two-shade task-bar palette with a contrast-floor edge ring. */
export function getGanttPillFillColors(accent?: string): GanttPillFillColors {
  return {
    baseColor: themedMix(accent, "--gantt-bar-track-tint", "--gantt-bar-track-base", FALLBACK_TRACK_TINT),
    doneColor: themedMix(accent, "--gantt-bar-done-tint", "--gantt-bar-done-base", FALLBACK_DONE_TINT),
    hoverColor: themedMix(accent, "--gantt-bar-hover-tint", "--gantt-bar-track-base", FALLBACK_HOVER_TINT),
    ringColor: accent
      ? `color-mix(in srgb, ${accent} ${PILL_RING_TINT}%, var(--foreground))`
      : "var(--border)",
  }
}

export function clampGanttProgress(progress: number | null | undefined): number | null {
  if (progress == null) return null
  return Math.max(0, Math.min(100, progress))
}

export function ganttProgressAriaLabel(progress: number): string {
  return `${progress}% complete`
}
