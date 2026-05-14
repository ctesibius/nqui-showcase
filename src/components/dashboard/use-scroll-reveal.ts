import { useCallback, useRef, useState } from "react";

/** Drives `data-scrolling` for `.nqui-scrollbar-on-scroll` while a scroll container is active. */
export function useScrollReveal(hideMs = 650) {
  const [scrolling, setScrolling] = useState(false);
  const timerRef = useRef<number | null>(null);

  const onScroll = useCallback(() => {
    setScrolling(true);
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setScrolling(false), hideMs);
  }, [hideMs]);

  return { scrolling, onScroll };
}
