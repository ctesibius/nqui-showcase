import { type ReactNode, useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { STORY_EASE } from "./scroll-hooks";

/**
 * A scroll-triggered flip card: shows its "spec" face until it enters the
 * viewport, then flips to the live face (staggered by index). A corner chip
 * flips it back for inspection. Reduced motion swaps instantly.
 */
export function FlipCard({
  front,
  back,
  index = 0,
  name,
}: {
  front: ReactNode;
  back: ReactNode;
  index?: number;
  name: string;
}) {
  const reducedMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const [flipped, setFlipped] = useState(false);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (!inView || revealed) return;
    const t = setTimeout(() => {
      setFlipped(true);
      setRevealed(true);
    }, 300 + index * 150);
    return () => clearTimeout(t);
  }, [inView, revealed, index]);

  return (
    <div ref={ref} className="relative [perspective:1400px]">
      <motion.div
        className="relative h-[15rem] w-full [transform-style:preserve-3d]"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: reducedMotion ? 0 : 0.7, ease: STORY_EASE }}
      >
        <div className="absolute inset-0 [backface-visibility:hidden]" aria-hidden={flipped}>
          {front}
        </div>
        <div
          className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]"
          aria-hidden={!flipped}
        >
          {back}
        </div>
      </motion.div>

      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        aria-pressed={!flipped}
        aria-label={flipped ? `Show ${name} drawing` : `Show ${name} live`}
        className="absolute -top-3 right-3 z-10 rounded-full border bg-background px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground transition-colors duration-100 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {flipped ? "Drawing" : "Live"}
      </button>
    </div>
  );
}
