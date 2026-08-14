import { useEffect, type RefObject } from "react"

/**
 * Showcase-only: light the whole row, both halves of the split.
 *
 * Tasks pair by `data-focus-id` / `data-gantt-timeline-row`. Group header
 * bands pair by `data-gantt-group-id` (sidebar `[data-gantt-group-band]` ↔
 * timeline slot). Timeline slots are zero-width bar anchors, so the wash is
 * a `::before` sized with `--gantt-timeline-width`.
 */

const HOVER_ATTR = "data-gantt-row-hover"
const SLOT_SELECTOR =
  "[data-gantt-sidebar-row], [data-gantt-timeline-row], [data-gantt-group-band]"
const ROW_SELECTOR = `${SLOT_SELECTOR}, [data-focus-id]`
const HEADER_SELECTOR =
  "[data-gantt-timeline-header-cell], [data-gantt-sidebar-header-cell]"

function focusIdOf(el: Element): string | null {
  return (
    el.getAttribute("data-gantt-timeline-row") ||
    el.getAttribute("data-focus-id") ||
    el.querySelector("[data-focus-id]")?.getAttribute("data-focus-id") ||
    null
  )
}

function groupIdOf(el: Element): string | null {
  return el.getAttribute("data-gantt-group-id")
}

function canonicalSlot(el: Element): Element {
  return el.closest(SLOT_SELECTOR) ?? el
}

function rowAtY(
  gantt: HTMLElement,
  clientY: number,
  inSidebar: boolean,
): Element | null {
  const selector = inSidebar
    ? "[data-gantt-sidebar-row], [data-gantt-group-band]"
    : "[data-gantt-timeline-row], [data-focus-id]:not([data-gantt-sidebar-row])"
  for (const other of gantt.querySelectorAll(selector)) {
    const r = other.getBoundingClientRect()
    if (r.height <= 0) continue
    if (clientY >= r.top && clientY < r.bottom) return canonicalSlot(other)
  }
  return null
}

function resolveRow(
  gantt: HTMLElement,
  target: Element,
  clientX: number,
  clientY: number,
): Element | null {
  if (target.closest(HEADER_SELECTOR)) return null

  const hit = target.closest(ROW_SELECTOR)
  if (hit && gantt.contains(hit)) return canonicalSlot(hit)

  const nested = target.querySelector(
    "[data-gantt-timeline-row], [data-focus-id], [data-gantt-group-band]",
  )
  if (nested && gantt.contains(nested)) return canonicalSlot(nested)

  const sidebar = gantt.querySelector('[data-roadmap-ui="gantt-sidebar"]')
  const inSidebar =
    sidebar instanceof HTMLElement &&
    clientX < sidebar.getBoundingClientRect().right
  return rowAtY(gantt, clientY, inSidebar)
}

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

    const syncTimelineWidth = () => {
      if (!gantt) return
      const sidebar = gantt.querySelector('[data-roadmap-ui="gantt-sidebar"]')
      if (sidebar instanceof HTMLElement) {
        gantt.style.setProperty(
          "--gantt-timeline-width",
          `${Math.max(0, gantt.scrollWidth - sidebar.offsetWidth)}px`,
        )
      }
    }

    const markGroup = (id: string) => {
      if (!gantt) return
      const escaped = CSS.escape(id)
      for (const el of gantt.querySelectorAll(
        `[data-gantt-group-id="${escaped}"]`,
      )) {
        mark(el)
      }
    }

    const markPair = (id: string) => {
      if (!gantt) return
      const escaped = CSS.escape(id)
      for (const el of gantt.querySelectorAll(
        `[data-gantt-sidebar-row][data-focus-id="${escaped}"]`,
      )) {
        mark(el)
      }
      const slots = gantt.querySelectorAll(`[data-gantt-timeline-row="${escaped}"]`)
      if (slots.length > 0) {
        for (const el of slots) mark(el)
        return
      }
      for (const el of gantt.querySelectorAll(
        `[data-focus-id="${escaped}"]:not([data-gantt-sidebar-row])`,
      )) {
        mark(el)
      }
    }

    const onPointerMove = (event: PointerEvent) => {
      if (!gantt) return
      const target = event.target
      if (!(target instanceof Element)) return

      const row = resolveRow(gantt, target, event.clientX, event.clientY)
      if (row === lastRow) return
      clear()
      if (!row || !gantt.contains(row)) return

      lastRow = row
      syncTimelineWidth()

      const groupId = groupIdOf(row)
      if (groupId) {
        markGroup(groupId)
        if (!row.hasAttribute(HOVER_ATTR)) mark(row)
        return
      }

      const id = focusIdOf(row)
      if (id) {
        markPair(id)
        if (!row.hasAttribute(HOVER_ATTR)) mark(row)
        return
      }

      mark(row)
      const inSidebar = Boolean(
        row.closest('[data-roadmap-ui="gantt-sidebar"]'),
      )
      const box = row.getBoundingClientRect()
      const centre = box.top + box.height / 2
      const others = gantt.querySelectorAll(
        inSidebar
          ? "[data-gantt-timeline-row], [data-focus-id]:not([data-gantt-sidebar-row])"
          : "[data-gantt-sidebar-row], [data-gantt-group-band]",
      )
      for (const other of others) {
        const r = other.getBoundingClientRect()
        if (centre >= r.top && centre < r.bottom) {
          mark(canonicalSlot(other))
          break
        }
      }
    }

    const bind = (el: HTMLElement) => {
      gantt = el
      syncTimelineWidth()
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
