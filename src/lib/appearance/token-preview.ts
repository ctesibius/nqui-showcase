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

/** Accent chips: hue (deg) matches nqui primary scale shape in colors.css */
export const ACCENT_CHIPS = [
  { hue: 240, label: "Blue" },
  { hue: 280, label: "Violet" },
  { hue: 150, label: "Emerald" },
  { hue: 75, label: "Amber" },
  { hue: 350, label: "Rose" },
  { hue: 195, label: "Cyan" },
] as const

/** Override primary scale for the accent picker (ring stays nqui’s neutral token). */
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

/**
 * Menu highlight wash tinted toward the chosen hue.
 * Holds nqui's default accent lightness; swaps hue + modest chroma.
 */
export function previewMenuAccentVars(
  hue: number,
  mode: ThemeMode,
): Record<string, string> {
  if (mode === "light") {
    return {
      "--accent": `oklch(0.880 0.040 ${hue})`,
      "--accent-foreground": `oklch(0.260 0.045 ${hue})`,
      "--sidebar-accent": `oklch(0.940 0.028 ${hue})`,
      "--sidebar-accent-foreground": `oklch(0.230 0.045 ${hue})`,
    }
  }
  return {
    "--accent": `oklch(0.320 0.048 ${hue})`,
    "--accent-foreground": `oklch(0.930 0.014 ${hue})`,
    "--sidebar-accent": `oklch(0.290 0.040 ${hue})`,
    "--sidebar-accent-foreground": `oklch(0.930 0.014 ${hue})`,
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
