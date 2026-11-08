import { useEffect, useState, type ReactNode } from "react"
import { FrostedGlass, cn } from "@nqlib/nqui"

/** Past this many pixels the page has content under the floating chrome. */
const SCROLLED_AT = 8

function usePageScrolled() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > SCROLLED_AT)
    update()
    window.addEventListener("scroll", update, { passive: true })
    return () => window.removeEventListener("scroll", update)
  }, [])
  return scrolled
}

type LiquidGlassBarProps = {
  children: ReactNode
  className?: string
  /** Inner layout. Padding comes from `[--glass-pad]` on the bar so the radius stays concentric. */
  contentClassName?: string
  /** Token radius (default) vs explicit capsule. */
  shape?: "pill" | "rounded"
}

/**
 * Floating glass chrome, composed from nqui the way `FrostedGlass` documents
 * it: the blur layer at `--z-background`, and a sibling row on top that
 * carries the tint, the top-edge sheen and the controls at `--z-content`.
 * Everything else is token utilities — no showcase CSS.
 *
 * The bar wraps nqui controls; it does not rewrite their radius. Sliding
 * RadioGroup / TabsList keep `--radius-md`; the bar's radius is that shell
 * plus its border and `--glass-pad`, so the control sits concentric.
 *
 * Once the page scrolls, `data-scrolled` deepens the tint and the float
 * shadow so links stay legible over tables and charts passing beneath.
 */
export function LiquidGlassBar({
  children,
  className,
  contentClassName,
  shape = "rounded",
}: LiquidGlassBarProps) {
  const scrolled = usePageScrolled()
  return (
    <div
      data-scrolled={scrolled}
      className={cn(
        "group/glass relative isolate inline-flex max-w-full items-center overflow-hidden",
        "rounded-[var(--glass-radius)] border [--glass-pad:4px]",
        shape === "pill"
          ? "[--glass-radius:9999px]"
          : "[--glass-radius:calc(var(--radius-md)+1px+var(--glass-pad))]",
        // Glass edge + float shadow; both firm up once content scrolls beneath.
        "border-[color-mix(in_oklch,var(--foreground)_10%,transparent)] dark:border-[color-mix(in_oklch,white_12%,transparent)]",
        "shadow-[0_2px_6px_-2px_color-mix(in_oklch,var(--foreground)_6%,transparent),0_12px_32px_-12px_color-mix(in_oklch,var(--foreground)_12%,transparent)]",
        "data-[scrolled=true]:border-[color-mix(in_oklch,var(--foreground)_14%,transparent)] dark:data-[scrolled=true]:border-[color-mix(in_oklch,white_16%,transparent)]",
        "data-[scrolled=true]:shadow-[0_2px_6px_-2px_color-mix(in_oklch,var(--foreground)_12%,transparent),0_12px_32px_-12px_color-mix(in_oklch,var(--foreground)_22%,transparent)]",
        "transition-[border-color,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
        className,
      )}
    >
      <FrostedGlass blur={28} borderRadius={0} className="z-[var(--z-background,0)]" />
      <div
        className={cn(
          "relative z-[var(--z-content,1)] flex min-w-0 items-center gap-0.5 rounded-[inherit] p-[var(--glass-pad)]",
          // Tint row: light enough to read as glass, denser once scrolled.
          "bg-[color-mix(in_oklch,var(--background)_38%,transparent)] dark:bg-[color-mix(in_oklch,var(--background)_32%,transparent)]",
          "group-data-[scrolled=true]/glass:bg-[color-mix(in_oklch,var(--background)_74%,transparent)] dark:group-data-[scrolled=true]/glass:bg-[color-mix(in_oklch,var(--background)_70%,transparent)]",
          // Solid when glass can't be drawn or isn't wanted.
          "supports-[not_(backdrop-filter:blur(1px))]:bg-background [@media(prefers-reduced-transparency:reduce)]:bg-background",
          // Top-edge sheen.
          "shadow-[inset_0_1px_0_0_color-mix(in_oklch,white_70%,transparent)] dark:shadow-[inset_0_1px_0_0_color-mix(in_oklch,white_18%,transparent)]",
          "transition-[background-color] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          contentClassName,
        )}
      >
        {children}
      </div>
    </div>
  )
}
