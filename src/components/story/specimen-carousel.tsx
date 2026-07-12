import { type ComponentType, useEffect, useState } from "react";
import type { UseEmblaCarouselType } from "embla-carousel-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@nqlib/nqui/carousel";

/** The subpath entry doesn't export CarouselApi; it's embla's api handle. */
type CarouselApi = UseEmblaCarouselType[1];
/** Embla `opts.watchDrag` — boolean or predicate over the pointer event. */
type WatchDrag = NonNullable<
  NonNullable<Parameters<typeof import("embla-carousel-react").default>[0]>["watchDrag"]
>;

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

/**
 * Pointer targets that own their own horizontal drag — Embla must not steal
 * these, or sliders / resizers / chart canvases break.
 */
const OWN_DRAG_SELECTOR = [
  '[data-slot="slider"]',
  '[data-slot="slider-track"]',
  '[data-slot="slider-thumb"]',
  '[data-slot="slider-range"]',
  '[data-slot="resizable-handle"]',
  '[data-slot="chart"]', // nqchart ECharts host is a div, not <canvas>
  '[role="slider"]',
  "input",
  "textarea",
  "select",
  "canvas",
].join(",");

/** Allow carousel swipe except when the gesture starts on an interactive control. */
const watchDragUnlessInteractive: WatchDrag = (_api, event) => {
  const target = event.target;
  if (!(target instanceof Element)) return true;
  return !target.closest(OWN_DRAG_SELECTOR);
};

/** Trackpad / shift+wheel → one slide step (debounced per gesture). */
function useHorizontalWheel(api: CarouselApi | undefined) {
  useEffect(() => {
    if (!api) return;
    const root = api.rootNode();
    let locked = false;
    let unlockTimer = 0;

    const onWheel = (event: WheelEvent) => {
      const horizontal =
        Math.abs(event.deltaX) > Math.abs(event.deltaY)
          ? event.deltaX
          : event.shiftKey
            ? event.deltaY
            : 0;
      if (!horizontal) return;

      event.preventDefault();
      if (locked) return;
      locked = true;
      if (horizontal > 0) api.scrollNext();
      else api.scrollPrev();
      window.clearTimeout(unlockTimer);
      unlockTimer = window.setTimeout(() => {
        locked = false;
      }, 450);
    };

    root.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      root.removeEventListener("wheel", onWheel);
      window.clearTimeout(unlockTimer);
    };
  }, [api]);
}

export function SpecimenCarousel({
  items,
  label,
  bodyClassName = "",
  /**
   * Embla drag. Default skips sliders/charts so specimens stay interactive
   * while empty card chrome still swipes.
   */
  watchDrag = watchDragUnlessInteractive,
}: {
  items: Specimen[];
  /** Short noun for the counter, e.g. "components" or "chart types". */
  label: string;
  /** Classes for the specimen viewport (height/centering differs per chapter). */
  bodyClassName?: string;
  watchDrag?: WatchDrag;
}) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(1);

  useHorizontalWheel(api);

  useEffect(() => {
    if (!api) return;
    const update = () => setCurrent(api.selectedScrollSnap() + 1);
    update();
    api.on("select", update);
    api.on("reInit", update);
    return () => {
      api.off("select", update);
      api.off("reInit", update);
    };
  }, [api]);

  return (
    <Carousel
      setApi={setApi}
      opts={{ align: "start", loop: false, watchDrag }}
      className="mt-14 md:mt-20"
    >
      <div className="mb-6 flex items-end justify-between gap-4">
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-sm tabular-nums">
            <span className="text-foreground">{pad(current)}</span>
            <span className="text-muted-foreground"> / {pad(items.length)}</span>
          </span>
          <span className="text-sm text-muted-foreground">
            {label} — swipe, scroll, or step through
          </span>
        </div>
        <div className="flex items-center gap-2">
          <CarouselPrevious className="static translate-y-0" />
          <CarouselNext className="static translate-y-0" />
        </div>
      </div>

      <CarouselContent className="-ml-4">
        {items.map((item) => (
          <CarouselItem
            key={item.id}
            className="pl-4 basis-[86%] sm:basis-[62%] lg:basis-[46%]"
          >
            <figure className="flex h-full flex-col rounded-xl border bg-background/60 p-6 backdrop-blur-md">
              <figcaption className="flex items-baseline justify-between gap-3">
                <span className="text-base font-medium">{item.name}</span>
                <span className="font-mono text-xs text-muted-foreground">
                  {item.component}
                </span>
              </figcaption>

              {/*
                Stop Embla / parent gesture handlers from seeing pointer moves
                over chart canvases (hover-focus glitter on pie / radar).
              */}
              <div
                className={`mt-5 min-h-0 ${bodyClassName}`}
                onPointerDownCapture={(event) => event.stopPropagation()}
              >
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
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}
