import { useSyncExternalStore } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Moon01Icon, PaintBoardIcon, Sun01Icon } from "@hugeicons/core-free-icons"
import { useTheme } from "next-themes"
import {
  Button,
  RadioGroup,
  RadioGroupItem,
  cn,
} from "@nqlib/nqui"
import { contrastSlidingRadioGroupClass } from "@/components/contrast-sliding-segment"
import { useThemeStudio } from "@/context/theme-studio-context"
import { useThemeTokens } from "@/context/primary-accent-context"

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )
}

/**
 * Icon trigger for the app-wide floating Theme Studio.
 */
export function ThemeTokenSheet({
  className,
  pressed,
  embedded,
}: {
  className?: string
  pressed?: boolean
  /** Sit on liquid-glass chrome — drop opaque chip fill. */
  embedded?: boolean
}) {
  const { isDirty } = useThemeTokens()
  const { open, toggleStudio } = useThemeStudio()
  const active = pressed ?? open

  return (
    <Button
      type="button"
      size="icon"
      variant="ghost"
      className={cn(
        "size-7 shrink-0 rounded-full text-foreground",
        "transition-colors motion-safe:duration-[var(--duration-quick)]",
        embedded
          ? "border-transparent bg-transparent hover:bg-[color-mix(in_oklch,var(--accent)_70%,transparent)] hover:text-accent-foreground"
          : "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        active &&
          (embedded
            ? "bg-[color-mix(in_oklch,var(--foreground)_12%,transparent)] text-foreground"
            : "border-foreground bg-foreground text-background hover:bg-foreground hover:text-background"),
        className,
      )}
      aria-label="Open Theme Studio"
      aria-pressed={active}
      title="Theme Studio"
      onClick={toggleStudio}
    >
      <span className="relative">
        <HugeiconsIcon icon={PaintBoardIcon} className="size-4 h-4 w-4" strokeWidth={2} />
        {isDirty ? (
          <span
            className="absolute -right-0.5 -top-0.5 size-1.5 rounded-full bg-primary"
            aria-hidden
          />
        ) : null}
      </span>
    </Button>
  )
}

/** Light / dark with nqui sliding-pill RadioGroup (same motion as Tabs). */
function ThemeModeSwitch({
  className,
  embedded,
}: {
  className?: string
  embedded?: boolean
}) {
  const { setTheme, resolvedTheme } = useTheme()
  const isClient = useIsClient()
  const mode = resolvedTheme === "dark" ? "dark" : "light"

  return (
    <RadioGroup
      variant="sliding"
      value={isClient ? mode : "light"}
      onValueChange={(v) => {
        if (v === "light" || v === "dark") setTheme(v)
      }}
      aria-label="Color theme"
      className={contrastSlidingRadioGroupClass(
        cn(
          "min-h-7",
          embedded &&
            "border-[color-mix(in_oklch,var(--border)_45%,transparent)] bg-[color-mix(in_oklch,var(--muted)_35%,transparent)]",
          className,
        ),
      )}
    >
      <RadioGroupItem value="light" aria-label="Light theme">
        <HugeiconsIcon icon={Sun01Icon} className="size-4 h-4 w-4" strokeWidth={2} />
      </RadioGroupItem>
      <RadioGroupItem value="dark" aria-label="Dark theme">
        <HugeiconsIcon icon={Moon01Icon} className="size-4 h-4 w-4" strokeWidth={2} />
      </RadioGroupItem>
    </RadioGroup>
  )
}

/**
 * Theme Studio trigger + light/dark — panel is {@link ThemeStudioHost} (app-wide).
 */
export function ThemeControls({
  className,
  toggleClassName,
  embedded,
}: {
  className?: string
  /** Applied to the paintboard trigger (mode switch uses nqui size-7 chips). */
  toggleClassName?: string
  /** Transparent chips for use inside {@link LiquidGlassBar}. */
  embedded?: boolean
}) {
  return (
    <div className={cn("flex w-fit items-center gap-1.5", className)}>
      <ThemeTokenSheet className={toggleClassName} embedded={embedded} />
      <ThemeModeSwitch embedded={embedded} />
    </div>
  )
}
