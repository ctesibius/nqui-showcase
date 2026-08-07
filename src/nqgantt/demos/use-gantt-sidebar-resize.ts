import { useEffect, type RefObject } from "react"

/**
 * Showcase-only: finish the sidebar resize handle.
 *
 * `@nqlib/nqgantt` renders the divider as `role="separator"` with `tabIndex=0`
 * but no key handling and no `aria-valuenow` — so it takes focus and then does
 * nothing. This hook completes the control host-side:
 *
 * - ← / → nudge the split; Shift jumps, Alt trims a pixel at a time
 * - Home / End snap to the package's own min / max
 * - Enter / Space fit the sidebar to its content (the double-click action)
 * - `aria-valuenow` tracks the real sidebar width for screen readers
 * - `data-gantt-resizing` marks an in-flight keyboard nudge so the thumb holds
 *
 * Keyboard steps replay the package's mouse path (mousedown → mousemove →
 * mouseup) rather than reaching into its state, so resize stays one code path
 * and `onResizeEnd` still fires once per nudge. Port upstream with the theme.
 */

const STEP = 16
const STEP_COARSE = 64
const STEP_FINE = 1
/** Long enough to outlive the drag, short enough to feel like one nudge. */
const RESIZING_FLAG_MS = 220

export function useGanttSidebarResize(rootRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    let handle: HTMLElement | null = null
    let sidebar: HTMLElement | null = null
    let flagTimer: number | undefined
    let syncFrame = 0

    const syncValue = () => {
      if (!handle || !sidebar) return
      handle.setAttribute("aria-valuenow", String(Math.round(sidebar.offsetWidth)))
    }

    /**
     * The width lands one React commit later, so read it on the far side of the
     * next paint. Two frames: one for the state flush, one for layout.
     */
    const scheduleSync = () => {
      cancelAnimationFrame(syncFrame)
      syncFrame = requestAnimationFrame(() => {
        syncFrame = requestAnimationFrame(syncValue)
      })
    }

    /**
     * Watch the written width, not the measured box: the package sizes the
     * sidebar through a style on an ancestor, and a ResizeObserver on the
     * sidebar itself never fires for it.
     */
    const widthObserver = new MutationObserver(scheduleSync)

    const drag = (from: number, to: number) => {
      if (!handle || from === to) return
      const box = handle.getBoundingClientRect()
      const y = box.top + box.height / 2
      const opts = { bubbles: true, cancelable: true, button: 0, clientY: y }
      handle.dispatchEvent(new MouseEvent("mousedown", { ...opts, clientX: from }))
      document.dispatchEvent(new MouseEvent("mousemove", { ...opts, clientX: to }))
      document.dispatchEvent(new MouseEvent("mouseup", { ...opts, clientX: to }))

      handle.setAttribute("data-gantt-resizing", "")
      window.clearTimeout(flagTimer)
      flagTimer = window.setTimeout(() => {
        handle?.removeAttribute("data-gantt-resizing")
      }, RESIZING_FLAG_MS)
      scheduleSync()
    }

    const nudge = (event: KeyboardEvent, direction: -1 | 1) => {
      const step = event.shiftKey ? STEP_COARSE : event.altKey ? STEP_FINE : STEP
      const origin = handle!.getBoundingClientRect()
      const x = origin.left + origin.width / 2
      drag(x, x + direction * step)
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (!handle || !sidebar) return
      if (event.metaKey || event.ctrlKey) return

      switch (event.key) {
        case "ArrowLeft":
          event.preventDefault()
          nudge(event, -1)
          return
        case "ArrowRight":
          event.preventDefault()
          nudge(event, 1)
          return
        case "Home":
        case "End": {
          event.preventDefault()
          const bound = Number(
            handle.getAttribute(event.key === "Home" ? "aria-valuemin" : "aria-valuemax"),
          )
          if (!Number.isFinite(bound)) return
          const origin = handle.getBoundingClientRect()
          const x = origin.left + origin.width / 2
          drag(x, x + (bound - sidebar.offsetWidth))
          return
        }
        case "Enter":
        case " ":
          event.preventDefault()
          handle.dispatchEvent(new MouseEvent("dblclick", { bubbles: true, cancelable: true }))
          return
        default:
      }
    }

    const unbind = () => {
      handle?.removeEventListener("keydown", onKeyDown)
      handle?.removeEventListener("mouseup", scheduleSync)
      handle?.removeEventListener("pointerup", scheduleSync)
      handle?.removeAttribute("data-gantt-resizing")
      widthObserver.disconnect()
      window.clearTimeout(flagTimer)
      cancelAnimationFrame(syncFrame)
    }

    const find = () => {
      const nextHandle = root.querySelector('[data-roadmap-ui="gantt-sidebar-resize-handle"]')
      const nextSidebar = root.querySelector('[data-roadmap-ui="gantt-sidebar"]')
      if (!(nextHandle instanceof HTMLElement) || !(nextSidebar instanceof HTMLElement)) return
      if (nextHandle === handle && nextSidebar === sidebar) return

      unbind()
      handle = nextHandle
      sidebar = nextSidebar
      handle.addEventListener("keydown", onKeyDown)
      // Mouse drags run entirely inside the package; catch the release so the
      // announced value tracks them too.
      handle.addEventListener("mouseup", scheduleSync)
      handle.addEventListener("pointerup", scheduleSync)
      widthObserver.observe(sidebar, { attributes: true, attributeFilter: ["style", "class"] })
      if (sidebar.parentElement) {
        widthObserver.observe(sidebar.parentElement, {
          attributes: true,
          attributeFilter: ["style", "class"],
        })
      }
      syncValue()
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
