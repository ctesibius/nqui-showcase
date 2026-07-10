import { Suspense, lazy } from "react";
import { StoryNav } from "../components/story/story-nav";
import { StoryHero } from "../components/story/hero";

// Shares the three.js chunk with the hero matrix; purely decorative, so it can
// arrive after first paint.
const CityBackdrop = lazy(() =>
  import("../components/story/city-backdrop").then((m) => ({ default: m.CityBackdrop })),
);
import { NquiChapter } from "../components/story/nqui-chapter";
import { ChartsChapter } from "../components/story/charts-chapter";
import { GridChapter } from "../components/story/grid-chapter";
import { GanttChapter } from "../components/story/gantt-chapter";
import { StoryFinale } from "../components/story/finale";

export function StoryLandingPage() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      {/* Abstract city skyline — fixed behind everything, camera drifts on scroll. */}
      <Suspense fallback={null}>
        <CityBackdrop />
      </Suspense>
      <StoryNav />
      <main className="relative z-10">
        <StoryHero />
        <NquiChapter />
        <ChartsChapter />
        <GridChapter />
        <GanttChapter />
        <StoryFinale />
      </main>
    </div>
  );
}
