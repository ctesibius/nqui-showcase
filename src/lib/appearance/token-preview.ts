/**
 * Shared primary / menu-accent / radius CSS var builders.
 * Used by live preview (`primary-accent-context`) and Theme Studio export.
 */

export type ThemeMode = "light" | "dark"

export type RadiusPresetId = "sharp" | "default" | "soft" | "pill"

export const RADIUS_PRESETS: ReadonlyArray<{
  id: RadiusPresetId
  label: string
  /** Base `--radius` value; sm/md/lg/xl derive via calc in nqui CSS. */
  value: string
}> = [
  { id: "sharp", label: "Sharp", value: "0.15rem" },
  { id: "default", label: "Default", value: "0.45rem" },
  { id: "soft", label: "Soft", value: "0.75rem" },
  { id: "pill", label: "Pill", value: "1.1rem" },
] as const

/**
 * Accent chips for Theme Studio / catalog.
 * First two are tuned for nqui warm paper (`--background` hue ~95): cool
 * primaries that stay distinct from cream without going violet/rose.
 */
export const ACCENT_CHIPS = [
  { hue: 230, label: "Slate", recommended: true },
  { hue: 205, label: "Teal", recommended: true },
  { hue: 240, label: "Blue" },
  { hue: 195, label: "Cyan" },
  { hue: 150, label: "Emerald" },
  { hue: 75, label: "Amber" },
  { hue: 280, label: "Violet" },
  { hue: 350, label: "Rose" },
] as const

/** Exact paper-fit primaries for Studio quick picks (light targets). */
export const PAPER_PRIMARY_PRESETS = [
  {
    id: "ink",
    label: "Ink",
    blurb: "nqui default — monochrome on cream",
    hue: null as number | null,
    shade: 2,
    /** Swatch paint (matches `--primary-500` warm ink). */
    swatch: "oklch(0.35 0.004 95)",
  },
  {
    id: "slate",
    label: "Slate",
    blurb: "Best chromatic fit on warm paper",
    hue: 230,
    shade: 2.6,
    swatch: "oklch(0.45 0.11 230)",
  },
  {
    id: "teal",
    label: "Teal",
    blurb: "Softer editorial cool",
    hue: 205,
    shade: 2.8,
    swatch: "oklch(0.46 0.09 205)",
  },
] as const

/**
 * Brand primary scale for the accent picker. Does not write `--accent` /
 * `--interactive` — those stay muted so hover is not a primary fill.
 */
export function previewPrimaryVars(
  hue: number,
  mode: ThemeMode,
  shade = 2,
  shadeBias = 0,
): Record<string, string> {
  const t = Math.max(0, Math.min(4, shade)) / 4
  const bias = Math.max(-0.14, Math.min(0.14, shadeBias))
  const primaryLRaw =
    mode === "dark" ? 0.72 - t * 0.12 : 0.42 + t * 0.28
  const primaryL = Math.max(0.2, Math.min(0.92, primaryLRaw + bias))
  const primaryC = 0.24 - t * 0.1
  const primary = `oklch(${primaryL.toFixed(3)} ${primaryC.toFixed(3)} ${hue})`
  const fg =
    primaryL > 0.62 ? "oklch(0.22 0.02 55)" : "oklch(0.98 0.005 95)"

  if (mode === "light") {
    return {
      "--primary-100": `oklch(${Math.min(0.97, 0.95 + bias * 0.3).toFixed(3)} ${Math.max(0.04, primaryC * 0.35).toFixed(3)} ${hue})`,
      "--primary-200": `oklch(${Math.min(0.94, 0.9 + bias * 0.3).toFixed(3)} ${Math.max(0.05, primaryC * 0.45).toFixed(3)} ${hue})`,
      "--primary-300": `oklch(${Math.min(0.9, 0.85 + bias * 0.3).toFixed(3)} ${Math.max(0.06, primaryC * 0.55).toFixed(3)} ${hue})`,
      "--primary-400": `oklch(${Math.min(0.78, primaryL + 0.12).toFixed(3)} ${(primaryC * 0.85).toFixed(3)} ${hue})`,
      "--primary-500": primary,
      "--primary-600": `oklch(${Math.max(0.28, primaryL - 0.12).toFixed(3)} ${Math.min(0.26, primaryC + 0.02).toFixed(3)} ${hue})`,
      "--primary": primary,
      "--primary-foreground": fg,
      "--primary-hover": `oklch(${Math.min(0.78, primaryL + 0.1).toFixed(3)} ${(primaryC * 0.9).toFixed(3)} ${hue})`,
    }
  }
  return {
    "--primary-100": `oklch(${Math.max(0.22, 0.32 + bias).toFixed(3)} 0.14 ${hue})`,
    "--primary-200": `oklch(${Math.max(0.26, 0.36 + bias).toFixed(3)} 0.16 ${hue})`,
    "--primary-300": `oklch(${Math.max(0.3, 0.42 + bias).toFixed(3)} 0.18 ${hue})`,
    "--primary-400": `oklch(${Math.max(0.36, 0.48 + bias).toFixed(3)} 0.2 ${hue})`,
    "--primary-500": primary,
    "--primary-600": `oklch(${Math.min(0.75, 0.62 + bias).toFixed(3)} 0.2 ${hue})`,
    "--primary": primary,
    "--primary-foreground": fg,
    "--primary-hover": `oklch(${Math.max(0.36, 0.48 + bias).toFixed(3)} 0.2 ${hue})`,
  }
}

/** Explicit radius ladder so `var(--radius-xl)` updates even if calc inheritance is sticky. */
export function previewRadiusVars(base: string): Record<string, string> {
  return {
    "--radius": base,
    "--radius-sm": `calc(${base} - 4px)`,
    "--radius-md": `calc(${base} - 2px)`,
    "--radius-lg": base,
    "--radius-xl": `calc(${base} + 4px)`,
    "--radius-2xl": `calc(${base} + 8px)`,
    "--radius-3xl": `calc(${base} + 12px)`,
    "--radius-4xl": `calc(${base} + 16px)`,
  }
}

export function radiusValue(id: RadiusPresetId): string {
  return RADIUS_PRESETS.find((p) => p.id === id)?.value ?? "0.45rem"
}
