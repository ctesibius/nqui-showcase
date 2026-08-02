/**
 * Theme Studio export — serialize AppearanceState to consumer-ready CSS.
 * Showcase-only; does not change @nqlib/nqui.
 */

import {
  LOOK_PAPER_DEFAULTS,
  deriveSurfaceVars,
  paperForMode,
  type LookId,
  type PaperSeed,
} from "./derive-surface"
import {
  previewMenuAccentVars,
  previewPrimaryVars,
  previewRadiusVars,
  radiusValue,
  type RadiusPresetId,
} from "./token-preview"

export const THEME_CSS_FILENAME = "colors.css"

/** Minimal draft shape for serialization (mirrors AppearanceState). */
export type ThemeExportDraft = {
  look: LookId
  accentHue: number | null
  accentShade: number
  radiusPreset: RadiusPresetId
  paper: PaperSeed | null
  paperMode: "light" | "dark" | null
  ladderStrength: number
  shadeBias: number
}

function cssBlock(vars: Record<string, string>): string {
  return Object.entries(vars)
    .map(([k, v]) => `  ${k}: ${v};`)
    .join("\n")
}

function mergeVars(
  ...parts: Array<Record<string, string> | null | undefined>
): Record<string, string> {
  const out: Record<string, string> = {}
  for (const part of parts) {
    if (!part) continue
    Object.assign(out, part)
  }
  return out
}

function modeVars(
  draft: ThemeExportDraft,
  mode: "light" | "dark",
): Record<string, string> {
  const lightSeed = draft.paper
    ? paperForMode(draft.paper, draft.look, draft.paperMode ?? "light", "light")
    : LOOK_PAPER_DEFAULTS[draft.look].light
  const darkSeed = draft.paper
    ? paperForMode(draft.paper, draft.look, draft.paperMode ?? "light", "dark")
    : LOOK_PAPER_DEFAULTS[draft.look].dark
  const seed = mode === "light" ? lightSeed : darkSeed

  // Always export both mode surface ladders so the file replaces colors.css fully.
  // When paper is null, still emit look defaults so consumers get an explicit file.
  const surfaces = deriveSurfaceVars(
    seed,
    draft.look,
    mode,
    draft.ladderStrength,
  )

  const primary =
    draft.accentHue === null
      ? null
      : mergeVars(
          previewPrimaryVars(
            draft.accentHue,
            mode,
            draft.accentShade,
            draft.shadeBias,
          ),
          previewMenuAccentVars(draft.accentHue, mode),
        )

  const radius =
    draft.radiusPreset === "default"
      ? null
      : previewRadiusVars(radiusValue(draft.radiusPreset))

  // Radius is mode-independent; include once in :root only (caller merges).
  return mergeVars(surfaces, primary, mode === "light" ? radius : null)
}

/**
 * Full `:root` / `.dark` CSS matching live Theme Studio preview.
 * Paste after `@import "@nqlib/nqui/styles"` or replace `nqui/colors.css`.
 */
export function serializeThemeCss(draft: ThemeExportDraft): string {
  const light = modeVars(draft, "light")
  const dark = modeVars(draft, "dark")

  const lookNote =
    draft.look === "ledger"
      ? "\n * Look: Ledger (showcase kit skin). Token overrides below are derived under that look;\n * Ledger stylesheet itself is not part of @nqlib/nqui — ship these vars only.\n *"
      : ""

  return `/**
 * nqui Theme Studio export — ${THEME_CSS_FILENAME}
 *
 * After \`npx @nqlib/nqui init-css\`, replace (or import after) nqui/colors.css.
 * Paste after @import "@nqlib/nqui/styles". OKLCH only — do not invent new tokens.
 * Density: use component size props, not token size overrides.
 *${lookNote}
 */
:root {
${cssBlock(light)}
}

.dark {
${cssBlock(dark)}
}
`
}

/** Short AI / agent prompt + CSS blob for clipboard. */
export function serializeThemePrompt(draft: ThemeExportDraft): string {
  const css = serializeThemeCss(draft)
  const ledger =
    draft.look === "ledger"
      ? `\nNote: The designer used the showcase "Ledger" look. Apply the CSS variables only — do not assume a Ledger package stylesheet exists in @nqlib/nqui.\n`
      : ""

  return `You are updating an app that uses @nqlib/nqui.

Task: apply the brand theme below as CSS custom properties.

Steps:
1. If needed, run \`npx @nqlib/nqui init-css\`.
2. Replace the contents of \`nqui/colors.css\` (or create it) with the CSS block.
3. Ensure the app CSS imports \`@nqlib/nqui/styles\` then \`./nqui/colors.css\` (or equivalent).
4. Keep OKLCH values as-is. Do not invent new token names. Do not change control heights via tokens — use size props for density.
5. Do not override component CSS with !important; tokens only.
${ledger}
--- colors.css ---
${css}`
}

export function downloadThemeCss(css: string, filename = THEME_CSS_FILENAME) {
  const blob = new Blob([css], { type: "text/css;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.rel = "noopener"
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
