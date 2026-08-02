/**
 * Showcase-only look stylesheet (0.7 default vs Ledger preset).
 * Ledger CSS lives in this app — not `@nqlib/nqui/styles/refresh`.
 */

import ledgerHref from "../../styles/ledger-look.css?url"

export const LOOK_STORAGE_KEY = "nqui-skin-refresh"
export const LOOK_LINK_ID = "nqui-showcase-ledger-look"

export type LookId = "default" | "ledger"

export function lookFromStorage(): LookId {
  try {
    return localStorage.getItem(LOOK_STORAGE_KEY) === "1" ? "ledger" : "default"
  } catch {
    return "default"
  }
}

export function persistLook(look: LookId) {
  try {
    localStorage.setItem(LOOK_STORAGE_KEY, look === "ledger" ? "1" : "0")
  } catch {
    /* ignore */
  }
}

/** Attach or remove showcase `ledger-look.css` on `<html>`. */
export function applyLookStylesheet(look: LookId) {
  const enabled = look === "ledger"
  const existing = document.getElementById(LOOK_LINK_ID)
  // Drop legacy link id from when we pointed at nqui/styles/refresh
  document.getElementById("nqui-styles-refresh")?.remove()

  if (!enabled) {
    existing?.remove()
    document.documentElement.removeAttribute("data-nqui-skin")
    return
  }
  document.documentElement.setAttribute("data-nqui-skin", "ledger")
  if (existing) {
    ;(existing as HTMLLinkElement).href = ledgerHref
    return
  }
  const link = document.createElement("link")
  link.id = LOOK_LINK_ID
  link.rel = "stylesheet"
  link.href = ledgerHref
  document.head.appendChild(link)
}
