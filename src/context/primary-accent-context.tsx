/* eslint-disable react-refresh/only-export-components -- theme tokens: provider co-locates presets, CSS helpers, and hooks by design. */
import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { useTheme } from "next-themes"
import {
  LOOK_PAPER_DEFAULTS,
  SURFACE_VARS,
  contrastHintOk,
  deriveSurfaceVars,
  paperForMode,
  type LookId,
  type PaperSeed,
  type ThemeMode,
} from "../lib/appearance/derive-surface"
import {
  applyLookStylesheet,
  lookFromStorage,
  persistLook,
} from "../lib/appearance/look-skin"
import {
  downloadThemeCss,
  serializeThemeCss,
  serializeThemePrompt,
} from "../lib/appearance/serialize-theme"
import {
  ACCENT_CHIPS,
  RADIUS_PRESETS,
  previewMenuAccentVars,
  previewPrimaryVars,
  previewRadiusVars,
  radiusValue,
  type RadiusPresetId,
} from "../lib/appearance/token-preview"

export {
  ACCENT_CHIPS,
  RADIUS_PRESETS,
  previewMenuAccentVars,
  previewPrimaryVars,
  previewRadiusVars,
  type RadiusPresetId,
}

const STORAGE_APPEARANCE = "nqui-showcase:appearance-v1"
const STORAGE_ACCENT = "nqui-showcase:accent-hue"
const STORAGE_RADIUS = "nqui-showcase:radius-preset"

export const LOOK_PRESETS: ReadonlyArray<{
  id: LookId
  label: string
  description: string
}> = [
  {
    id: "default",
    label: "Default",
    description: "Published nqui 0.7 soft cream surfaces",
  },
  {
    id: "ledger",
    label: "Ledger",
    description: "Showcase preset — paper on bench, graphite folds",
  },
] as const

const PRIMARY_VARS = [
  "--primary-100",
  "--primary-200",
  "--primary-300",
  "--primary-400",
  "--primary-500",
  "--primary-600",
  "--primary",
  "--primary-foreground",
  "--primary-hover",
] as const

/**
 * Menu highlight tokens. nqui menus (dropdown, menubar, context-menu, select,
 * command, sidebar) style `data-[highlighted]` / `aria-selected` from
 * `--accent`, never `--primary` — so the accent picker cannot reach them
 * unless we tint these too.
 */
const MENU_ACCENT_VARS = [
  "--accent",
  "--accent-foreground",
  "--sidebar-accent",
  "--sidebar-accent-foreground",
] as const

const RADIUS_VARS = [
  "--radius",
  "--radius-sm",
  "--radius-md",
  "--radius-lg",
  "--radius-xl",
  "--radius-2xl",
  "--radius-3xl",
  "--radius-4xl",
] as const

export type AppearanceState = {
  look: LookId
  accentHue: number | null
  /** 0 = outer (richest) … 4 = inner on the brand wheel. Ignored when accentHue is null. */
  accentShade: number
  radiusPreset: RadiusPresetId
  /** null = kit look only (no paper overrides). */
  paper: PaperSeed | null
  /** Mode the paper seed was authored in (for cross-mode remap). */
  paperMode: ThemeMode | null
  /** Scales ΔL from background → muted/border/… (1 = look default). */
  ladderStrength: number
  /**
   * Shifts the monochromatic shade scale darker (−) or lighter (+).
   * Applied to wheel rings and primary L (same hue).
   */
  shadeBias: number
}

function themeModeFromResolved(resolved: string | undefined): ThemeMode {
  return resolved === "dark" ? "dark" : "light"
}

function clearHtmlVars(names: readonly string[]) {
  const root = document.documentElement
  for (const name of names) root.style.removeProperty(name)
}

function applyHtmlVars(vars: Record<string, string>) {
  const root = document.documentElement
  for (const [name, value] of Object.entries(vars)) {
    root.style.setProperty(name, value)
  }
}

function paperEqual(a: PaperSeed | null, b: PaperSeed | null) {
  if (a === null && b === null) return true
  if (!a || !b) return false
  return a.h === b.h && a.c === b.c && a.l === b.l
}

