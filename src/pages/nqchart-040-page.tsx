import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { NquiLogo } from "@nqlib/nqui";
import { ShowcaseTopBar, devTopBarLinks } from "../components/showcase-top-bar";
import { NQExampleReferenceRangeChart } from "../nqchart/catalog/adapters/ex-reference-range-chart";
import { NQExampleReferenceDomainPinnedLineChart } from "../nqchart/catalog/adapters/ex-reference-domain-pinned-line-chart";
import { NQExampleReferenceDomainAutoLineChart } from "../nqchart/catalog/adapters/ex-reference-domain-auto-line-chart";
import { NQExampleSignedBarChart } from "../nqchart/catalog/adapters/ex-signed-bar-chart";
import { NQExampleSignedStackBarChart } from "../nqchart/catalog/adapters/ex-signed-stack-bar-chart";
import { NQExampleSignedHorizontalBarChart } from "../nqchart/catalog/adapters/ex-signed-horizontal-bar-chart";
import "../components/landing/landing.css";
import "../components/blocks/blocks.css";
import "./charts-page.css";

function Stage({ children }: { children: ReactNode }) {
  return (
    <div className="aspect-[4/3] overflow-hidden rounded-lg border border-border bg-card">
      <div className="size-full min-h-0">{children}</div>
    </div>
  );
}

function Section({
  index,
  title,
  note,
  children,
}: {
  index: string;
  title: string;
  note: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="max-w-[68ch]">
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground/80">
          {index}
        </p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight">{title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{note}</p>
      </div>
      {children}
    </section>
  );
}

export function Nqchart040Page() {
  return (
    <div className="fl-page">
      <div className="fl-grid" aria-hidden />
      <div className="fl-glow" aria-hidden />

      <div className="relative z-[var(--z-base)] mx-auto w-[var(--fl-shell)] pb-24 pt-8">
        <ShowcaseTopBar
          brand={
            <Link to="/" className="flex items-center gap-2.5">
              <NquiLogo className="size-[22px]" />
              <span className="text-sm font-semibold tracking-tight">
                nqlib<span className="font-medium text-muted-foreground"> · NQChart 0.4</span>
              </span>
            </Link>
          }
          links={[
            { to: "/charts", label: "Gallery" },
            { to: "/charts/lab", label: "Lab" },
            { to: "/docs/nqchart", label: "Docs" },
            ...devTopBarLinks,
          ]}
        />

        <div className="mt-14 max-w-[56ch] md:mt-20">
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground/80">
            Local @nqlib/nqchart 0.4.0
          </p>
          <h1 className="mt-3 text-4xl font-semibold leading-[1.07] tracking-[-0.028em] md:text-5xl">
            NQChart 0.4
          </h1>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            The same examples as the gallery. Search the gallery for Reference or Signed.
          </p>
        </div>

        <div className="mt-12 space-y-16">
          <Section
            index="01"
            title="Dual-axis reference chart"
            note="Stretch sits on the left scale at 220. Index cap sits on the right scale at 60. The band above 190 is open at the top, and the interval breaks where March is null."
          >
            <Stage>
              <NQExampleReferenceRangeChart />
            </Stage>
          </Section>

          <Section
            index="02"
            title="Explicit axis max is left alone"
            note="The left chart keeps domain [0, 40]. Revenue stays inside that range, and the line at 80 does not widen the axis or appear. The right chart drops both, so the axis includes 80."
          >
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                <p className="font-mono text-xs text-muted-foreground">domain [0, 40] · includeInDomain false</p>
                <Stage>
                  <NQExampleReferenceDomainPinnedLineChart />
                </Stage>
              </div>
              <div className="space-y-2">
                <p className="font-mono text-xs text-muted-foreground">automatic domain</p>
                <Stage>
                  <NQExampleReferenceDomainAutoLineChart />
                </Stage>
              </div>
            </div>
          </Section>

          <Section
            index="03"
            title="Negative bar corners"
            note="January rounds at the top and is square at zero. February rounds at −8000 and is square at zero."
          >
            <Stage>
              <NQExampleSignedBarChart />
            </Stage>
          </Section>

          <Section
            index="04"
            title="Stacked gain and loss"
            note="Only More rounds at the top. Only Deeper rounds at the bottom. Segments that sit on zero stay square. The horizontal bars round away from zero."
          >
            <div className="grid gap-4 lg:grid-cols-2">
              <Stage>
                <NQExampleSignedStackBarChart />
              </Stage>
              <Stage>
                <NQExampleSignedHorizontalBarChart />
              </Stage>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}
