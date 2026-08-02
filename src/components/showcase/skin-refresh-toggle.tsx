/**
 * @deprecated Look lives in Appearance (Default / Ledger). Prefer
 * `applyLookStylesheet` from `@/lib/appearance/look-skin`.
 */
export {
  applyLookStylesheet,
  lookFromStorage,
  persistLook,
  LOOK_STORAGE_KEY as STORAGE_KEY,
} from "@/lib/appearance/look-skin"

import { useEffect, useState } from "react"
import { Button } from "@nqlib/nqui"
import {
  applyLookStylesheet,
  lookFromStorage,
  persistLook,
  type LookId,
} from "@/lib/appearance/look-skin"

/** Legacy A/B toggle — Appearance Look presets replace this in ThemeControls. */
export function SkinRefreshToggle({ className }: { className?: string }) {
  const [look, setLook] = useState<LookId>("default")

  useEffect(() => {
    const initial = lookFromStorage()
    setLook(initial)
    applyLookStylesheet(initial)
  }, [])

  const toggle = () => {
    const next: LookId = look === "ledger" ? "default" : "ledger"
    setLook(next)
    persistLook(next)
    applyLookStylesheet(next)
  }

  return (
    <Button
      type="button"
      variant={look === "ledger" ? "secondary" : "ghost"}
      size="sm"
      className={className}
      aria-pressed={look === "ledger"}
      title="Prefer Appearance → Look (Default / Ledger)"
      onClick={toggle}
    >
      {look === "ledger" ? "Look: Ledger" : "Look: Default"}
    </Button>
  )
}
