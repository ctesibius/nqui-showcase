import type { ReactNode } from "react";
import { Reveal, ScrollDrift } from "./motion-primitives";

/**
 * One story chapter: eyebrow → headline → lede, then a payoff slot.
 * Spacing carries the hierarchy — the payoff is not a nested card.
 */
export function Chapter({
  id,
  eyebrow,
  headline,
  lede,
  children,
  align = "left",
}: {
  id: string;
  eyebrow: string;
  headline: string;
  lede: string;
  children?: ReactNode;
  align?: "left" | "center";
}) {
  const centered = align === "center";

  return (
    <section id={id} className="scroll-mt-16 px-6 py-28 md:py-40">
      <div className="mx-auto w-full max-w-6xl">
        <Reveal className={centered ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            {eyebrow}
          </p>
          <h2 className="mt-4 text-balance text-4xl font-semibold tracking-tight md:text-6xl">
            {headline}
          </h2>
          <p className="mt-5 text-pretty text-lg leading-relaxed text-muted-foreground md:text-xl">
            {lede}
          </p>
        </Reveal>
        {children}
      </div>
    </section>
  );
}

/**
 * Framed viewport for a live embedded product surface — a window, not a card.
 */
export function DemoFrame({
  title,
  children,
  className = "",
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <ScrollDrift className={`mt-14 md:mt-20 ${className}`}>
      <div className="overflow-hidden rounded-xl border bg-background">
        <div className="flex h-9 items-center gap-2 border-b bg-muted/40 px-4">
          <span aria-hidden className="size-2.5 rounded-full bg-border" />
          <span aria-hidden className="size-2.5 rounded-full bg-border" />
          <span aria-hidden className="size-2.5 rounded-full bg-border" />
          <span className="ml-2 truncate text-xs text-muted-foreground">{title}</span>
        </div>
        {children}
      </div>
    </ScrollDrift>
  );
}
