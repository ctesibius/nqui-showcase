import { type ComponentType, type SVGProps, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { ScrollArea } from "@nqlib/nqui";

/** A single showcase slide: a live specimen plus metadata. */
export interface Specimen {
  id: string;
  name: string;
  /** Monospace component label, e.g. "NQAreaChart" or "<Slider>". */
  component: string;
  blurb: string;
  tags: string[];
  Render: ComponentType;
}

const pad = (n: number) => String(n).padStart(2, "0");

function Chevron({ dir, ...p }: { dir: "left" | "right" } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={dir === "left" ? "rotate-180" : undefined}
      {...p}
    >
      <path d="m6 3.5 5 4.5-5 4.5" />
    </svg>
  );
}

/**
 * A native, scroll-snapped horizontal gallery — deliberately NOT a JS drag
 * library (Embla). A drag-to-scroll layer has to intercept pointerdown on the
 * whole track to decide "is this a swipe or a click", and that interception
 * is exactly what fights sliders, resizable handles, and chart canvases for
 * the pointer (hover-focus glitter, dead clicks). Native overflow-x scrolling
 * never captures pointer events on children — there's nothing to exclude.
 */
export function SpecimenCarousel({
  items,
  label,
  bodyClassName = "",
}: {
  items: Specimen[];
  /** Short noun for the counter, e.g. "components" or "chart types". */
  label: string;
  /** Classes for the specimen viewport (height/centering differs per chapter). */
  bodyClassName?: string;
}) {
  const reducedMotion = useReducedMotion() ?? false;
  const trackRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef(new Map<string, HTMLElement>());
  const ratiosRef = useRef(new Map<string, number>());
  const [current, setCurrent] = useState(1);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = (entry.target as HTMLElement).dataset.specimenId;
          if (id) ratiosRef.current.set(id, entry.intersectionRatio);
        }
        let bestId: string | null = null;
        let bestRatio = -1;
        for (const [id, ratio] of ratiosRef.current) {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestId = id;
          }
        }
        if (bestId) {
          const idx = items.findIndex((it) => it.id === bestId);
          if (idx >= 0) setCurrent(idx + 1);
        }
      },
      { root: track, threshold: [0, 0.25, 0.5, 0.75, 0.9, 1] },
    );

    for (const el of itemRefs.current.values()) observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- items identity is stable per chapter
  }, []);

  const scrollToIndex = (idx: number) => {
    const clamped = Math.max(0, Math.min(items.length - 1, idx));
    const target = itemRefs.current.get(items[clamped].id);
    target?.scrollIntoView({
      behavior: reducedMotion ? "auto" : "smooth",
      inline: "start",
      block: "nearest",
    });
  };

  const goPrev = () => scrollToIndex(current - 2);
  const goNext = () => scrollToIndex(current);

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goPrev();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      goNext();
    }
  };

  return (
    <div className="group/carousel relative mt-14 md:mt-20">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-sm tabular-nums">
            <span className="text-foreground">{pad(current)}</span>
            <span className="text-muted-foreground"> / {pad(items.length)}</span>
          </span>
          <span className="text-sm text-muted-foreground">
            {label} — swipe or step through
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Previous"
            disabled={current <= 1}
            onClick={goPrev}
            className="flex size-8 items-center justify-center rounded-full border text-foreground opacity-60 transition-opacity duration-150 hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-25"
          >
            <Chevron dir="left" className="size-4" />
          </button>
          <button
            type="button"
            aria-label="Next"
            disabled={current >= items.length}
            onClick={goNext}
            className="flex size-8 items-center justify-center rounded-full border text-foreground opacity-60 transition-opacity duration-150 hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-25"
          >
            <Chevron dir="right" className="size-4" />
          </button>
        </div>
      </div>

      <ScrollArea
        orientation="horizontal"
        fadeMask={false}
        viewportRef={trackRef}
        className="carousel-scrollbar -mx-1 w-auto scroll-px-1 px-1 pb-3 focus-visible:rounded-xl"
        role="region"
        aria-roledescription="carousel"
        aria-label={label}
        tabIndex={0}
        onKeyDown={onKeyDown}
      >
        <div className="flex snap-x snap-mandatory gap-4">
          {items.map((item, i) => (
            <div
              key={item.id}
              ref={(el) => {
                if (el) itemRefs.current.set(item.id, el);
                else itemRefs.current.delete(item.id);
              }}
              data-specimen-id={item.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${items.length}`}
              className="w-[86%] shrink-0 snap-start sm:w-[62%] lg:w-[46%]"
            >
              <figure className="flex h-full flex-col rounded-xl border bg-background/60 p-6 backdrop-blur-md">
                <figcaption className="flex items-baseline justify-between gap-3">
                  <span className="text-base font-medium">{item.name}</span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {item.component}
                  </span>
                </figcaption>

                <div className={`mt-5 min-h-0 ${bodyClassName}`}>
                  <item.Render />
                </div>

                <p className="mt-4 text-sm text-muted-foreground">{item.blurb}</p>

                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {item.tags.map((tag) => (
                    <li
                      key={tag}
                      className="rounded-full bg-foreground/5 px-2.5 py-0.5 font-mono text-xs text-muted-foreground"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
              </figure>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