export function appearanceEqual(a: AppearanceState, b: AppearanceState) {
  return (
    a.look === b.look &&
    a.accentHue === b.accentHue &&
    a.accentShade === b.accentShade &&
    a.radiusPreset === b.radiusPreset &&
    paperEqual(a.paper, b.paper) &&
    a.paperMode === b.paperMode &&
    a.ladderStrength === b.ladderStrength &&
    a.shadeBias === b.shadeBias
  )
}

function defaultAppearance(): AppearanceState {
  return {
    look: typeof window === "undefined" ? "default" : lookFromStorage(),
    accentHue: null,
    accentShade: 2,
    radiusPreset: "default",
    paper: null,
    paperMode: null,
    ladderStrength: 1,
    shadeBias: 0,
  }
}

function readStoredAccent(): number | null {
  try {
    const raw = localStorage.getItem(STORAGE_ACCENT)
    if (raw === null || raw === "" || raw === "null") return null
    const n = Number(raw)
    return Number.isFinite(n) ? n : null
  } catch {
    return null
  }
}

function readStoredRadius(): RadiusPresetId {
  try {
    const raw = localStorage.getItem(STORAGE_RADIUS)
    if (raw && RADIUS_PRESETS.some((p) => p.id === raw)) return raw as RadiusPresetId
  } catch {
    /* ignore */
  }
  return "default"
}

function readSavedAppearance(): AppearanceState {
  const base = defaultAppearance()
  try {
    const raw = localStorage.getItem(STORAGE_APPEARANCE)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<AppearanceState>
      return {
        look: parsed.look === "ledger" || parsed.look === "default" ? parsed.look : base.look,
        accentHue:
          typeof parsed.accentHue === "number"
            ? parsed.accentHue
            : parsed.accentHue === null
              ? null
              : base.accentHue,
        accentShade:
          typeof parsed.accentShade === "number" &&
          parsed.accentShade >= 0 &&
          parsed.accentShade <= 4
            ? parsed.accentShade
            : 2,
        radiusPreset:
          parsed.radiusPreset && RADIUS_PRESETS.some((p) => p.id === parsed.radiusPreset)
            ? parsed.radiusPreset
            : base.radiusPreset,
        paper:
          parsed.paper &&
          typeof parsed.paper.h === "number" &&
          typeof parsed.paper.c === "number" &&
          typeof parsed.paper.l === "number"
            ? parsed.paper
            : null,
        paperMode:
          parsed.paperMode === "light" || parsed.paperMode === "dark"
            ? parsed.paperMode
            : parsed.paper
              ? "light"
              : null,
        ladderStrength:
          typeof parsed.ladderStrength === "number" &&
          parsed.ladderStrength >= 0.5 &&
          parsed.ladderStrength <= 1.6
            ? parsed.ladderStrength
            : 1,
        shadeBias:
          typeof parsed.shadeBias === "number" &&
          parsed.shadeBias >= -0.14 &&
          parsed.shadeBias <= 0.14
            ? parsed.shadeBias
            : 0,
      }
    }
  } catch {
    /* ignore */
  }
  // Migrate legacy keys
  return {
    look: lookFromStorage(),
    accentHue: readStoredAccent(),
    accentShade: 2,
    radiusPreset: readStoredRadius(),
    paper: null,
    paperMode: null,
    ladderStrength: 1,
    shadeBias: 0,
  }
}

function persistSaved(state: AppearanceState) {
  try {
    localStorage.setItem(STORAGE_APPEARANCE, JSON.stringify(state))
    persistLook(state.look)
    if (state.accentHue === null) localStorage.removeItem(STORAGE_ACCENT)
    else localStorage.setItem(STORAGE_ACCENT, String(state.accentHue))
    if (state.radiusPreset === "default") localStorage.removeItem(STORAGE_RADIUS)
    else localStorage.setItem(STORAGE_RADIUS, state.radiusPreset)
  } catch {
    /* ignore */
  }
}

