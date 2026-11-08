import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import { Button, NquiLogo } from "@nqlib/nqui";
import { ThemeControls } from "../showcase/theme-tokens/theme-token-sheet";
import { STORY_EASE } from "./scroll-hooks";
import { LiquidGlassBar } from "../liquid-glass-bar";

const CHAPTERS = [
  { href: "#product", label: "Product" },
  { href: "#components", label: "Components" },
  { href: "#charts", label: "Charts" },
  { href: "#grid", label: "Grid" },
  { href: "#timeline", label: "Timeline" },
  { href: "#blocks", label: "Blocks" },
];

export function StoryNav() {
  const reducedMotion = useReducedMotion();

  return (
    <motion.header
      initial={{ opacity: 0, y: reducedMotion ? 0 : -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: STORY_EASE, delay: 0.05 }}
      className="fixed inset-x-0 top-3 z-50 flex justify-center px-4"
    >
      <LiquidGlassBar shape="pill" className="w-full max-w-3xl" contentClassName="w-full p-0">
      <nav className="flex h-12 w-full items-center gap-3 pl-5 pr-2">
        <a
          href="#top"
          aria-label="nqlib — back to top"
          className="flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground"
        >
          <NquiLogo className="size-5" />
          nqlib
        </a>

        <div className="mx-auto hidden items-center gap-1 md:flex">
          {CHAPTERS.map((chapter) => (
            <a
              key={chapter.href}
              href={chapter.href}
              className="rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors duration-100 hover:bg-foreground/5 hover:text-foreground"
            >
              {chapter.label}
            </a>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-1.5 md:ml-0">
          <ThemeControls />
          <Button size="sm" className="rounded-full" asChild>
            <Link to="/docs">Docs</Link>
          </Button>
        </div>
      </nav>
      </LiquidGlassBar>
    </motion.header>
  );
}
