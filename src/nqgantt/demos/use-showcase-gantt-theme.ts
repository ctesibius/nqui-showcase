import { useEffect } from "react"

/**
 * Dev-only: switch the showcase's gantt override layer off, so a gantt can be
 * judged as the package alone renders it.
 *
 * `gantt-theme.css` is a consumer layer — bar tokens, the group rail, row
 * hover, scrollbars, the weekend hatch, grip geometry. Every one of those is a
 * patch over something `@nqlib/nqgantt` doesn't do yet, which means a lab
 * running with it on cannot answer "did the upstream fix actually land?" — the
 * override would paper over a regression just as convincingly as a fix.
 *
 * Vite serves each CSS module as its own `<style data-vite-dev-id="…">`, so in
 * dev the whole layer can be disabled at the stylesheet level. That is a dev
 * trick and deliberately so: this only ever runs from `/gantt-lab`, which is
 * itself stripped from production builds. In a bundled build the rules are
 * merged into one asset and there is nothing to single out — the toggle simply
 * finds no sheet and does nothing.
 */
export function useShowcaseGanttTheme(enabled: boolean) {
  useEffect(() => {
    const sheets = [
      ...document.querySelectorAll<HTMLStyleElement>(
        'style[data-vite-dev-id*="gantt-theme.css"]',
      ),
    ]
    for (const sheet of sheets) sheet.disabled = !enabled
    return () => {
      for (const sheet of sheets) sheet.disabled = false
    }
  }, [enabled])
}
