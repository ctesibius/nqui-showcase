/* eslint-disable react-refresh/only-export-components -- block manifest: composed block components plus the HERO_BLOCKS export live together by design. */
import type { ComponentType } from "react";
import {
  Badge,
  Button,
  Input,
  Kbd,
  Label,
  Progress,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@nqlib/nqui";
import { AvatarStack, PEOPLE } from "./avatar-stack";

/**
 * One composed "block" per library stage — a real UI fragment assembled from
 * nqui primitives (styled bars stand in for the chart/grid/gantt engines to
 * keep the hero light). These are the payoff: "combine the pieces into this."
 */

// Frosted over the city backdrop — same layering language as the nav pill.
const BLOCK = "flex h-[15rem] w-full flex-col gap-4 rounded-xl border bg-background/60 p-5 backdrop-blur-md";

// nqui — a workspace / deploy panel
function ComponentsBlock() {
  return (
    <div className={BLOCK}>
      <div className="flex items-center justify-between">
        <div className="leading-tight">
          <p className="text-sm font-medium">Meridian Web</p>
          <p className="text-xs text-muted-foreground">Design · 5 reviewers</p>
        </div>
        <Badge variant="outline" className="gap-1.5">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          Ready
        </Badge>
      </div>
      <AvatarStack people={PEOPLE.slice(0, 4)} size="size-8" extra={2} />
      <div className="flex items-center justify-between">
        <Label htmlFor="hero-auto" className="font-normal text-muted-foreground">Auto-deploy on merge</Label>
        <Switch id="hero-auto" defaultChecked />
      </div>
      <div className="mt-auto flex gap-2">
        <Button size="sm">Ship it</Button>
        <Button size="sm" variant="outline">Preview</Button>
      </div>
    </div>
  );
}

// nqchart — a KPI card with a bar sketch
function ChartsBlock() {
  const bars = [42, 58, 50, 71, 64, 88, 80];
  return (
    <div className={BLOCK}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">On-time delivery</p>
          <p className="mt-1 text-4xl font-semibold tracking-tight">100%</p>
        </div>
        <Badge variant="outline">+4.2%</Badge>
      </div>
      <div className="flex h-16 items-end gap-1.5">
        {bars.map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-sm"
            style={{ height: `${h}%`, background: i === bars.length - 2 ? "var(--primary)" : "color-mix(in oklch, var(--foreground) 22%, transparent)" }}
          />
        ))}
      </div>
      <div className="mt-auto flex flex-col gap-1.5">
        <div className="flex justify-between text-xs text-muted-foreground"><span>Capacity</span><span>82%</span></div>
        <Progress value={82} />
      </div>
    </div>
  );
}

// nqgrid — a formula bar + mini sheet
function GridBlock() {
  const rows = [
    ["Auth refactor", "48", "Merged"],
    ["Billing sync", "31", "Review"],
    ["A11y audit", "22", "Draft"],
  ];
  return (
    <div className={BLOCK}>
      <div className="flex items-center gap-2">
        <Kbd>fx</Kbd>
        <Input value="=SUM(B2:B4)" readOnly className="h-8 font-mono text-xs" />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Task</TableHead>
            <TableHead className="text-right">Effort</TableHead>
            <TableHead className="text-right">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map(([t, e, s], i) => (
            <TableRow key={t}>
              <TableCell className="font-medium">{t}</TableCell>
              <TableCell className={`text-right ${i === 0 ? "bg-primary/10 font-medium text-primary" : ""}`}>{e}</TableCell>
              <TableCell className="text-right text-muted-foreground">{s}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// nqgantt — a mini timeline
function TimelineBlock() {
  const tasks: { label: string; start: number; span: number; critical?: boolean }[] = [
    { label: "Design", start: 0, span: 34 },
    { label: "Build", start: 20, span: 46, critical: true },
    { label: "Review", start: 52, span: 26 },
    { label: "Ship", start: 72, span: 24 },
  ];
  return (
    <div className={BLOCK}>
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Q3 roadmap</p>
        <Badge variant="outline">Critical path</Badge>
      </div>
      <div className="flex flex-col gap-2.5">
        {tasks.map((t) => (
          <div key={t.label} className="flex items-center gap-3">
            <span className="w-12 shrink-0 text-xs text-muted-foreground">{t.label}</span>
            <div className="relative h-2.5 flex-1 rounded-full bg-foreground/5">
              <div
                className="absolute inset-y-0 rounded-full"
                style={{
                  left: `${t.start}%`,
                  width: `${t.span}%`,
                  background: t.critical ? "var(--primary)" : "color-mix(in oklch, var(--foreground) 40%, transparent)",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export const HERO_BLOCKS: ComponentType[] = [
  ComponentsBlock,
  ChartsBlock,
  GridBlock,
  TimelineBlock,
];
