import type { ReactNode } from "react"
import { cn } from "@nqlib/nqui"

type LiquidGlassBarProps = {
  children: ReactNode
  className?: string
  /** Inner content padding / gap. */
  contentClassName?: string
  /** Token radius (default) vs explicit capsule. */
  shape?: "pill" | "rounded"
}

/**
 * Floating liquid-glass chrome. Reuses `.story-nav-pill` so fill / border /
 * sheen track `--background` / `--foreground` under Appearance + light/dark.
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
        shape === "pill" ? "rounded-full" : "rounded-lg",
        className,
      )}
    >
      <div
        className={cn(
          "relative z-[1] flex min-w-0 items-center gap-0.5 p-1",
          contentClassName,
        )}
      >
        {children}
      </div>
    </div>
  )
}
