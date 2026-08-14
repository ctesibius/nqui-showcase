import { useEffect } from "react"

/**
 * Dev-only: switch the showcase's thin gantt overlay off, so a gantt can be
 * judged as `@nqlib/nqgantt/styles` alone.
 *
 * Package CSS now ships the lab look (Flat, Rail, tree, hover, pin). The
 * showcase sheet is only host hooks (`data-card-*`, deps-hide). Bare mode
 * disables that overlay stylesheet in Vite dev — the package theme stays on.
 *
 * Vite serves each CSS module as its own `<style data-vite-dev-id="…">`, so in
 * dev the overlay can be disabled at the stylesheet level. `/gantt-lab` is
 * stripped from production builds.
 */
export function useShowcaseGanttTheme(enabled: boolean) {
  useEffect(() => {
    const sheets = [
      ...document.querySelectorAll<HTMLStyleElement>(
        'style[data-vite-dev-id*="gantt-theme.css"]',
      ),
    ]
    // Prefer the showcase overlay path; never disable the package styles sheet.
    const overlay = sheets.filter((sheet) => {
      const id = sheet.getAttribute("data-vite-dev-id") ?? ""
      return id.includes("/src/nqgantt/gantt-theme.css")
    })
    const targets = overlay.length > 0 ? overlay : sheets
    for (const sheet of targets) sheet.disabled = !enabled
    return () => {
      for (const sheet of targets) sheet.disabled = false
    }
  }, [enabled])
}
