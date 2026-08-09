import { useLayoutEffect, useRef, useState } from "react";

type PinBox = {
  left: number;
  top: number;
  height: number;
};

/**
 * Keep a `position: fixed` docs chrome column aligned to an in-flow spacer
 * and parked just below the sticky docs header (measured, not assumed `top-12`).
 */
export function usePinnedColumnLeft(deps: readonly unknown[] = []) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<PinBox | null>(null);

  useLayoutEffect(() => {
    const el = anchorRef.current;
    if (!el) return;

    const sync = () => {
      const header = document.querySelector("header");
      const headerBottom = header?.getBoundingClientRect().bottom ?? 48;
      const top = Math.max(0, headerBottom);
      setBox({
        left: el.getBoundingClientRect().left,
        top,
        height: Math.max(0, window.innerHeight - top),
      });
    };

    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    if (document.querySelector("header")) {
      ro.observe(document.querySelector("header")!);
    }
    window.addEventListener("resize", sync);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", sync);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- caller passes layout deps
  }, deps);

  return { anchorRef, box };
}