function applyAppearance(state: AppearanceState, mode: ThemeMode) {
  applyLookStylesheet(state.look)

  const paperDrivesSurface = Boolean(state.paper && state.paperMode)
  if (state.paper && state.paperMode) {
    const seed = paperForMode(state.paper, state.look, state.paperMode, mode)
    applyHtmlVars(
      deriveSurfaceVars(seed, state.look, mode, state.ladderStrength),
    )
  } else {
    clearHtmlVars(SURFACE_VARS)
  }

  if (state.accentHue === null) {
    clearHtmlVars(PRIMARY_VARS)
    // deriveSurfaceVars owns the accent keys when paper is active; clearing
    // here would wipe the values just applied above.
    if (!paperDrivesSurface) clearHtmlVars(MENU_ACCENT_VARS)
  } else {
    applyHtmlVars(
      previewPrimaryVars(
        state.accentHue,
        mode,
        state.accentShade,
        state.shadeBias,
      ),
    )
    // After the surface pass on purpose: an explicit accent hue outranks
    // paper's neutral accent derivation.
    applyHtmlVars(previewMenuAccentVars(state.accentHue, mode))
  }

  if (state.radiusPreset === "default") {
    clearHtmlVars(RADIUS_VARS)
  } else {
    applyHtmlVars(previewRadiusVars(radiusValue(state.radiusPreset)))
  }
}

type ThemeTokensContextValue = {
  draft: AppearanceState
  saved: AppearanceState
  isDirty: boolean
  contrastOk: boolean
  themeMode: ThemeMode
  setLook: (look: LookId) => void
  setAccentHue: (hue: number | null, shade?: number) => void
  setAccentShade: (shade: number) => void
  setShadeBias: (bias: number) => void
  setRadiusPreset: (id: RadiusPresetId) => void
  setPaper: (paper: PaperSeed | null) => void
  setLadderStrength: (n: number) => void
  enableCustomize: () => void
  apply: () => void
  reset: () => void
  copyCss: () => Promise<void>
  downloadCss: () => void
  copyAiPrompt: () => Promise<void>
  /** @deprecated Prefer draft.accentHue */
  accentHue: number | null
  /** @deprecated Prefer draft.radiusPreset */
  radiusPreset: RadiusPresetId
}

const ThemeTokensContext = createContext<ThemeTokensContextValue | null>(null)

