import { Chapter } from "./chapter";
import { Reveal } from "./motion-primitives";
import { FlipCard } from "./flip-card";
import { EXAMPLE_BLOCKS, type ExampleBlock } from "./example-blocks";

/** The "engineering drawing" face — part label, BOM, crop-mark corners. */
function SpecFace({ block }: { block: ExampleBlock }) {
  return (
    <div className="relative flex h-full w-full flex-col rounded-xl border bg-background p-5">
      {/* crop marks */}
      <span aria-hidden className="absolute left-2 top-2 size-2 border-l border-t border-foreground/40" />
      <span aria-hidden className="absolute right-2 top-2 size-2 border-r border-t border-foreground/40" />
      <span aria-hidden className="absolute bottom-2 left-2 size-2 border-b border-l border-foreground/40" />
      <span aria-hidden className="absolute bottom-2 right-2 size-2 border-b border-r border-foreground/40" />

      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        {block.part}
      </p>
      <p className="mt-1 text-lg font-medium">{block.name}</p>

      <div className="mt-4 flex-1 rounded-lg border border-dashed border-foreground/25" />

      <div className="mt-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          Bill of materials
        </p>
        <ul className="mt-1.5 flex flex-wrap gap-1.5">
          {block.bom.map((piece) => (
            <li key={piece} className="rounded-full bg-foreground/5 px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
              {piece}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function BlocksChapter() {
  return (
    <Chapter
      id="blocks"
      eyebrow="nqlib in practice — blocks"
      headline="Drawn, then shipped."
      lede="Six patterns assembled from the libraries. Each starts as a drawing and flips into the working part — take the idea, keep the pieces."
    >
      <Reveal className="mt-14 md:mt-20">
        {/* The workbench mat — measured grid with a drawing title block. */}
        <div
          className="relative rounded-2xl border p-6 pt-10 md:p-10 md:pt-12"
          style={{
            backgroundImage: [
              "repeating-linear-gradient(0deg, color-mix(in oklab, var(--foreground) 10%, transparent) 0 1px, transparent 1px 120px)",
              "repeating-linear-gradient(90deg, color-mix(in oklab, var(--foreground) 10%, transparent) 0 1px, transparent 1px 120px)",
              "repeating-linear-gradient(0deg, color-mix(in oklab, var(--foreground) 5%, transparent) 0 1px, transparent 1px 24px)",
              "repeating-linear-gradient(90deg, color-mix(in oklab, var(--foreground) 5%, transparent) 0 1px, transparent 1px 24px)",
            ].join(","),
            backgroundColor: "color-mix(in oklab, var(--muted) 55%, var(--background))",
          }}
        >
          <p className="absolute left-4 top-3 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            nqlib · block assembly
          </p>
          <p className="absolute bottom-3 right-4 hidden font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground sm:block">
            grid 24 · scale 1:1
          </p>

          <div className="grid gap-x-5 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">
            {EXAMPLE_BLOCKS.map((block, i) => (
              <FlipCard
                key={block.id}
                index={i}
                name={block.name}
                front={<SpecFace block={block} />}
                back={<block.Render />}
              />
            ))}
          </div>
        </div>
      </Reveal>
    </Chapter>
  );
}
