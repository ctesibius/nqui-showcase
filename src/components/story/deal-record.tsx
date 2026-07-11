import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import type { ChartConfig } from "@nqlib/nqchart";
import * as SparklineC from "@nqlib/nqchart/sparkline-chart";
import { Button, Separator } from "@nqlib/nqui";
import { STORY_EASE } from "./scroll-hooks";
import {
  ACCOUNTS,
  CompanyMark,
  DEAL_STAKEHOLDERS,
  Delta,
  StatTile,
  StatusBadge,
} from "./crm-kit";
import { ArrowUpRight, Building, Check, Mail, MoreH, Pencil, Sparkle, X } from "./crm-icons";

const DEAL = ACCOUNTS[0]; // Northwind Logistics

const INTENT = [16, 20, 18, 27, 24, 33, 30, 44, 52, 49, 63, 71].map((value) => ({ value }));
const INTENT_CONFIG = {
  value: { label: "Buying intent", colors: { light: ["var(--chart-2)"], dark: ["var(--chart-2)"] } },
} satisfies ChartConfig;

const STATS = [
  { label: "Deal value", value: "$480K", delta: "+12%" as const, sub: "Annual contract" },
  { label: "Weighted", value: "$312K", sub: "65% to close" },
  { label: "Close date", value: "Aug 2026", sub: "Q3 · 34 days out" },
  { label: "Seats", value: "240", sub: "3-year term" },
];

/** Suggested next actions the assistant has drafted — accept / edit / dismiss. */
const ACTIONS = [
  { id: "pricing", title: "Send enterprise pricing", sub: "Email draft · 240 seats, SSO, 99.9% SLA" },
  { id: "enrich", title: "Enrich account fields", sub: "6 updates · headcount, tech stack, renewal" },
];

function MicroAction({
  label,
  tone,
  onClick,
  children,
}: {
  label: string;
  tone?: "confirm" | "ghost";
  onClick?: () => void;
  children: ReactNode;
}) {
  return (
    <Button
      variant="ghost"
      aria-label={label}
      onClick={onClick}
      className={`size-7 shrink-0 rounded-md p-0 text-muted-foreground ${
        tone === "confirm" ? "hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400" : "hover:text-foreground"
      }`}
    >
      {children}
    </Button>
  );
}

/**
 * The one live moment: the drafted actions actually respond. Approve or dismiss
 * animates the card out, a confirmation chip slides in, and clearing the queue
 * reveals an empty state you can restore from.
 */
