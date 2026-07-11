/* eslint-disable react-refresh/only-export-components -- CRM kit: shared enterprise data and the presentational primitives that render it live together by design. */
import type { ReactNode } from "react";
import { Avatar, AvatarFallback, AvatarImage, Badge, cn } from "@nqlib/nqui";
import { PEOPLE, type Person } from "./avatar-stack";
import { COMPANY_GLYPHS } from "./company-logos";

/* ── Semantic status system ──────────────────────────────────────────────────
 * Colored text on a same-hue tint (never gray text on color). One dot color per
 * tint so a StatusBadge can read as a pill or a labelled dot.
 */
const TINTS = {
  emerald: "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  sky: "border-sky-500/25 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  amber: "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  rose: "border-rose-500/25 bg-rose-500/10 text-rose-700 dark:text-rose-300",
  violet: "border-violet-500/25 bg-violet-500/10 text-violet-700 dark:text-violet-300",
  neutral: "border-border bg-muted text-foreground/75",
} as const;

const DOTS: Record<Tint, string> = {
  emerald: "bg-emerald-500",
  sky: "bg-sky-500",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
  violet: "bg-violet-500",
  neutral: "bg-muted-foreground",
};

export type Tint = keyof typeof TINTS;

export function StatusBadge({
  tint,
  dot,
  children,
  className,
}: {
  tint: Tint;
  dot?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn("gap-1.5 rounded-full font-medium", TINTS[tint], className)}
    >
      {dot ? <span className={cn("size-1.5 rounded-full", DOTS[tint])} /> : null}
      {children}
    </Badge>
  );
}

/** Signed delta — green for good, rose for bad, with a direction glyph. */
export function Delta({ value, good = "up" }: { value: string; good?: "up" | "down" }) {
  const isUp = value.trim().startsWith("+") || value.trim().startsWith("↑");
  const positive = good === "up" ? isUp : !isUp;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 font-mono text-xs font-medium tabular-nums",
        positive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400",
      )}
    >
      <span aria-hidden>{isUp ? "↑" : "↓"}</span>
      {value.replace(/^[+↑↓]\s*/, "")}
    </span>
  );
}

/* ── Company monogram — rounded-square tinted mark ───────────────────────────*/
const MARK_TINTS: Record<string, string> = {
  northwind: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  contoso: "bg-violet-500/15 text-violet-700 dark:text-violet-300",
  meridian: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  atlas: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  vertex: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
  halcyon: "bg-teal-500/15 text-teal-700 dark:text-teal-300",
};

export function CompanyMark({ account, className }: { account: Account; className?: string }) {
  const Glyph = COMPANY_GLYPHS[account.mark];
  const initials = account.company
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("");
  return (
    <Avatar className={cn("rounded-[0.5rem]", className)}>
      <AvatarFallback className={cn("rounded-[0.5rem] font-semibold", MARK_TINTS[account.mark])}>
        {Glyph ? <Glyph className="size-[58%]" /> : initials}
      </AvatarFallback>
    </Avatar>
  );
}

/** A person chip — photo + name, shared cast from PEOPLE. */
export function PersonChip({ person, className }: { person: Person; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <Avatar className="size-6">
        <AvatarImage src={person.img} alt="" />
        <AvatarFallback className="text-[10px]">{person.initials}</AvatarFallback>
      </Avatar>
      <span className="truncate text-sm">{person.name}</span>
    </span>
  );
}

/* ── Stat tile — mono label, big number, optional delta ──────────────────────*/
export function StatTile({
  label,
  value,
  delta,
  deltaGood,
  sub,
}: {
  label: string;
  value: ReactNode;
  delta?: string;
  deltaGood?: "up" | "down";
  sub?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5 rounded-xl border bg-muted/40 p-4">
      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </span>
      <div className="flex items-baseline gap-2">
        <span className="whitespace-nowrap text-xl font-semibold tracking-tight tabular-nums">{value}</span>
        {delta ? <Delta value={delta} good={deltaGood} /> : null}
      </div>
      {sub ? <span className="text-xs text-muted-foreground">{sub}</span> : null}
    </div>
  );
}

