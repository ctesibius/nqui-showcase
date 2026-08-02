import { HugeiconsIcon } from "@hugeicons/react"
import { Cancel01Icon, PaintBoardIcon } from "@hugeicons/core-free-icons"
import { Button, ScrollArea, cn } from "@nqlib/nqui"
import { AppearanceControls } from "@/components/showcase/appearance/appearance-controls"
import { StudioExportActions } from "@/components/showcase/appearance/studio-export-actions"
import { useThemeStudio } from "@/context/theme-studio-context"
import { useThemeTokens } from "@/context/primary-accent-context"

/**
 * Single app-wide floating Theme Studio panel.
 * Non-modal: page stays interactive so you can configure and observe live.
 */
export function ThemeStudioHost() {
  const { open, setOpen, toggleStudio } = useThemeStudio()
  const { isDirty } = useThemeTokens()

  return (
    <>
      {/* Always-available floating trigger (works on every route). */}
      <Button
        type="button"
        size="icon"
        variant="secondary"
        className={cn(
          "fixed bottom-4 right-4 z-[var(--z-modal)] size-11 rounded-full border border-border shadow-(--shadow-elevated)",
          "md:bottom-6 md:right-6",
          open && "pointer-events-none opacity-0",
        )}
        aria-label="Open Theme Studio"
        title="Theme Studio"
        onClick={toggleStudio}
      >
        <span className="relative">
          <HugeiconsIcon icon={PaintBoardIcon} className="size-5" strokeWidth={2} />
          {isDirty ? (
            <span
              className="absolute -right-0.5 -top-0.5 size-1.5 rounded-full bg-primary"
              aria-hidden
            />
          ) : null}
        </span>
      </Button>

      {open ? (
        <aside
          id="theme-studio-panel"
          role="dialog"
          aria-modal="false"
          aria-labelledby="theme-studio-title"
          className={cn(
            "fixed inset-y-2 right-2 z-[var(--z-modal)] flex w-[min(28rem,calc(100vw-1rem))] flex-col",
            "overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-(--shadow-modal)",
            "md:inset-y-3 md:right-3 md:w-[min(36rem,calc(100vw-1.5rem))]",
            "xl:w-[min(42rem,calc(100vw-2rem))]",
          )}
        >
          <header className="flex shrink-0 items-start justify-between gap-2 border-b border-border px-4 py-3">
            <div className="min-w-0 space-y-0.5 pr-8">
              <p className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                Floating
              </p>
              <h2
                id="theme-studio-title"
                className="text-base font-semibold tracking-tight"
              >
                Theme Studio
              </h2>
              <p className="text-[11px] text-muted-foreground">
                Live on this page — scroll and click while you tune. Export when ready.
              </p>
            </div>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="absolute right-2 top-2 size-7"
              aria-label="Close Theme Studio"
              onClick={() => setOpen(false)}
            >
              <HugeiconsIcon icon={Cancel01Icon} className="size-4" strokeWidth={2} />
            </Button>
          </header>

          <ScrollArea fadeMask={false} className="min-h-0 flex-1 px-3 py-4">
            <AppearanceControls variant="studio" />
          </ScrollArea>

          <footer className="shrink-0 border-t border-border bg-card/95 px-3 py-3 backdrop-blur-sm">
            <StudioExportActions compact showStatus={false} />
          </footer>
        </aside>
      ) : null}
    </>
  )
}
