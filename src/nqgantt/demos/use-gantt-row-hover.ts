import { useEffect, type RefObject } from "react"

/**
 * Showcase-only: light the whole row, both halves of the split.
 *
 * The canvas is two columns that never meet in the DOM — a sticky sidebar of
 * `[data-gantt-sidebar-row]` and a timeline of `[data-focus-id]` — so `:hover`
 * on one can't reach the other, and the package only styles the sidebar half.
 * Reading a long row means tracking a label across a gap with nothing joining
 * it to its bar, which is precisely when a row highlight earns its keep.
 *
 * Pairing is geometric, not by id: the twin is whichever row on the far side
 * contains the hovered row's centre line. That survives grouping, collapse and
 * reordering, none of which keep two separate node lists in step.
 *
 * The timeline half needs `--gantt-timeline-width` because its body rows have
 * no layout width of their own (they're zero-width anchors for absolutely
 * positioned bars), so the band is drawn by CSS at an explicit width.
 */

const HOVER_ATTR = "data-gantt-row-hover"
const ROW_SELECTOR = "[data-gantt-sidebar-row], [data-focus-id]"

export function useGanttRowHover(rootRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    let gantt: HTMLElement | null = null
    let marked: Element[] = []
    let lastRow: Element | null = null

    const clear = () => {
      for (const el of marked) el.removeAttribute(HOVER_ATTR)
      marked = []
      lastRow = null
    }

    const mark = (el: Element) => {
      el.setAttribute(HOVER_ATTR, "")
      marked.push(el)
    }

    const onPointerMove = (event: PointerEvent) => {
      if (!gantt) return
      const target = event.target
      if (!(target instanceof Element)) return

      const row = target.closest(ROW_SELECTOR)
      if (row === lastRow) return
      clear()
      if (!row || !gantt.contains(row)) return

      lastRow = row
      mark(row)

      const sidebar = gantt.querySelector('[data-roadmap-ui="gantt-sidebar"]')
      if (sidebar instanceof HTMLElement) {
        gantt.style.setProperty(
          "--gantt-timeline-width",
          `${Math.max(0, gantt.scrollWidth - sidebar.offsetWidth)}px`,
        )
      }

      // Prefer the id: nqgantt puts the same `data-focus-id` on both halves of
      // a row, so the twin is a lookup rather than a search.
      const id = row.getAttribute("data-focus-id")
      if (id) {
        for (const twin of gantt.querySelectorAll(`[data-focus-id="${CSS.escape(id)}"]`)) {
          if (twin !== row) mark(twin)
        }
        return
      }

      // Group bands carry no focus id, so they still pair geometrically: the
      // row on the far side whose band contains this one's centre line. Note
      // the `:not([data-gantt-sidebar-row])` — sidebar rows now carry a focus
      // id too, and without it a sidebar row matches its own twin selector and
      // the timeline half is never reached.
      const inSidebar = row.hasAttribute("data-gantt-sidebar-row")
      const box = row.getBoundingClientRect()
      const centre = box.top + box.height / 2
      const others = gantt.querySelectorAll(
        inSidebar
          ? "[data-focus-id]:not([data-gantt-sidebar-row])"
          : "[data-gantt-sidebar-row]",
      )
      for (const other of others) {
        const r = other.getBoundingClientRect()
        if (centre >= r.top && centre < r.bottom) {
          mark(other)
          break
        }
      }
    }

    const bind = (el: HTMLElement) => {
      gantt = el
      el.addEventListener("pointermove", onPointerMove, { passive: true })
      el.addEventListener("pointerleave", clear, { passive: true })
    }

    const unbind = () => {
      gantt?.removeEventListener("pointermove", onPointerMove)
      gantt?.removeEventListener("pointerleave", clear)
      gantt?.style.removeProperty("--gantt-timeline-width")
      clear()
      gantt = null
    }

    const find = () => {
      const next = root.querySelector(".gantt")
      if (!(next instanceof HTMLElement) || next === gantt) return
      unbind()
      bind(next)
    }

    find()
    const mo = new MutationObserver(find)
    mo.observe(root, { childList: true, subtree: true })
    return () => {
      mo.disconnect()
      unbind()
    }
  }, [rootRef])
}
