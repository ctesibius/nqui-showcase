import { cn } from "@nqlib/nqui";
import type { ChartConfig } from "@nqlib/nqchart";
import * as FunnelC from "@nqlib/nqchart/funnel-chart";

/*
 * nqchart blocks for the /blocks tour. The full registry catalog (every family,
 * background, tooltip and variant) lives on /charts — /blocks only keeps charts
 * that answer a business question.
 *
 * Stuck dashed cursor / series clipped mid-plot → see
 * `.cursor/skills/nqchart-embed/SKILL.md` (intro×hover race vs hit-test desync).
 */

const hue = (label: string, n: number): ChartConfig[string] => ({
  label,
  colors: { light: [`var(--chart-${n})`], dark: [`var(--chart-${n})`] },
});

/*
 * Funnel story — an annual-report figure, not a card grid. A ruled ledger of
 * four acts on the left; the live funnel on the right. The design move: the
 * carry-through rates live ON the rules between acts, and those same rules
 * continue across the gutter as the funnel's seam lines — the transition
 * annotates the boundary it belongs to, on both sides, at the same y.
 * Ink everywhere; the chart hues appear only in the funnel, the seam lines,
 * and a 2px swatch keying each act to its slice.
 */

type JourneyAct = {
  act: string;
  stage: string;
  value: number;
  desc: string;
  n: number;
};

const JOURNEY: JourneyAct[] = [
  {
    act: "Attract",
    stage: "Awareness",
    value: 48200,
    desc: "Launch posts and SEO bring people to the door.",
    n: 1,
  },
  {
    act: "Inform",
    stage: "Consideration",
    value: 18600,
    desc: "Docs and live demos answer the hard questions.",
    n: 2,
  },
  {
    act: "Convert",
    stage: "Conversion",
    value: 5300,
    desc: "Trials switch on billing and become workspaces.",
    n: 3,
  },
  {
    act: "Engage",
    stage: "Loyalty",
    value: 2150,
    desc: "Champions renew, expand seats, and refer teams.",
    n: 4,
  },
];

const JOURNEY_CFG: ChartConfig = Object.fromEntries(
  JOURNEY.map((j) => [j.stage, hue(j.stage, j.n)]),
);
const JOURNEY_DATA = JOURNEY.map((j) => ({ stage: j.stage, value: j.value }));

export function FunnelStoryBlock() {
  const first = JOURNEY[0].value;
  const last = JOURNEY[JOURNEY.length - 1].value;
  return (
    <div className="flex h-full min-h-0 flex-col bg-card px-5 pt-3 pb-2.5">
      {/* Figure head: heavy top rule, mono kicker, title + the whole journey in one line. */}
      <header className="border-t-2 border-foreground/85">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 pt-2">
          <p className="font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
            Fig. 01 · FY26 acquisition funnel
          </p>
          <p className="font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
            One dataset · four acts
          </p>
        </div>
        <div className="mt-1 mb-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <h3 className="text-base font-semibold tracking-[-0.01em]">
            From first visit to renewal
          </h3>
          <p className="text-xs text-muted-foreground tabular-nums">
            <span className="font-medium text-foreground">{first.toLocaleString()}</span> in
            {" · "}
            <span className="font-medium text-foreground">{last.toLocaleString()}</span> retained
            {" · "}
            <span className="font-medium text-foreground">
              {((last / first) * 100).toFixed(1)}%
            </span>{" "}
            end-to-end
          </p>
        </div>
      </header>

      <div className="grid min-h-[15rem] flex-1 grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] gap-x-6">
        {/* The acts ledger. Equal rows; the rule between two acts carries the
            carry-through rate — the fact that belongs to neither act alone. */}
        <div className="flex min-w-0 flex-col">
          {JOURNEY.map((j, i) => {
            const prev = i === 0 ? null : JOURNEY[i - 1].value;
            return (
              <div
                key={j.act}
                className={cn(
                  "relative flex min-h-0 flex-1 flex-col justify-center",
                  i > 0 && "border-t border-border",
                )}
              >
                {prev ? (
                  <span className="absolute -top-[7px] right-0 bg-card pl-2 font-mono text-[10px] text-muted-foreground tabular-nums">
                    {Math.round((j.value / prev) * 100)}% continue
                  </span>
                ) : null}
                <div className="flex items-baseline gap-3">
                  <span className="w-6 shrink-0 font-mono text-sm text-muted-foreground/50 tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <p className="text-[13px] font-semibold">{j.act}</p>
                      <p className="hidden font-mono text-[10px] tracking-[0.08em] text-muted-foreground uppercase sm:block">
                        {j.stage}
                      </p>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">{j.desc}</p>
                  </div>
                  <span className="flex shrink-0 items-center gap-1.5">
                    <span
                      className="size-2 rounded-[2px]"
                      style={{ backgroundColor: `var(--chart-${j.n})` }}
                      aria-hidden
                    />
                    <span className="text-sm font-semibold tabular-nums">
                      {j.value.toLocaleString()}
                    </span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="min-h-0 min-w-0">
          <div className="relative h-full w-full">
            {/* Seam lines: the ledger rules continue across the gutter and
                into the funnel at the boundary between slices — drawn behind
                the chart so each one tucks under the taper wherever it lands. */}
            <svg
              className="pointer-events-none absolute inset-y-0 -left-6 h-full w-[64%]"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden
            >
              {[1, 2, 3].map((i) => (
                <line
                  key={i}
                  x1="0"
                  y1={i * 25}
                  x2="58"
                  y2={i * 25}
                  stroke={`var(--chart-${JOURNEY[i].n})`}
                  strokeWidth="1"
                  vectorEffect="non-scaling-stroke"
                  opacity="0.75"
                />
              ))}
            </svg>
            <div className="relative h-full w-full">
              <FunnelC.NQFunnelChart
                config={JOURNEY_CFG}
                data={JOURNEY_DATA}
                stageKey="stage"
                valueKey="value"
                taper="soft"
                className="h-full w-full"
              >
                <FunnelC.Stages />
                <FunnelC.Tooltip />
              </FunnelC.NQFunnelChart>
            </div>
          </div>
        </div>
      </div>

      <footer className="mt-3 border-t border-border pt-1.5">
        <p className="font-mono text-[9px] tracking-[0.14em] text-muted-foreground/70 uppercase">
          Source: product analytics · carry rates annotate stage boundaries
        </p>
      </footer>
    </div>
  );
}