function SuggestedActions() {
  const reduce = useReducedMotion() ?? false;
  const [pending, setPending] = useState(ACTIONS);
  const [flash, setFlash] = useState<{ text: string; ok: boolean } | null>(null);
  const timer = useRef<number | null>(null);

  const say = (text: string, ok: boolean) => {
    setFlash({ text, ok });
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setFlash(null), 2600);
  };
  useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current); }, []);

  const resolve = (id: string, title: string, ok: boolean) => {
    setPending((p) => p.filter((a) => a.id !== id));
    say(ok ? `Queued to send — ${title}` : `Dismissed — ${title}`, ok);
  };
  const restore = () => {
    setPending(ACTIONS);
    say("Suggestions restored", true);
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          Suggested · review before send
        </p>
        {pending.length < ACTIONS.length ? (
          <button
            type="button"
            onClick={restore}
            className="rounded text-[11px] text-muted-foreground underline-offset-2 transition-colors hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Restore
          </button>
        ) : null}
      </div>

      <AnimatePresence initial={false} mode="popLayout">
        {pending.map((a) => (
          <motion.div
            key={a.id}
            layout={!reduce}
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, x: 28, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.28, ease: STORY_EASE }}
            className="mb-2 flex items-center gap-3 overflow-hidden rounded-lg border bg-background p-3"
          >
            <CompanyMark account={DEAL} className="size-8" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{a.title}</p>
              <p className="truncate text-xs text-muted-foreground">{a.sub}</p>
            </div>
            <div className="flex items-center">
              <MicroAction label={`Dismiss ${a.title}`} onClick={() => resolve(a.id, a.title, false)}><X /></MicroAction>
              <MicroAction label={`Edit ${a.title}`}><Pencil /></MicroAction>
              <MicroAction label={`Approve ${a.title}`} tone="confirm" onClick={() => resolve(a.id, a.title, true)}><Check /></MicroAction>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {pending.length === 0 ? (
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: STORY_EASE }}
          className="flex flex-col items-center gap-1 rounded-lg border border-dashed py-7 text-center"
        >
          <span className="flex size-8 items-center justify-center rounded-full bg-emerald-500/12 text-emerald-600 dark:text-emerald-400">
            <Check className="size-4" />
          </span>
          <p className="text-sm font-medium">All caught up</p>
          <p className="text-xs text-muted-foreground">No suggestions waiting on you.</p>
        </motion.div>
      ) : null}

      <AnimatePresence>
        {flash ? (
          <motion.p
            key={flash.text}
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.2, ease: STORY_EASE }}
            className="mt-2 flex items-center gap-2 rounded-md bg-foreground px-3 py-2 text-xs font-medium text-background"
            role="status"
          >
            {flash.ok ? <Check className="size-3.5 shrink-0" /> : <X className="size-3.5 shrink-0" />}
            <span className="truncate">{flash.text}</span>
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export function DealRecord() {
  // Defer the sparkline until it's actually on screen so its left-to-right draw
  // plays for the viewer (mounting it eagerly means it animates out of sight).
  // Hidden documents (headless/prerender) never fire the observer — render then.
  const sparkRef = useRef<HTMLDivElement>(null);
  const sparkInView = useInView(sparkRef, { once: true, margin: "0px 0px -12% 0px" });
  const [hiddenAtMount] = useState(
    () => typeof document !== "undefined" && document.visibilityState === "hidden",
  );
  const showSpark = sparkInView || hiddenAtMount;

  return (
    <div className="grid gap-px overflow-hidden rounded-lg bg-border lg:grid-cols-[1.45fr_1fr]">
      {/* ── The record ─────────────────────────────────────────────────────── */}
      <div className="flex min-w-0 flex-col gap-6 bg-background p-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          <CompanyMark account={DEAL} className="size-11" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-lg font-semibold tracking-tight">{DEAL.company}</h3>
              <span className="inline-flex items-center gap-0.5 text-xs text-muted-foreground">
                {DEAL.domain} <ArrowUpRight className="size-3" />
              </span>
            </div>
            <p className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-muted-foreground">
              <Building className="size-3.5" />
              {DEAL.location}
              <span aria-hidden>·</span>
              Logistics
              <span aria-hidden>·</span>
              2,400 employees
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <Button variant="ghost" aria-label="More" className="size-8 rounded-md p-0 text-muted-foreground hover:text-foreground">
              <MoreH />
            </Button>
            <Button size="sm">Log activity</Button>
          </div>
        </div>

        {/* Status badges */}
        <div className="flex flex-wrap gap-2">
          <StatusBadge tint="emerald" dot>Healthy</StatusBadge>
          <StatusBadge tint="amber" dot>Negotiation</StatusBadge>
          <StatusBadge tint="neutral">Enterprise</StatusBadge>
          <StatusBadge tint="violet">Expansion</StatusBadge>
        </div>

        {/* Stat tiles */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {STATS.map((s) => (
            <StatTile key={s.label} label={s.label} value={s.value} delta={s.delta} sub={s.sub} />
          ))}
        </div>

        {/* Buying intent — a live nqchart sparkline */}
        <div className="rounded-xl border bg-muted/40 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                Buying intent · 30 days
              </p>
              <p className="mt-1 flex items-baseline gap-2">
                <span className="text-lg font-semibold">High</span>
                <Delta value="+18%" />
              </p>
            </div>
            <StatusBadge tint="sky" className="shrink-0 whitespace-nowrap">Signal rising</StatusBadge>
          </div>
          <div ref={sparkRef} className="mt-3 h-14">
            {showSpark ? (
              <SparklineC.NQSparklineChart config={INTENT_CONFIG} data={INTENT} valueDataKey="value" className="h-full w-full">
                <SparklineC.Fill dataKey="value" />
                <SparklineC.Sparkline dataKey="value" />
                <SparklineC.EndDot />
                <SparklineC.Tooltip />
              </SparklineC.NQSparklineChart>
            ) : null}
          </div>
        </div>

        {/* Stakeholders */}
        <div>
          <p className="mb-2.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            Stakeholders · 3
          </p>
          <div className="flex flex-col divide-y divide-border/70">
            {DEAL_STAKEHOLDERS.map(({ person, role, tag, tint }) => (
              <div key={person.name} className="flex items-center gap-3 py-2.5">
                <img src={person.img} alt="" className="size-8 rounded-full object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{person.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{role}</p>
                </div>
                <StatusBadge tint={tint}>{tag}</StatusBadge>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── AI signal panel ────────────────────────────────────────────────── */}
      <div className="flex min-w-0 flex-col gap-4 bg-muted/40 p-6">
        <div className="flex items-center gap-2.5">
          <span className="flex size-7 items-center justify-center rounded-md bg-violet-500/15 text-violet-600 dark:text-violet-300">
            <Sparkle className="size-4" />
          </span>
          <p className="text-sm font-semibold">Signal digest</p>
          <StatusBadge tint="violet" className="ml-auto">2 new</StatusBadge>
        </div>

        <p className="text-sm leading-relaxed text-muted-foreground">
          Two buying signals on Northwind this week — both point to an expansion. Their VP asked
          about seat pricing and audit logs.
        </p>

        {/* Email source with a highlighted ask */}
        <figure className="rounded-xl border bg-background p-4">
          <figcaption className="mb-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            <span>Source</span>
            <span>2 / 2</span>
          </figcaption>
          <blockquote className="text-sm leading-relaxed">
            We’re comparing vendors this week.{" "}
            <mark className="rounded bg-sky-500/15 px-0.5 text-foreground decoration-clone">
              Can you send enterprise pricing for 240 seats, plus SSO and audit-log details?
            </mark>{" "}
            Timeline is end of quarter.
          </blockquote>
          <div className="mt-3 flex items-center gap-2 border-t pt-3 text-xs text-muted-foreground">
            <Mail className="size-4 shrink-0" />
            <span className="truncate">Re: Enterprise rollout — Sofia Marín</span>
            <span className="ml-auto shrink-0 tabular-nums">Jul 6</span>
          </div>
        </figure>

        {/* Suggested actions — live: approve / dismiss / restore */}
        <SuggestedActions />

        <Separator className="mt-auto" />
        <p className="text-center text-xs text-muted-foreground">
          Drafted from CRM activity · nothing sent without approval
        </p>
      </div>
    </div>
  );
}
