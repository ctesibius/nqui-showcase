/* eslint-disable react-refresh/only-export-components -- theme tokens: provider co-locates presets, CSS helpers, and hooks by design. */
import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useTheme } from "next-themes";

const STORAGE_ACCENT = "nqui-showcase:accent-hue";
const STORAGE_RADIUS = "nqui-showcase:radius-preset";

/** Accent chips: hue (deg) matches nqui primary scale shape in colors.css */
export const ACCENT_CHIPS = [
  { hue: 240, label: "Blue" },
  { hue: 280, label: "Violet" },
  { hue: 150, label: "Emerald" },
  { hue: 75, label: "Amber" },
  { hue: 350, label: "Rose" },
  { hue: 195, label: "Cyan" },
] as const;

export type RadiusPresetId = "sharp" | "default" | "soft" | "pill";

export const RADIUS_PRESETS: ReadonlyArray<{
  id: RadiusPresetId;
  label: string;
  /** Base `--radius` value; sm/md/lg/xl derive via calc in nqui CSS. */
  value: string;
}> = [
  { id: "sharp", label: "Sharp", value: "0.15rem" },
  { id: "default", label: "Default", value: "0.45rem" },
  { id: "soft", label: "Soft", value: "0.75rem" },
  { id: "pill", label: "Pill", value: "1.1rem" },
] as const;

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
] as const;

const RADIUS_VARS = [
  "--radius",
  "--radius-sm",
  "--radius-md",
  "--radius-lg",
  "--radius-xl",
  "--radius-2xl",
  "--radius-3xl",
  "--radius-4xl",
] as const;

type ThemeMode = "light" | "dark" | "mid";

function themeModeFromResolved(resolved: string | undefined): ThemeMode {
  if (resolved === "dark") return "dark";
  if (resolved === "mid") return "mid";
  return "light";
}

/** Override primary scale for the accent picker (ring stays nqui’s neutral token). */
export function previewPrimaryVars(hue: number, mode: ThemeMode): Record<string, string> {
  const fg = "oklch(0.98 0 0)";
  const primary = `oklch(0.55 0.22 ${hue})`;
  if (mode === "light" || mode === "mid") {
    return {
      "--primary-100": `oklch(0.95 0.08 ${hue})`,
      "--primary-200": `oklch(0.9 0.1 ${hue})`,
      "--primary-300": `oklch(0.85 0.12 ${hue})`,
      "--primary-400": `oklch(0.72 0.18 ${hue})`,
      "--primary-500": primary,
      "--primary-600": `oklch(0.45 0.24 ${hue})`,
      "--primary": primary,
      "--primary-foreground": fg,
      "--primary-hover": `oklch(0.72 0.18 ${hue})`,
    };
  }
  return {
    "--primary-100": `oklch(0.32 0.14 ${hue})`,
    "--primary-200": `oklch(0.36 0.16 ${hue})`,
    "--primary-300": `oklch(0.42 0.18 ${hue})`,
    "--primary-400": `oklch(0.48 0.2 ${hue})`,
    "--primary-500": primary,
    "--primary-600": `oklch(0.62 0.2 ${hue})`,
    "--primary": primary,
    "--primary-foreground": fg,
    "--primary-hover": `oklch(0.48 0.2 ${hue})`,
  };
}

/** Explicit radius ladder so `var(--radius-xl)` (blocks cards) updates even if calc inheritance is sticky. */
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
  };
}

function readStoredAccent(): number | null {
  try {
    const raw = localStorage.getItem(STORAGE_ACCENT);
    if (raw === null || raw === "" || raw === "null") return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

function readStoredRadius(): RadiusPresetId {
  try {
    const raw = localStorage.getItem(STORAGE_RADIUS);
    if (raw && RADIUS_PRESETS.some((p) => p.id === raw)) return raw as RadiusPresetId;
  } catch {
    /* ignore */
  }
  return "default";
}

function radiusValue(id: RadiusPresetId): string {
  return RADIUS_PRESETS.find((p) => p.id === id)?.value ?? "0.45rem";
}

function clearHtmlVars(names: readonly string[]) {
  const root = document.documentElement;
  for (const name of names) root.style.removeProperty(name);
}

function applyHtmlVars(vars: Record<string, string>) {
  const root = document.documentElement;
  for (const [name, value] of Object.entries(vars)) {
    root.style.setProperty(name, value);
  }
}

type ThemeTokensContextValue = {
  /** null = the monochrome brand default (no hue override); a number picks an accent. */
  accentHue: number | null;
  setAccentHue: (hue: number | null) => void;
  radiusPreset: RadiusPresetId;
  setRadiusPreset: (id: RadiusPresetId) => void;
};

const ThemeTokensContext = createContext<ThemeTokensContextValue | null>(null);

export function ThemeTokensProvider({ children }: { children: ReactNode }) {
  const [accentHue, setAccentHueState] = useState<number | null>(() =>
    typeof window === "undefined" ? null : readStoredAccent(),
  );
  const [radiusPreset, setRadiusPresetState] = useState<RadiusPresetId>(() =>
    typeof window === "undefined" ? "default" : readStoredRadius(),
  );
  const { resolvedTheme } = useTheme();
  const themeMode = useMemo(() => themeModeFromResolved(resolvedTheme), [resolvedTheme]);

  const setAccentHue = useCallback((hue: number | null) => {
    setAccentHueState(hue);
    try {
      if (hue === null) localStorage.removeItem(STORAGE_ACCENT);
      else localStorage.setItem(STORAGE_ACCENT, String(hue));
    } catch {
      /* ignore quota / private mode */
    }
  }, []);

  const setRadiusPreset = useCallback((id: RadiusPresetId) => {
    setRadiusPresetState(id);
    try {
      if (id === "default") localStorage.removeItem(STORAGE_RADIUS);
      else localStorage.setItem(STORAGE_RADIUS, id);
    } catch {
      /* ignore */
    }
  }, []);

  // Apply on <html> so portaled UI (Sheet / Dialog / Dropdown) and page content
  // all see the same tokens — a wrapper div is outside portals.
  useLayoutEffect(() => {
    if (accentHue === null) {
      clearHtmlVars(PRIMARY_VARS);
    } else {
      applyHtmlVars(previewPrimaryVars(accentHue, themeMode));
    }

    if (radiusPreset === "default") {
      clearHtmlVars(RADIUS_VARS);
    } else {
      applyHtmlVars(previewRadiusVars(radiusValue(radiusPreset)));
    }
  }, [accentHue, radiusPreset, themeMode]);

  const value = useMemo(
    () => ({ accentHue, setAccentHue, radiusPreset, setRadiusPreset }),
    [accentHue, setAccentHue, radiusPreset, setRadiusPreset],
  );

  return (
    <ThemeTokensContext.Provider value={value}>
      <div className="min-h-dvh">{children}</div>
    </ThemeTokensContext.Provider>
  );
}

/** @deprecated Prefer ThemeTokensProvider — alias kept for main.tsx during rename. */
export const PrimaryAccentProvider = ThemeTokensProvider;

export function useThemeTokens() {
  const ctx = useContext(ThemeTokensContext);
  if (!ctx) {
    throw new Error("useThemeTokens must be used within ThemeTokensProvider");
  }
  return ctx;
}

/** Alias for consumers that only need accent hue (e.g. pixel-globe-hero). */
export function usePrimaryAccent() {
  const { accentHue, setAccentHue } = useThemeTokens();
  return { accentHue, setAccentHue };
}
