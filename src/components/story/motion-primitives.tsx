import { type ReactNode, useRef } from "react";
import {
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionStyle,
} from "motion/react";
import { STORY_EASE } from "./scroll-hooks";

/** motion's template-literal margin type, e.g. "-12% 0px". */
type ViewportMargin = NonNullable<Parameters<typeof useInView>[1]>["margin"];

/**
 * Fade + rise into place when scrolled into view. Fires once.
 * Under prefers-reduced-motion the translate is dropped; only opacity animates.
 */
export function Reveal({
  children,
  delay = 0,
  className,
  margin = "-12% 0px",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  /**
   * Viewport margin for the in-view trigger. Use "0px" for elements near the
   * end of the page — a negative margin can keep them from ever firing on
   * short viewports.
   */
  margin?: ViewportMargin;
}) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reducedMotion ? 0 : 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin }}
      transition={{ duration: 0.55, ease: STORY_EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Subtle scroll-linked drift for large payoff frames — the element settles
 * from a slight offset/scale as it crosses the viewport. Disabled entirely
 * under prefers-reduced-motion.
 */
export function ScrollDrift({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reducedMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 95%", "start 35%"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [48, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.97, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.4, 1], [0, 0.7, 1]);

  const style: MotionStyle = reducedMotion ? {} : { y, scale, opacity };

  return (
    <motion.div ref={ref} className={className} style={style}>
      {children}
    </motion.div>
  );
}
