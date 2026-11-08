/**
 * Scroll helpers for the gallery rail — kept apart from the components so
 * React fast refresh keeps working.
 */
import { useCallback, useEffect, useSyncExternalStore, type RefObject } from "react";


const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
  history.replaceState(history.state, "", `#${id}`);
}

/**
 * The section whose top most recently crossed the reading line (~a quarter
 * down the viewport). Recomputed on scroll — cheap: a handful of rects.
 */
export function useScrollSpy(ids: ReadonlyArray<string>, root?: RefObject<HTMLElement | null>): string | null {
  const key = ids.join("|");
  const subscribe = useCallback((notify: () => void) => {
    window.addEventListener("scroll", notify, { passive: true });
    window.addEventListener("resize", notify);
    return () => {
      window.removeEventListener("scroll", notify);
      window.removeEventListener("resize", notify);
    };
  }, []);
  const read = () => {
    if (typeof document === "undefined" || !key) return null;
    const line = window.innerHeight * 0.25;
    let current: string | null = null;
    for (const id of ids) {
      const el = (root?.current ?? document).querySelector<HTMLElement>(`[id="${CSS.escape(id)}"]`);
      if (!el || el.getClientRects().length === 0) continue;
      if (el.getBoundingClientRect().top <= line) current = id;
      else break;
    }
    // At the very bottom, the last section is the one being read.
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
      const visible = ids.filter((id) => document.getElementById(id)?.getClientRects().length);
      current = visible[visible.length - 1] ?? current;
    }
    return current ?? ids.find((id) => document.getElementById(id)?.getClientRects().length) ?? null;
  };
  return useSyncExternalStore(subscribe, read, () => null);
}

/**
 * Deep links (`/catalog#overlays-dialogs`): the target only exists after the
 * first render, so the browser's own hash jump has nothing to land on. Land
 * once on the next frame and again after fonts and lazy content above it have
 * settled their height.
 */
export function useHashLanding() {
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!id) return;
    const land = () => document.getElementById(id)?.scrollIntoView({ block: "start" });
    const frame = requestAnimationFrame(land);
    const settle = window.setTimeout(land, 450);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(settle);
    };
  }, []);
}