export function ThemeTokensProvider({ children }: { children: ReactNode }) {
  const [saved, setSaved] = useState<AppearanceState>(() =>
    typeof window === "undefined" ? defaultAppearance() : readSavedAppearance(),
  )
  const [draft, setDraft] = useState<AppearanceState>(() =>
    typeof window === "undefined" ? defaultAppearance() : readSavedAppearance(),
  )
  const { resolvedTheme } = useTheme()
  const themeMode = useMemo(() => themeModeFromResolved(resolvedTheme), [resolvedTheme])

  const isDirty = !appearanceEqual(draft, saved)

  const contrastOk = useMemo(() => {
    if (!draft.paper || !draft.paperMode) return true
    const seed = paperForMode(draft.paper, draft.look, draft.paperMode, themeMode)
    return contrastHintOk(seed, draft.look, themeMode)
  }, [draft.paper, draft.paperMode, draft.look, themeMode])

  const setLook = useCallback((look: LookId) => {
    setDraft((d) => ({
      ...d,
      look,
      // Switching look clears paper customize so kit CSS leads.
      paper: null,
      paperMode: null,
    }))
  }, [])

  const setAccentHue = useCallback((hue: number | null, shade?: number) => {
    setDraft((d) => ({
      ...d,
      accentHue: hue,
      accentShade: hue === null ? d.accentShade : (shade ?? d.accentShade),
    }))
  }, [])

  const setAccentShade = useCallback((shade: number) => {
    setDraft((d) => ({
      ...d,
      accentShade: Math.max(0, Math.min(4, shade)),
    }))
  }, [])

  const setShadeBias = useCallback((bias: number) => {
    setDraft((d) => ({
      ...d,
      shadeBias: Math.max(-0.14, Math.min(0.14, bias)),
    }))
  }, [])

  const setRadiusPreset = useCallback((id: RadiusPresetId) => {
    setDraft((d) => ({ ...d, radiusPreset: id }))
  }, [])

  const setPaper = useCallback((paper: PaperSeed | null) => {
    setDraft((d) => ({
      ...d,
      paper,
      paperMode: paper ? (d.paperMode ?? themeMode) : null,
    }))
  }, [themeMode])

  const setLadderStrength = useCallback((n: number) => {
    setDraft((d) => ({
      ...d,
      ladderStrength: Math.min(1.6, Math.max(0.5, n)),
    }))
  }, [])

  const enableCustomize = useCallback(() => {
    setDraft((d) => {
      if (d.paper) return d
      return {
        ...d,
        paper: { ...LOOK_PAPER_DEFAULTS[d.look][themeMode] },
        paperMode: themeMode,
      }
    })
  }, [themeMode])

  // Keep paper seed in the active mode so sliders edit absolute L for what you see.
  useLayoutEffect(() => {
    setDraft((d) => {
      if (!d.paper || !d.paperMode || d.paperMode === themeMode) return d
      return {
        ...d,
        paper: paperForMode(d.paper, d.look, d.paperMode, themeMode),
        paperMode: themeMode,
      }
    })
  }, [themeMode])

  const apply = useCallback(() => {
    setSaved(draft)
    persistSaved(draft)
  }, [draft])

  const reset = useCallback(() => {
    const next: AppearanceState = {
      look: "default",
      accentHue: null,
      accentShade: 2,
      radiusPreset: "default",
      paper: null,
      paperMode: null,
      ladderStrength: 1,
      shadeBias: 0,
    }
    setDraft(next)
    setSaved(next)
    try {
      localStorage.removeItem(STORAGE_APPEARANCE)
      localStorage.removeItem(STORAGE_ACCENT)
      localStorage.removeItem(STORAGE_RADIUS)
      persistLook("default")
    } catch {
      /* ignore */
    }
  }, [])

  const copyCss = useCallback(async () => {
    await navigator.clipboard.writeText(serializeThemeCss(draft))
  }, [draft])

  const downloadCss = useCallback(() => {
    downloadThemeCss(serializeThemeCss(draft))
  }, [draft])

  const copyAiPrompt = useCallback(async () => {
    await navigator.clipboard.writeText(serializeThemePrompt(draft))
  }, [draft])

  // Live preview: draft drives tokens. Apply only persists.
  useLayoutEffect(() => {
    applyAppearance(draft, themeMode)
  }, [draft, themeMode])

  const value = useMemo(
    () => ({
      draft,
      saved,
      isDirty,
      contrastOk,
      themeMode,
      setLook,
      setAccentHue,
      setAccentShade,
      setShadeBias,
      setRadiusPreset,
      setPaper,
      setLadderStrength,
      enableCustomize,
      apply,
      reset,
      copyCss,
      downloadCss,
      copyAiPrompt,
      accentHue: draft.accentHue,
      radiusPreset: draft.radiusPreset,
    }),
    [
      draft,
      saved,
      isDirty,
      contrastOk,
      themeMode,
      setLook,
      setAccentHue,
      setAccentShade,
      setShadeBias,
      setRadiusPreset,
      setPaper,
      setLadderStrength,
      enableCustomize,
      apply,
      reset,
      copyCss,
      downloadCss,
      copyAiPrompt,
    ],
  )

  return (
    <ThemeTokensContext.Provider value={value}>
      <div className="min-h-dvh">{children}</div>
    </ThemeTokensContext.Provider>
  )
}

/** @deprecated Prefer ThemeTokensProvider — alias kept for main.tsx during rename. */
export const PrimaryAccentProvider = ThemeTokensProvider

export function useThemeTokens() {
  const ctx = useContext(ThemeTokensContext)
  if (!ctx) {
    throw new Error("useThemeTokens must be used within ThemeTokensProvider")
  }
  return ctx
}

/** Alias for consumers that only need accent hue (e.g. pixel-globe-hero). */
export function usePrimaryAccent() {
  const { accentHue, setAccentHue } = useThemeTokens()
  return { accentHue, setAccentHue }
}

export type { LookId, PaperSeed }
