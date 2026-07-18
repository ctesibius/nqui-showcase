import {
  motion,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { cn } from "@nqlib/nqui";

const RAIL_X = 8;
const DEPTH_INDENT = 10;
const FALLBACK_STRIDE = 28;
const SPRING = { stiffness: 180, damping: 20 } as const;

export interface DocsTocItem {
  title?: ReactNode;
  url: string;
  depth: number;
}

interface DocsTocIndicatorProps {
  toc: DocsTocItem[];
  activeIndex: number;
  railRef: RefObject<HTMLElement | null>;
  className?: string;
}

interface MeasuredLayout {
  centers: number[];
  path: string;
  centerDistances: number[];
  totalLength: number;
}

function getXForDepth(depth: number, minDepth: number): number {
  return RAIL_X + (depth - minDepth) * DEPTH_INDENT;
}

function buildLayout(
  centers: number[],
  bottoms: number[],
  depths: number[],
): MeasuredLayout {
  if (centers.length === 0) {
    return { centers: [], path: "", centerDistances: [], totalLength: 1 };
  }

  const tops = centers.map((c, i) => 2 * c - bottoms[i]!);
  const minDepth = Math.min(...depths);
  const pathParts: string[] = [];
  const centerDistances: number[] = [];

  let currentX = getXForDepth(depths[0]!, minDepth);
  let currentY = Math.max(0, tops[0]! - 2);
  let accumulated = 0;

  pathParts.push(`M ${currentX} ${currentY}`);

  for (let i = 0; i < centers.length; i++) {
    const centerY = centers[i]!;
    const bottomY = bottoms[i]!;
    const nextTop = tops[i + 1];
    // Draw through the gap (to next row top) so step = text height + spacing.
    const segmentEnd = nextTop != null ? nextTop : bottomY;

    centerDistances.push(accumulated + Math.max(0, centerY - currentY));

    const vertical = Math.max(0, segmentEnd - currentY);
    accumulated += vertical;
    pathParts.push(`L ${currentX} ${segmentEnd}`);
    currentY = segmentEnd;

    const nextDepth = depths[i + 1];
    if (nextDepth != null) {
      const nextX = getXForDepth(nextDepth, minDepth);
      if (nextX !== currentX) {
        const bend = 6;
        accumulated += Math.hypot(nextX - currentX, bend);
        pathParts.push(`L ${nextX} ${currentY + bend}`);
        currentX = nextX;
        currentY += bend;
      }
    }
  }

  const lastBottom = bottoms[bottoms.length - 1]!;
  if (lastBottom > currentY) {
    accumulated += lastBottom - currentY;
    pathParts.push(`L ${currentX} ${lastBottom}`);
  }

  return {
    centers,
    path: pathParts.join(" "),
    centerDistances,
    totalLength: Math.max(accumulated, 1),
  };
}

function fallbackLayout(toc: DocsTocItem[]): MeasuredLayout {
  const centers = toc.map((_, i) => 8 + 10 + i * FALLBACK_STRIDE);
  const bottoms = toc.map((_, i) => 8 + 20 + i * FALLBACK_STRIDE);
  const depths = toc.map((t) => t.depth);
  return buildLayout(centers, bottoms, depths);
}

function measureFromRail(
  rail: HTMLElement,
  toc: DocsTocItem[],
): MeasuredLayout | null {
  const items = [...rail.querySelectorAll<HTMLElement>(".docs-toc-item")];
  if (items.length === 0 || toc.length === 0) return null;

  const count = Math.min(items.length, toc.length);
  const railRect = rail.getBoundingClientRect();
  const visible = railRect.height >= 2 && items[0]!.getBoundingClientRect().height > 0;

  const centers: number[] = [];
  const bottoms: number[] = [];
  const depths: number[] = [];

  for (let i = 0; i < count; i++) {
    const el = items[i]!;
    depths.push(toc[i]?.depth ?? 2);

    if (visible) {
      const top = el.getBoundingClientRect().top - railRect.top;
      const h = el.getBoundingClientRect().height;
      centers.push(top + h / 2);
      bottoms.push(top + h);
    } else {
      const list = el.parentElement;
      const listOffset = list && list !== rail ? list.offsetTop : 0;
      const top = listOffset + el.offsetTop;
      const h = el.offsetHeight || 20;
      centers.push(top + h / 2);
      bottoms.push(top + h);
    }
  }

  return buildLayout(centers, bottoms, depths);
}

function useMeasuredLayout(
  railRef: RefObject<HTMLElement | null>,
  toc: DocsTocItem[],
) {
  const [layout, setLayout] = useState<MeasuredLayout | null>(null);
  const tocKey = toc.map((t) => `${t.url}:${t.depth}`).join("|");

  useLayoutEffect(() => {
    const rail = railRef.current;
    if (!rail || toc.length === 0) return;

    const measure = () => {
      const next = measureFromRail(rail, toc);
      if (next) setLayout(next);
    };

    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(rail);
    for (const el of rail.querySelectorAll(".docs-toc-item")) {
      ro.observe(el);
    }

    window.addEventListener("resize", measure);
    const t1 = window.setTimeout(measure, 50);
    const t2 = window.setTimeout(measure, 250);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [railRef, tocKey, toc]);

  return layout;
}

/** Diamond + glow: step = measured text height + gap between TOC links. */
export function DocsTocIndicator({
  toc,
  activeIndex,
  railRef,
  className,
}: DocsTocIndicatorProps) {
  const uid = useId().replace(/:/g, "");
  const endCircleId = `docs-toc-end-${uid}`;
  const pathMaskId = `docs-toc-mask-${uid}`;
  const glowGradId = `docs-toc-glow-${uid}`;
  const diamondFilterId = `docs-toc-diamond-${uid}`;

  const layout = useMeasuredLayout(railRef, toc);
  const reduceMotion = useReducedMotion();
  const springConfig = reduceMotion ? { duration: 0 } : SPRING;

  // Always paint — never unmount while waiting on measure.
  const resolved = layout ?? fallbackLayout(toc);

  const safeIndex = Math.min(
    Math.max(activeIndex >= 0 ? activeIndex : 0, 0),
    Math.max(resolved.centers.length - 1, 0),
  );
  const targetDistance = resolved.centerDistances[safeIndex] ?? 0;

  // Ride the same offset-path as the glow so the diamond tracks rail bends (depth indent).
  const pathDistance = useSpring(targetDistance, springConfig);
  const prevIndexRef = useRef(activeIndex);
  const tailRotate = useSpring(90, springConfig);
  const tailMarginTop = useSpring(-38, springConfig);
  const offsetDistancePercent = useTransform(pathDistance, (v) =>
    resolved.totalLength > 0 ? `${(v / resolved.totalLength) * 100}%` : "0%",
  );

  useEffect(() => {
    if (activeIndex !== prevIndexRef.current) {
      const movingDown = activeIndex > prevIndexRef.current;
      tailRotate.set(movingDown ? 90 : -90);
      tailMarginTop.set(movingDown ? -38 : -38 + 70);
      prevIndexRef.current = activeIndex;
    }
    pathDistance.set(targetDistance);
  }, [activeIndex, targetDistance, pathDistance, tailRotate, tailMarginTop]);

  if (toc.length === 0) return null;

  const { path } = resolved;
  const cssOffsetPath = `path('${path}')`;

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 z-[1] overflow-visible text-muted-foreground/50",
        className,
      )}
    >
      {/* Path + trail stay under the fade mask; diamond sits outside so its glow is not cropped. */}
      <div
        className="absolute inset-0 overflow-visible"
        style={{
          maskImage:
            "linear-gradient(to bottom, transparent 0px, currentColor 15px, currentColor 100%)",
        }}
      >
        <svg className="h-full w-full overflow-visible">
          <defs>
            <marker
              id={endCircleId}
              markerWidth="6"
              markerHeight="6"
              refX="3"
              refY="3"
              orient="auto"
            >
              <circle cx="3" cy="3" r="2" fill="currentColor" />
            </marker>
            <mask id={pathMaskId} maskUnits="userSpaceOnUse">
              <path
                d={path}
                stroke="white"
                strokeWidth="1"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </mask>
          </defs>
          <path
            d={path}
            stroke="currentColor"
            strokeWidth="1"
            fill="none"
            markerEnd={`url(#${endCircleId})`}
          />
        </svg>

        <div
          className="pointer-events-none absolute inset-0 overflow-visible"
          style={{
            mask: `url(#${pathMaskId})`,
            WebkitMask: `url(#${pathMaskId})`,
          }}
        >
          <motion.div
            className="absolute top-0 left-0"
            style={{
              width: 80,
              height: 80,
              offsetPath: cssOffsetPath,
              offsetRotate: "0deg",
              rotate: tailRotate,
              marginLeft: 0.2,
              marginTop: tailMarginTop,
              offsetDistance: offsetDistancePercent,
            }}
          >
            <svg width="80" height="80" viewBox="0 0 80 80" className="overflow-visible">
              <defs>
                <radialGradient
                  id={glowGradId}
                  cx="0.5"
                  cy="0.5"
                  fx="0.9"
                  gradientUnits="objectBoundingBox"
                >
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity="1" />
                  <stop offset="100%" stopColor="transparent" stopOpacity="1" />
                </radialGradient>
              </defs>
              <ellipse cx="40" cy="40" rx="40" ry="40" fill={`url(#${glowGradId})`} />
            </svg>
          </motion.div>
        </div>
      </div>

      {/*
        Diamond on the same offset-path as the glow. Match nqchart: 6×6 box at the
        path point (marginLeft ≈ 0, marginTop −3). A 28×28 box with −14/−14 margins
        sits left of the rail when offset-anchor is the element center.
      */}
      <motion.div
        className="absolute top-0 left-0 overflow-visible"
        style={{
          width: 6,
          height: 6,
          offsetPath: cssOffsetPath,
          offsetRotate: "0deg",
          offsetDistance: offsetDistancePercent,
          marginLeft: 0.2,
          marginTop: -3,
        }}
      >
        <svg width="6" height="6" viewBox="0 0 6 6" className="overflow-visible" aria-hidden>
          <defs>
            <filter
              id={diamondFilterId}
              x="-200%"
              y="-200%"
              width="500%"
              height="500%"
              filterUnits="objectBoundingBox"
            >
              <feGaussianBlur in="SourceGraphic" stdDeviation="2.4" />
            </filter>
          </defs>
          <rect
            x="0"
            y="0"
            width="6"
            height="6"
            rx="1"
            fill="var(--primary)"
            opacity="0.55"
            transform="rotate(45 3 3)"
            filter={`url(#${diamondFilterId})`}
          />
          <rect
            x="0"
            y="0"
            width="6"
            height="6"
            rx="1"
            fill="var(--primary)"
            transform="rotate(45 3 3)"
          />
        </svg>
      </motion.div>
    </div>
  );
}
