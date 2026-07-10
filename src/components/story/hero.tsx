import { Suspense, lazy, useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "motion/react";
import { Badge, Button } from "@nqlib/nqui";
import { STORY_EASE } from "./scroll-hooks";
import { HERO_BLOCKS } from "./hero-blocks";

// three.js lives in its own chunk — the reel renders instantly and the matrix
// fades in as soon as the chunk lands.
const MorphMatrix = lazy(() =>
  import("./morph-matrix").then((m) => ({ default: m.MorphMatrix })),
);

const PRODUCTS = [
  {
    id: "components",
    name: "nqui",
    role: "Components",
    href: "#components",
    tagline: "Fifty-plus components — buttons to command palettes — that hold up in real products.",
  },
  {
    id: "charts",
    name: "nqchart",
    role: "Charts",
    href: "#charts",
    tagline: "From bar to calendar heatmap — every chart your product needs, one composable API.",
  },
  {
    id: "grid",
    name: "nqgrid",
    role: "Spreadsheet",
    href: "#grid",
    tagline: "A real spreadsheet engine — formulas, pivots, frozen panes — not a static table.",
  },
  {
    id: "timeline",
    name: "nqgantt",
    role: "Timeline",
    href: "#timeline",
    tagline: "Roadmaps you can read: grouped rows, dependencies, drag-to-reschedule, critical paths.",
  },
];

function HeroKicker({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: reducedMotion ? 0 : 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: STORY_EASE }}
      className="flex flex-wrap items-center gap-3"
    >
      <Badge variant="secondary">nqui 0.7.0 preview</Badge>
      <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        nqlib · the product interface stack
      </span>
    </motion.div>
  );
}

/**
 * Below lg the pinned reel doesn't fit (and scroll-jacking on touch feels
 * wrong), so the same four stages render as a plain stacked column — full
 * content, no WebGL, no pinning.
 */
function StackedHero({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <section id="top" className="px-6 pb-10 pt-28">
      <div className="mx-auto flex w-full max-w-xl flex-col">
        <HeroKicker reducedMotion={reducedMotion} />
        <div className="mt-10 flex flex-col gap-16">
          {PRODUCTS.map((product, i) => {
            const Block = HERO_BLOCKS[i];
            return (
              <div key={product.id} className="flex flex-col items-start gap-4">
                <p className="font-mono text-sm uppercase tracking-[0.2em] text-muted-foreground">
                  {String(i + 1).padStart(2, "0")} / {String(PRODUCTS.length).padStart(2, "0")} · {product.role}
                </p>
                <h2 className="text-5xl font-semibold tracking-tight">{product.name}</h2>
                <p className="text-pretty text-base leading-relaxed text-muted-foreground">
                  {product.tagline}
                </p>
                <div className="w-full max-w-sm">
                  <Block />
                </div>
                <Button size="sm" className="rounded-full" asChild>
                  <a href={product.href}>Explore {product.name}</a>
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ReelHero({ reducedMotion }: { reducedMotion: boolean }) {
  const wrapperRef = useRef<HTMLElement>(null);
  const progressRef = useRef(0);
  const [active, setActive] = useState(0);

  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    progressRef.current = p;
    const stageF = p * (PRODUCTS.length - 1);
    const t = stageF - Math.floor(stageF);
    const idx = t < 0.5 ? Math.floor(stageF) : Math.ceil(stageF);
    const clamped = Math.max(0, Math.min(PRODUCTS.length - 1, idx));
    setActive((prev) => (prev === clamped ? prev : clamped));
  });

  const product = PRODUCTS[active];
  const Block = HERO_BLOCKS[active];

  const scrollToStage = (i: number) => {
    const el = wrapperRef.current;
    if (!el) return;
    const span = el.offsetHeight - window.innerHeight;
    const y = el.offsetTop + (span * i) / (PRODUCTS.length - 1);
    window.scrollTo({ top: y, behavior: reducedMotion ? "auto" : "smooth" });
  };

  return (
    // Wrapper height sets how long the frame stays pinned — kept tight so the
    // four stages don't overstay their welcome.
    <section id="top" ref={wrapperRef} className="relative h-[200vh]">
      <div className="sticky top-0 flex h-svh flex-col justify-center overflow-hidden px-6 pt-14">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[1.05fr_1fr]">
          {/* Left — prominent, product-forward copy */}
          <div className="flex flex-col">
            <HeroKicker reducedMotion={reducedMotion} />

            <div className="mt-7 min-h-[26rem]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: reducedMotion ? 0 : 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: reducedMotion ? 0 : -14 }}
                  transition={{ duration: 0.3, ease: STORY_EASE }}
                  className="flex flex-col items-start gap-5"
                >
                  <div>
                    <p aria-live="polite" className="font-mono text-sm uppercase tracking-[0.2em] text-muted-foreground">
                      {String(active + 1).padStart(2, "0")} / {String(PRODUCTS.length).padStart(2, "0")} · {product.role}
                    </p>
                    <h1 className="mt-2 text-5xl font-semibold tracking-tight md:text-6xl">
                      {product.name}
                    </h1>
                  </div>

                  {/* The payoff: a block you'd actually build by combining nqlib */}
                  <div className="w-full max-w-sm">
                    <Block />
                  </div>

                  <Button className="rounded-full" asChild>
                    <a href={product.href}>Explore {product.name}</a>
                  </Button>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Stage rail */}
            <div className="mt-8 flex items-center gap-3">
              {PRODUCTS.map((p, i) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => scrollToStage(i)}
                  title={p.name}
                  aria-label={`Go to ${p.name}`}
                  aria-current={i === active ? "true" : undefined}
                  className="group flex items-center gap-2"
                >
                  <span
                    className={`h-1 rounded-full transition-all duration-300 ${
                      i === active ? "w-8 bg-foreground" : "w-4 bg-border group-hover:bg-muted-foreground"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Right — morphing dot-matrix motif for the active library */}
          <Suspense fallback={<div className="aspect-square w-full" aria-hidden />}>
            <MorphMatrix progressRef={progressRef} className="aspect-square w-full" />
          </Suspense>
        </div>

        {/* Scroll affordance — fades once the visitor gets it */}
        <motion.p
          animate={{ opacity: active === 0 ? 1 : 0 }}
          transition={{ duration: 0.3, ease: STORY_EASE }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
        >
          Scroll — 4 libraries · 4 chapters
        </motion.p>
      </div>
    </section>
  );
}

export function StoryHero() {
  const reducedMotion = useReducedMotion() ?? false;
  const [desktop, setDesktop] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches,
  );

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setDesktop(mq.matches);
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return desktop ? (
    <ReelHero reducedMotion={reducedMotion} />
  ) : (
    <StackedHero reducedMotion={reducedMotion} />
  );
}
