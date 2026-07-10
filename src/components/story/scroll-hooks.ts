import { type RefObject, useState } from "react";
import { useInView } from "motion/react";

/** Shared ease — decelerating arrival, no overshoot. */
export const STORY_EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Defer mounting a heavy embed until its container nears the viewport.
 * Hidden documents (prerenderers, headless snapshots) never fire
 * IntersectionObserver, so they mount immediately instead.
 */
export function useLazyMount(ref: RefObject<Element | null>): boolean {
  const inView = useInView(ref, { once: true, margin: "400px 0px" });
  const [hiddenAtMount] = useState(
    () => typeof document !== "undefined" && document.visibilityState === "hidden",
  );
  return inView || hiddenAtMount;
}
