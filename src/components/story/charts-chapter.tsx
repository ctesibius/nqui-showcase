import { Suspense, lazy, useRef } from "react";
import { Skeleton } from "@nqlib/nqui";
import { Chapter } from "./chapter";
import { Reveal } from "./motion-primitives";
import { useLazyMount } from "./scroll-hooks";

// The carousel pulls all 14 @nqlib/nqchart entries (echarts) — keep it out of
// the entry chunk and load it as the chapter nears the viewport.
const ChartsCarousel = lazy(() =>
  import("./charts-carousel").then((m) => ({ default: m.ChartsCarousel })),
);

function CarouselSkeleton() {
  return (
    <div className="mt-14 md:mt-20">
      <Skeleton className="mb-6 h-5 w-56" />
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-[420px] rounded-xl" />
        <Skeleton className="hidden h-[420px] rounded-xl lg:block" />
      </div>
    </div>
  );
}

export function ChartsChapter() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useLazyMount(ref);

  return (
    <Chapter
      id="charts"
      eyebrow="nqchart — analytics"
      headline="Charts that explain themselves."
      lede="Fourteen chart types with one composable API — axes, tooltips and legends are children, and every color comes from your theme tokens."
      align="center"
    >
      <Reveal>
        <div ref={ref}>
          {inView ? (
            <Suspense fallback={<CarouselSkeleton />}>
              <ChartsCarousel />
            </Suspense>
          ) : (
            <CarouselSkeleton />
          )}
        </div>
      </Reveal>
    </Chapter>
  );
}
