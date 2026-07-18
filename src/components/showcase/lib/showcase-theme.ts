/**
 * Showcase theme helpers — next-themes ids: `light` | `dark`.
 * `light` = warm paper (:root / html.light); `dark` = .dark.
 */

export const SHOWCASE_THEME_CYCLE = ["light", "dark"] as const

export type ShowcaseThemeId = (typeof SHOWCASE_THEME_CYCLE)[number]

export function isShowcaseLightBucket(theme: string | undefined): boolean {
  if (!theme) return true
  if (theme === "dark") return false
  return theme === "light"
}

export function getShowcaseThemeLabel(theme: string | undefined): string {
  switch (theme) {
    case "dark":
      return "Dark"
    case "light":
      return "Light"
    case "system":
      return "Light"
    default:
      return "Light"
  }
}

/** Single control cycles: light → dark → light */
export function nextShowcaseTheme(current: string | undefined): ShowcaseThemeId {
  const t = (current || "light") as string
  const i = SHOWCASE_THEME_CYCLE.indexOf(t as ShowcaseThemeId)
  const from = i === -1 ? 0 : i
  return SHOWCASE_THEME_CYCLE[(from + 1) % SHOWCASE_THEME_CYCLE.length]!
}