/** Cheap CSS micro-trend for table rows — no chart engine, one per row. */
export function MicroTrend({ values, tint = "emerald" }: { values: number[]; tint?: Tint }) {
  const max = Math.max(...values);
  return (
    <div className="flex h-5 items-end gap-[3px]" aria-hidden>
      {values.map((v, i) => (
        <span
          key={i}
          className={cn("w-1 rounded-full", DOTS[tint])}
          style={{
            height: `${Math.max(14, (v / max) * 100)}%`,
            opacity: 0.3 + (i / (values.length - 1)) * 0.7,
          }}
        />
      ))}
    </div>
  );
}

/* ── Enterprise data ─────────────────────────────────────────────────────────*/
export type Stage = "Prospecting" | "Discovery" | "Negotiation" | "Committed";

export const STAGE_TINT: Record<Stage, Tint> = {
  Prospecting: "neutral",
  Discovery: "sky",
  Negotiation: "amber",
  Committed: "emerald",
};

export type Health = "Healthy" | "Watch" | "At risk";
export const HEALTH_TINT: Record<Health, Tint> = {
  Healthy: "emerald",
  Watch: "amber",
  "At risk": "rose",
};

export interface Account {
  id: string;
  mark: keyof typeof MARK_TINTS;
  company: string;
  domain: string;
  location: string;
  owner: Person;
  stage: Stage;
  health: Health;
  arr: string;
  intent: number[];
}

const [MAI, THANH, ANNA, RAFAEL, SOFIA] = PEOPLE;

export const ACCOUNTS: Account[] = [
  { id: "a-northwind", mark: "northwind", company: "Northwind Logistics", domain: "northwind.com", location: "Chicago, IL", owner: SOFIA, stage: "Negotiation", health: "Healthy", arr: "$480K", intent: [18, 22, 20, 31, 28, 44, 52, 61] },
  { id: "a-vertex", mark: "vertex", company: "Vertex Financial", domain: "vertexfin.com", location: "New York, NY", owner: RAFAEL, stage: "Committed", health: "Healthy", arr: "$720K", intent: [40, 44, 48, 51, 55, 60, 66, 74] },
  { id: "a-meridian", mark: "meridian", company: "Meridian Health", domain: "meridianhealth.io", location: "Boston, MA", owner: ANNA, stage: "Discovery", health: "Watch", arr: "$310K", intent: [30, 26, 33, 29, 35, 31, 38, 34] },
  { id: "a-atlas", mark: "atlas", company: "Atlas Manufacturing", domain: "atlasmfg.com", location: "Detroit, MI", owner: MAI, stage: "Negotiation", health: "Healthy", arr: "$540K", intent: [22, 30, 27, 41, 38, 47, 44, 55] },
  { id: "a-contoso", mark: "contoso", company: "Contoso Freight", domain: "contoso.com", location: "Dallas, TX", owner: THANH, stage: "Prospecting", health: "At risk", arr: "$180K", intent: [26, 21, 24, 18, 20, 15, 17, 12] },
  { id: "a-halcyon", mark: "halcyon", company: "Halcyon Retail", domain: "halcyon.co", location: "Seattle, WA", owner: MAI, stage: "Discovery", health: "Healthy", arr: "$295K", intent: [14, 18, 21, 25, 24, 30, 33, 39] },
];

/** Stakeholders on the flagship deal. */
export interface Stakeholder {
  person: Person;
  role: string;
  tag: string;
  tint: Tint;
}
export const DEAL_STAKEHOLDERS: Stakeholder[] = [
  { person: SOFIA, role: "VP Operations", tag: "Champion", tint: "emerald" },
  { person: RAFAEL, role: "Chief Financial Officer", tag: "Economic buyer", tint: "violet" },
  { person: ANNA, role: "Director of IT", tag: "Evaluator", tint: "neutral" },
];
