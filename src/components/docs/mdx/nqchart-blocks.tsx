import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ScrollArea, cn } from "@nqlib/nqui";
import { DocsCodeBlock } from "./docs-code-block";

export { ComponentPreview } from "./component-preview";

export function ComponentSource({
  name,
  title,
  className,
}: {
  name?: string;
  title?: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div className={cn("my-3 rounded-lg border border-dashed border-border bg-muted/40 p-3", className)}>
      <p className="text-xs font-medium text-foreground">{title ?? name ?? "Source"}</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Registry specimen{" "}
        {name ? (
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-[0.75rem] text-foreground">
            {name}
          </code>
        ) : null}
        . Browse the{" "}
        <Link to="/charts" className="font-medium text-foreground underline-offset-4 hover:underline">
          charts catalog
        </Link>{" "}
        or install from the NQChart registry.
      </p>
    </div>
  );
}

export function CommandBlock({ commands }: { commands?: string[] }) {
  const line = `pnpm add ${(commands ?? []).join(" ") || "…"}`;
  return <DocsCodeBlock lang="bash" code={line} />;
}

export function CliBlock({
  commands,
  action,
}: {
  commands?: string[];
  action?: string;
}) {
  if (action === "init") {
    return <DocsCodeBlock lang="bash" code="pnpm dlx shadcn@latest init" />;
  }
  const items = (commands ?? []).map((c) => `pnpm dlx shadcn@latest add ${c}`).join("\n");
  return <DocsCodeBlock lang="bash" code={items || "pnpm dlx shadcn@latest add @nqchart/…"} />;
}

export function SkillsBlock({ commands }: { commands?: string[] }) {
  const line = ["npx skills add", ...(commands ?? [])].join(" ");
  return <DocsCodeBlock lang="bash" code={line} />;
}

export function Alert({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "my-4 rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm text-muted-foreground",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function AlertContent({ children, className }: { children?: ReactNode; className?: string }) {
  return <div className={cn("leading-relaxed", className)}>{children}</div>;
}

export function ApiHeading({ children }: { children?: ReactNode }) {
  return <h3 className="mt-8 scroll-m-24 text-lg font-semibold text-foreground">{children}</h3>;
}

export function ApiTable({ children }: { children?: ReactNode }) {
  return (
    <ScrollArea
      orientation="horizontal"
      fadeMask={false}
      className="my-3 w-full max-w-full rounded-lg border border-border"
    >
      <table className="w-max min-w-full border-collapse text-xs">
        <tbody>{children}</tbody>
      </table>
    </ScrollArea>
  );
}

export function ApiRow({
  name,
  type,
  required,
  default: defaultValue,
  children,
}: {
  name?: string;
  type?: string;
  required?: boolean;
  default?: string;
  children?: ReactNode;
}) {
  return (
    <tr className="border-b border-border last:border-0">
      <td className="w-[7.5rem] shrink-0 whitespace-nowrap px-2.5 py-1.5 align-baseline font-mono text-[0.75rem] leading-snug text-foreground">
        {name}
        {required ? <span className="ml-1 text-destructive">*</span> : null}
      </td>
      <td className="min-w-[12rem] max-w-[36rem] px-2.5 py-1.5 align-baseline font-mono text-[0.75rem] leading-snug break-words text-muted-foreground">
        {type}
        {defaultValue != null && defaultValue !== "" ? (
          <span className="mt-0.5 block font-sans text-[0.6875rem] text-muted-foreground/80">
            default {defaultValue}
          </span>
        ) : null}
      </td>
      <td className="min-w-[10rem] px-2.5 py-1.5 align-baseline text-xs leading-snug text-muted-foreground [&_p]:m-0 [&_p]:leading-snug [&_p]:text-xs">
        {children}
      </td>
    </tr>
  );
}

const CHART_INDEX = [
  { name: "Area Chart", description: "Highlight trends with filled area ranges.", href: "/docs/nqchart/area-chart" },
  { name: "Line Chart", description: "Track change over time with lines.", href: "/docs/nqchart/line-chart" },
  { name: "Bar Chart", description: "Compare categories quickly with bold bars.", href: "/docs/nqchart/bar-chart" },
  { name: "Composed Chart", description: "Mix lines, bars, and areas in one view.", href: "/docs/nqchart/composed-chart" },
  { name: "Radar Chart", description: "Compare multi-metric profiles on radial axes.", href: "/docs/nqchart/radar-chart" },
  { name: "Pie Chart", description: "Show parts of a whole clearly.", href: "/docs/nqchart/pie-chart" },
  { name: "Heatmap Chart", description: "Read density across a matrix.", href: "/docs/nqchart/heatmap-chart" },
  { name: "Calendar Chart", description: "Map values onto a calendar grid.", href: "/docs/nqchart/calendar-chart" },
  { name: "Radial Chart", description: "Gauges and radial bars for targets.", href: "/docs/nqchart/radial-chart" },
  { name: "Scatter Chart", description: "Plot correlations and bubble sizes.", href: "/docs/nqchart/scatter-chart" },
  { name: "Treemap Chart", description: "Nest hierarchy into tiled rectangles.", href: "/docs/nqchart/treemap-chart" },
  { name: "Funnel Chart", description: "Stage conversion from lead to close.", href: "/docs/nqchart/funnel-chart" },
  { name: "Waterfall Chart", description: "Explain cumulative gains and losses.", href: "/docs/nqchart/waterfall-chart" },
  { name: "Sparkline Chart", description: "Inline trend marks for dense tables.", href: "/docs/nqchart/sparkline-chart" },
] as const;

export function ShowcaseGrid({ children, className }: { children?: ReactNode; className?: string }) {
  if (children) {
    return <div className={cn("my-4 grid gap-4 sm:grid-cols-2", className)}>{children}</div>;
  }

  return (
    <div className={cn("my-4 grid gap-3 sm:grid-cols-2", className)}>
      {CHART_INDEX.map((chart) => (
        <Link
          key={chart.href}
          to={chart.href}
          className="group rounded-lg border border-border bg-card/40 p-4 transition-colors hover:bg-muted/50"
        >
          <p className="text-sm font-semibold text-foreground group-hover:underline group-hover:underline-offset-4">
            {chart.name}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{chart.description}</p>
        </Link>
      ))}
    </div>
  );
}

export function ComponentProps({ children }: { children?: ReactNode }) {
  return <div className="my-4">{children}</div>;
}

/** Fallback for rare live JSX that isn't a docs primitive. */
export function DocsPassthrough({ children }: { children?: ReactNode }) {
  return <>{children}</>;
}
