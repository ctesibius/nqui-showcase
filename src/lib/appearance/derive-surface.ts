/**
 * Showcase-only surface ladder derived from a paper seed (H/C/L).
 * Locks neutrals to one hue; mixes by lightness. Does not touch nqui source.
 */

export type ThemeMode = "light" | "dark"

export type PaperSeed = {
  /** Neutral hue (deg). */
  h: number
  /** Neutral chroma. Cap ~0.015. */
  c: number
  /** Background lightness (0–1). Other surfaces are relative offsets. */
  l: number
}

export type LookId = "default" | "ledger"

/** Relative ΔL from `--background` for each look × mode. */
type Ladder = {
  card: number
  popover: number
  muted: number
  secondary: number
  accent: number
  border: number
  input: number
  sidebarAccent: number
  sidebarBorder: number
  ring: number
  /** Ink / muted label — absolute L, not Δ. */
  foregroundL: number
  mutedForegroundL: number
  inkHue: number
  inkChroma: number
}

const LEDGER_LIGHT: Ladder = {
  card: 0.043,
  popover: 0.043,
  muted: -0.037,
  secondary: -0.06,
  accent: -0.08,
  border: -0.13,
  input: -0.13,
  sidebarAccent: -0.053,
  sidebarBorder: -0.09,
  ring: -0.445,
  foregroundL: 0.22,
  mutedForegroundL: 0.45,
  inkHue: 55,
  inkChroma: 0.025,
}

const LEDGER_DARK: Ladder = {
  card: 0.045,
  popover: 0.075,
  muted: 0.105,
  secondary: 0.13,
  accent: 0.155,
  border: 0.19,
  input: 0.17,
  sidebarAccent: 0.09,
  sidebarBorder: 0.19,
  ring: 0.45,
  foregroundL: 0.93,
  mutedForegroundL: 0.705,
  inkHue: 70,
  inkChroma: 0.006,
}

const DEFAULT_LIGHT: Ladder = {
  card: 0.011,
  popover: 0.011,
  muted: -0.068,
  secondary: -0.032,
  accent: -0.102,
  border: -0.09,
  input: -0.09,
  sidebarAccent: -0.05,
  sidebarBorder: -0.08,
  ring: -0.4,
  foregroundL: 0.24,
  mutedForegroundL: 0.56,
  inkHue: 57,
  inkChroma: 0.022,
}

const DEFAULT_DARK: Ladder = {
  card: 0.05,
  popover: 0.08,
  muted: 0.08,
  secondary: 0.14,
  accent: 0.16,
  border: 0.11,
  input: 0.11,
  sidebarAccent: 0.1,
  sidebarBorder: 0.12,
  ring: 0.4,
  foregroundL: 0.93,
  mutedForegroundL: 0.68,
  inkHue: 0,
  inkChroma: 0,
}

export const LOOK_PAPER_DEFAULTS: Record<
  LookId,
  Record<ThemeMode, PaperSeed>
