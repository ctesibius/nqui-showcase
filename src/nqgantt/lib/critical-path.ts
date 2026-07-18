/**
 * Critical-path highlight styles — bars + dependency edges.
 *
 * Change the product default in `GANTT_CRITICAL_PATH_STYLE_DEFAULT` below,
 * or override per session via Settings → Schedule → Highlight style.
 */

export type GanttCriticalPathStyle = "glow" | "ring" | "tint" | "stripe" | "beacon"

/** Product default — update this when design settles. */
export const GANTT_CRITICAL_PATH_STYLE_DEFAULT: GanttCriticalPathStyle = "stripe"

export const GANTT_CRITICAL_PATH_STYLE_OPTIONS: {
  value: GanttCriticalPathStyle
  label: string
  description: string
}[] = [
  {
    value: "glow",
    label: "Glow",
    description: "Legacy option — prefer stripe/ring (showcase theme disables bar glow)",
  },
  {
    value: "ring",
    label: "Ring",
    description: "Animated outline ring, standard fill",
  },
  {
    value: "tint",
    label: "Tint",
    description: "Warm background wash on bars only",
  },
  {
    value: "stripe",
    label: "Stripe",
    description: "Left accent stripe + link pulse",
  },
  {
    value: "beacon",
    label: "Beacon",
    description: "Strong tint — best for dark mode",
  },
]

export function isGanttCriticalPathStyle(value: unknown): value is GanttCriticalPathStyle {
  return (
    typeof value === "string" &&
    GANTT_CRITICAL_PATH_STYLE_OPTIONS.some(opt => opt.value === value)
  )
}

/** Whether dependency edges get a critical-path underlay for this style. */
export function criticalPathStyleUsesEdgeGlow(style: GanttCriticalPathStyle): boolean {
  return style !== "tint"
}

export function criticalPathBarWrapperClass(style: GanttCriticalPathStyle): string {
  return `gantt-critical-bar gantt-critical-bar--${style}`
}
