import type { ReactNode } from "react"
import { cn } from "@nqlib/nqui"

type LiquidGlassBarProps = {
  children: ReactNode
  className?: string
  /** Inner content gap etc. Set padding with `[--glass-pad:Npx]`, not `p-*`, so nested
   * segmented controls can stay concentric with the bar. */
  contentClassName?: string
  /** Token radius (default) vs explicit capsule. */
  shape?: "pill" | "rounded"
}

/**
 * Floating liquid-glass chrome. Reuses `.story-nav-pill` so fill / border /
 * sheen track `--background` / `--foreground` under Appearance + light/dark.
 *
 * Nested radius: a RadioGroup / TabsList inside the bar gets
 * --glass-inner-radius = bar radius − 1px border − --glass-pad, so its shell is
 * concentric with the bar (and its own pill follows via its inner-radius rule).
 */
export function LiquidGlassBar({
  children,
  className,
  contentClassName,
  shape = "rounded",
}: LiquidGlassBarProps) {
  return (
    <div
      className={cn(
        "story-nav-pill relative isolate inline-flex max-w-full items-center overflow-hidden",
        "rounded-[var(--glass-radius)]",
        shape === "pill" ? "[--glass-radius:9999px]" : "[--glass-radius:var(--radius)]",
        className,
      )}
    >
      <div
        className={cn(
          "relative z-[1] flex min-w-0 items-center gap-0.5 p-[var(--glass-pad)] [--glass-pad:4px]",
          "[--glass-inner-radius:max(0px,calc(var(--glass-radius)-1px-var(--glass-pad)))]",
          "[&_[data-slot=radio-group]]:[--radio-pill-radius:var(--glass-inner-radius)]",
          "[&_[data-slot=tabs-list]]:[--tabs-pill-radius:var(--glass-inner-radius)]",
          contentClassName,
        )}
      >
        {children}
      </div>
    </div>
  )
}
