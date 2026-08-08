/**
 * Gantt bar appearance model — showcase-owned.
 *
 * Nothing here forks the engine. `@nqlib/nqgantt` paints the bars; every look
 * below is a payload of `--gantt-bar-*` custom properties that `gantt-theme.css`
 * reads. A style id lands on the live `.gantt` element as `data-gantt-bar-style`
 * (and `data-gantt-group-rows`), so the same attribute drives both the real
 * timeline and the miniature swatches in the picker.
 *
 * Light/dark parity is the CSS file's job: every style declares a full light
 * token set, and a `.dark` block states only the deltas.
 */

export type GanttBarStyleId = "studio" | "solid" | "flat" | "outline" | "capsule"
export type GanttGroupRowsId = "bracket" | "rail" | "pill"

export interface GanttBarStyleOption {
  id: GanttBarStyleId
  label: string
  /** One line — what this look is *for*, not what it looks like. */
  blurb: string
}

export interface GanttGroupRowsOption {
  id: GanttGroupRowsId
  label: string
  blurb: string
}

export const GANTT_BAR_STYLES: GanttBarStyleOption[] = [
  {
    id: "studio",
    label: "Studio",
    blurb: "Soft two-tone under a glass rim.",
  },
  {
    id: "solid",
    label: "Solid",
    blurb: "Vivid done slice, crisp seam.",
  },
  {
    id: "flat",
    label: "Flat",
    blurb: "Opaque fill, hard seam, no chrome.",
  },
  {
    id: "outline",
    label: "Outline",
    blurb: "Hollow track, hairline edge.",
  },
  {
    id: "capsule",
    label: "Capsule",
    blurb: "Full pill radius, long feather.",
  },
]

export const GANTT_GROUP_ROWS: GanttGroupRowsOption[] = [
  {
    id: "bracket",
    label: "Bracket",
    blurb: "Rail with feet — unmistakably a rollup.",
  },
  {
    id: "rail",
    label: "Rail",
    blurb: "A hairline span with end stops.",
  },
  {
    id: "pill",
    label: "Pill",
    blurb: "Its children's silhouette, heavier.",
  },
]

/**
 * Tunable tokens surfaced by the dev lab panel. `unit` is appended to the raw
 * slider value; `format` handles the tokens that wrap a number in a function.
 */
export interface GanttBarTokenSpec {
  /** Custom property name, without the `--gantt-bar-` prefix. */
  token: string
  label: string
  hint: string
  min: number
  max: number
  step: number
  unit?: string
  format?: (value: number) => string
}

const alpha = (value: number) => `rgb(255 255 255 / ${value})`

export const GANTT_BAR_TOKENS: GanttBarTokenSpec[] = [
  {
    token: "track-tint",
    label: "Track tint",
    hint: "Accent weight on open work",
    min: 0,
    max: 100,
    step: 1,
  },
  {
    token: "done-tint",
    label: "Done tint",
    hint: "Accent weight on the completed slice",
    min: 0,
    max: 100,
    step: 1,
  },
  {
    token: "hover-tint",
    label: "Hover tint",
    hint: "Track weight while pointing at the row",
    min: 0,
    max: 100,
    step: 1,
  },
  {
    token: "done-alpha",
    label: "Done opacity",
    hint: "Lower lets the rim and sheen survive the fill",
    min: 40,
    max: 100,
    step: 1,
    unit: "%",
  },
  {
    token: "feather-px",
    label: "Feather",
    hint: "Soft seam at the leading edge of progress",
    min: 0,
    max: 24,
    step: 1,
  },
  {
    token: "radius",
    label: "Corner radius",
    hint: "Short bars still cap to half their height",
    min: 0,
    max: 16,
    step: 1,
    unit: "px",
  },
  {
    token: "ring-mix",
    label: "Rim",
    hint: "Hue ring that firms up pale fills",
    min: 0,
    max: 80,
    step: 1,
    unit: "%",
  },
  {
    token: "lift-y",
    label: "Lift",
    hint: "Drop-shadow offset under the bar",
    min: 0,
    max: 4,
    step: 1,
    unit: "px",
  },
  {
    token: "lift-alpha",
    label: "Lift depth",
    hint: "Shadow strength",
    min: 0,
    max: 40,
    step: 1,
    format: (v) => `${v / 100}`,
  },
  {
    token: "inset-highlight",
    label: "Top edge",
    hint: "Inner highlight along the top hairline",
    min: 0,
    max: 60,
    step: 1,
    format: (v) => alpha(v / 100),
  },
  {
    token: "sheen",
    label: "Sheen",
    hint: "Top-light gradient across the bar face",
    min: 0,
    max: 45,
    step: 1,
    format: (v) => alpha(v / 100),
  },
  {
    token: "sheen-stop",
    label: "Sheen falloff",
    hint: "How far down the face the light reaches",
    min: 10,
    max: 100,
    step: 1,
    unit: "%",
  },
]

export interface GanttBarDesign {
  barStyle: GanttBarStyleId
  groupRows: GanttGroupRowsId
  /** Raw lab overrides, keyed by token name (no `--gantt-bar-` prefix). */
  tuning: Record<string, number>
}

export const GANTT_BAR_DESIGN_DEFAULT: GanttBarDesign = {
  barStyle: "flat",
  groupRows: "rail",
  tuning: {},
}

export function isGanttBarStyleId(value: unknown): value is GanttBarStyleId {
  return GANTT_BAR_STYLES.some((s) => s.id === value)
}

export function isGanttGroupRowsId(value: unknown): value is GanttGroupRowsId {
  return GANTT_GROUP_ROWS.some((g) => g.id === value)
}

export function ganttBarStyleLabel(id: GanttBarStyleId): string {
  return GANTT_BAR_STYLES.find((s) => s.id === id)?.label ?? id
}

/** Resolve a slider value into the CSS declaration value for its token. */
export function ganttBarTokenValue(spec: GanttBarTokenSpec, value: number): string {
  if (spec.format) return spec.format(value)
  return `${value}${spec.unit ?? ""}`
}

export function isGanttBarDesignDirty(design: GanttBarDesign): boolean {
  return (
    design.barStyle !== GANTT_BAR_DESIGN_DEFAULT.barStyle
    || design.groupRows !== GANTT_BAR_DESIGN_DEFAULT.groupRows
    || Object.keys(design.tuning).length > 0
  )
}

/**
 * The lab's takeaway: a paste-ready block for `gantt-theme.css`. Only tuned
 * tokens appear — the style id names the block so it's obvious what it patches.
 */
export function ganttBarDesignToCss(design: GanttBarDesign): string {
  const entries = GANTT_BAR_TOKENS.filter((spec) => spec.token in design.tuning).map(
    (spec) => `  --gantt-bar-${spec.token}: ${ganttBarTokenValue(spec, design.tuning[spec.token])};`,
  )
  const head = `[data-gantt-bar-style="${design.barStyle}"] {`
  if (entries.length === 0) return `${head}\n  /* no overrides — style ships as authored */\n}`
  return [head, ...entries, "}"].join("\n")
}
