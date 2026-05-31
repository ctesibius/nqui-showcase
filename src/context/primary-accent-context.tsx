import {
  createContext,
  useContext,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { useTheme } from "next-themes";

/** Accent chips: hue (deg) matches nqui primary scale shape in colors.css */
export const ACCENT_CHIPS = [
  { hue: 240, label: "Blue" },
  { hue: 280, label: "Violet" },
  { hue: 150, label: "Emerald" },
  { hue: 75, label: "Amber" },
  { hue: 350, label: "Rose" },
  { hue: 195, label: "Cyan" },
] as const;

type ThemeMode = "light" | "dark" | "mid";

function themeModeFromResolved(resolved: string | undefined): ThemeMode {
  if (resolved === "dark") return "dark";
  if (resolved === "mid") return "mid";
  return "light";
}

/** Override primary scale for the accent picker (ring stays nqui’s neutral token). */
export function previewPrimaryVars(hue: number, mode: ThemeMode): CSSProperties {
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
    } as CSSProperties;
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
  } as CSSProperties;
}

type PrimaryAccentContextValue = {
  accentHue: number;
  setAccentHue: (hue: number) => void;
};

const PrimaryAccentContext = createContext<PrimaryAccentContextValue | null>(null);

export function PrimaryAccentProvider({ children }: { children: ReactNode }) {
  const [accentHue, setAccentHue] = useState(240);
  const { resolvedTheme } = useTheme();
  const themeMode = useMemo(() => themeModeFromResolved(resolvedTheme), [resolvedTheme]);
  const previewStyle = useMemo(() => previewPrimaryVars(accentHue, themeMode), [accentHue, themeMode]);
  const value = useMemo(() => ({ accentHue, setAccentHue }), [accentHue]);

  return (
    <PrimaryAccentContext.Provider value={value}>
      <div className="min-h-dvh" style={previewStyle}>
        {children}
      </div>
    </PrimaryAccentContext.Provider>
  );
}

export function usePrimaryAccent() {
  const ctx = useContext(PrimaryAccentContext);
  if (!ctx) {
    throw new Error("usePrimaryAccent must be used within PrimaryAccentProvider");
  }
  return ctx;
}
