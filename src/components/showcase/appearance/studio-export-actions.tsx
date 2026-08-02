import { useState } from "react"
import { Button, cn } from "@nqlib/nqui"
import { THEME_CSS_FILENAME } from "@/lib/appearance/serialize-theme"
import { useThemeTokens } from "@/context/primary-accent-context"

type Feedback = "css" | "prompt" | null

/**
 * Theme Studio / sheet export strip — Reset, Copy CSS, Download, AI prompt, Apply.
 */
export function StudioExportActions({
  className,
  compact,
  showStatus = true,
}: {
  className?: string
  compact?: boolean
  showStatus?: boolean
}) {
  const { isDirty, apply, reset, copyCss, downloadCss, copyAiPrompt } =
    useThemeTokens()
  const [feedback, setFeedback] = useState<Feedback>(null)

  const flash = (kind: Feedback) => {
    setFeedback(kind)
    window.setTimeout(() => setFeedback(null), 1600)
  }

  const onCopyCss = async () => {
    try {
      await copyCss()
      flash("css")
    } catch {
      /* clipboard blocked */
    }
  }

  const onCopyPrompt = async () => {
    try {
      await copyAiPrompt()
      flash("prompt")
    } catch {
      /* clipboard blocked */
    }
  }

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2",
        compact ? "justify-end" : "justify-between",
        className,
      )}
    >
      {showStatus && !compact ? (
        <p className="text-xs text-muted-foreground">
          {isDirty ? "Unsaved draft — live preview on." : "Saved for this browser."}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={reset}>
          Reset
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onCopyCss}>
          {feedback === "css" ? "Copied" : "Copy CSS"}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={downloadCss}>
          Download {THEME_CSS_FILENAME}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onCopyPrompt}>
          {feedback === "prompt" ? "Copied" : "Copy AI prompt"}
        </Button>
        <Button type="button" size="sm" disabled={!isDirty} onClick={apply}>
          Apply
        </Button>
      </div>
    </div>
  )
}