> = {
  ledger: {
    light: { h: 70, c: 0.006, l: 0.925 },
    dark: { h: 70, c: 0.01, l: 0.17 },
  },
  default: {
    light: { h: 95, c: 0.0054, l: 0.982 },
    dark: { h: 0, c: 0, l: 0.16 },
  },
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

function oklch(l: number, c: number, h: number, a?: number) {
  const L = clamp(l, 0.05, 0.99)
  const C = clamp(c, 0, 0.12)
  if (a === undefined) return `oklch(${L.toFixed(4)} ${C.toFixed(4)} ${h.toFixed(1)})`
  return `oklch(${L.toFixed(4)} ${C.toFixed(4)} ${h.toFixed(1)} / ${a})`
}

function ladderFor(look: LookId, mode: ThemeMode): Ladder {
  if (look === "ledger") return mode === "dark" ? LEDGER_DARK : LEDGER_LIGHT
  return mode === "dark" ? DEFAULT_DARK : DEFAULT_LIGHT
}

/** Roles shown in Appearance — all derived from background seed (same H/C, ΔL). */
export const SURFACE_LADDER_ROLES = [
  { key: "background", label: "Background", deltaKey: null },
  { key: "card", label: "Card", deltaKey: "card" as const },
  { key: "muted", label: "Muted", deltaKey: "muted" as const },
  { key: "secondary", label: "Secondary", deltaKey: "secondary" as const },
  { key: "accent", label: "Accent wash", deltaKey: "accent" as const },
  { key: "border", label: "Border", deltaKey: "border" as const },
] as const

export type LadderStrength = number

/**
 * Map a paper seed across modes: keep H/C and the L offset from that look's default.
 */
export function paperForMode(
  seed: PaperSeed,
  look: LookId,
  fromMode: ThemeMode,
  toMode: ThemeMode,
): PaperSeed {
  if (fromMode === toMode) return seed
  const baseFrom = LOOK_PAPER_DEFAULTS[look][fromMode]
  const baseTo = LOOK_PAPER_DEFAULTS[look][toMode]
  const offset = seed.l - baseFrom.l
  return {
    h: seed.h,
    c: seed.c,
    l: clamp(baseTo.l + offset, 0.08, 0.98),
  }
}

export const SURFACE_VARS = [
  "--background",
  "--foreground",
  "--card",
  "--card-foreground",
  "--popover",
  "--popover-foreground",
  "--muted",
  "--muted-foreground",
  "--secondary",
  "--secondary-foreground",
  "--accent",
  "--accent-foreground",
  "--border",
  "--input",
  "--ring",
  "--overlay",
  "--sidebar",
  "--sidebar-foreground",
  "--sidebar-accent",
  "--sidebar-accent-foreground",
  "--sidebar-border",
  "--surface-a",
  "--surface-b",
  "--surface-elevated",
] as const

/** Scale ΔL steps (1 = look default). Border/muted move farther from bg when > 1. */
export function deriveSurfaceVars(
  seed: PaperSeed,
  look: LookId,
  mode: ThemeMode,
  strength: LadderStrength = 1,
): Record<string, string> {
  const ladder = ladderFor(look, mode)
  const s = clamp(strength, 0.5, 1.6)
  const { h, c } = seed
  const bg = seed.l
  const step = (d: number) => oklch(bg + d * s, c, h)
  const fg = oklch(ladder.foregroundL, ladder.inkChroma, ladder.inkHue)
  const mutedFg = oklch(
    ladder.mutedForegroundL,
    mode === "dark" ? 0.012 : 0.02,
    ladder.inkHue,
  )

  const card = step(ladder.card)
  const muted = step(ladder.muted)
  const secondary = step(ladder.secondary)
  const accent = step(ladder.accent)
  const border = step(ladder.border)
  const input = step(ladder.input)
  const popover = step(ladder.popover)

  return {
    "--background": step(0),
    "--foreground": fg,
    "--card": card,
    "--card-foreground": fg,
    "--popover": popover,
    "--popover-foreground": fg,
    "--muted": muted,
    "--muted-foreground": mutedFg,
    "--secondary": secondary,
    "--secondary-foreground":
      mode === "dark" ? fg : oklch(0.28, ladder.inkChroma, ladder.inkHue),
    "--accent": accent,
    "--accent-foreground": fg,
    "--border": border,
    "--input": input,
    "--ring": step(ladder.ring),
    "--overlay":
      mode === "dark"
        ? oklch(0.1, c, h, 0.65)
        : oklch(0.25, Math.max(c, 0.012), h, 0.5),
    "--sidebar": step(0),
    "--sidebar-foreground": fg,
    "--sidebar-accent": step(ladder.sidebarAccent),
    "--sidebar-accent-foreground": fg,
    "--sidebar-border": step(ladder.sidebarBorder),
    "--surface-a": "var(--background)",
    "--surface-b": "var(--muted)",
    "--surface-elevated": "var(--popover)",
  }
}

/** Swatch list for the Appearance ladder UI. */
export function ladderSwatches(
  seed: PaperSeed,
  look: LookId,
  mode: ThemeMode,
  strength: LadderStrength = 1,
): Array<{ key: string; label: string; css: string; delta: number }> {
  const ladder = ladderFor(look, mode)
  const s = clamp(strength, 0.5, 1.6)
  const vars = deriveSurfaceVars(seed, look, mode, strength)
  return SURFACE_LADDER_ROLES.map((role) => {
    const delta =
      role.deltaKey === null ? 0 : (ladder[role.deltaKey] as number) * s
    const cssKey = `--${role.key}` as keyof typeof vars
    return {
      key: role.key,
      label: role.label,
      css: vars[cssKey] ?? vars["--background"],
      delta,
    }
  })
}

/** Rough WCAG-ish contrast hint for bg vs fg (OKLCH L only). */
export function contrastHintOk(seed: PaperSeed, look: LookId, mode: ThemeMode): boolean {
  const ladder = ladderFor(look, mode)
  const delta = Math.abs(seed.l - ladder.foregroundL)
  return delta >= 0.4
}

export function formatAppearanceCss(
  lightSeed: PaperSeed,
  darkSeed: PaperSeed,
  look: LookId,
  strength: LadderStrength = 1,
): string {
  const light = deriveSurfaceVars(lightSeed, look, "light", strength)
  const dark = deriveSurfaceVars(darkSeed, look, "dark", strength)
  const block = (vars: Record<string, string>) =>
    Object.entries(vars)
      .map(([k, v]) => `  ${k}: ${v};`)
      .join("\n")
  return `/* nqui-showcase Appearance export — paste after @nqlib/nqui/styles */\n:root {\n${block(light)}\n}\n\n.dark {\n${block(dark)}\n}\n`
}
