/**
 * Seeded business datasets for the pivot blocks on /blocks and the landing window.
 *
 * Deterministic (no `Math.random`): the same rows on every load, so a screenshot
 * or a sentence in the docs can point at a number and it stays put. Shapes match
 * what a real warehouse export looks like — one flat record per deal / ticket.
 */
import type { PivotDataRow, PivotFieldSpec, PivotNumberFormat } from "@nqlib/nqgrid/core";

function lcg(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

export const usd: PivotNumberFormat = { style: "currency", currency: "USD" };
export const usdCompact: PivotNumberFormat = { style: "currency", currency: "USD", compact: true };
export const pct: PivotNumberFormat = { style: "percent", decimals: 1 };
export const signedPct: PivotNumberFormat = { style: "percent", decimals: 1, signDisplay: "exceptZero" };

/* ── Bookings: closed-won deals, FY26 (Feb 2025 – Jan 2026) ─────────────────── */

const MARKETS = {
  AMER: { "United States": 3.2, Canada: 0.7, Brazil: 0.5, Mexico: 0.4 },
  EMEA: { "United Kingdom": 1.2, Germany: 1.1, France: 0.8, Nordics: 0.6 },
  APAC: { Japan: 0.9, Australia: 0.7, Singapore: 0.5, India: 0.6 },
} as const;

/** Plan attainment bias per country: some markets beat plan, some miss — a real review has both. */
const ATTAINMENT: Record<string, number> = {
  "United States": 1.04,
  Canada: 0.93,
  Brazil: 1.12,
  Mexico: 0.88,
  "United Kingdom": 1.01,
  Germany: 1.08,
  France: 0.91,
  Nordics: 0.97,
  Japan: 0.86,
  Australia: 1.06,
  Singapore: 1.15,
  India: 1.02,
};

const PRODUCTS = [
  { name: "Platform", weight: 0.42, acv: 64_000 },
  { name: "Analytics", weight: 0.26, acv: 38_000 },
  { name: "Security", weight: 0.2, acv: 52_000 },
  { name: "Support", weight: 0.12, acv: 14_000 },
] as const;

const SEGMENTS = [
  { name: "Enterprise", weight: 0.3, size: 2.6 },
  { name: "Mid-market", weight: 0.42, size: 1 },
  { name: "SMB", weight: 0.28, size: 0.32 },
] as const;

const REPS: Record<string, string[]> = {
  AMER: ["Maya Patel", "Jordan Lee", "Sofia Ramos", "Ethan Brooks", "Ava Thompson"],
  EMEA: ["Lukas Weber", "Chloé Martin", "Oliver Hughes", "Freya Lund"],
  APAC: ["Haruto Sato", "Priya Nair", "Liam Chen", "Isla Walker"],
};

const ACCOUNTS = [
  "Northwind", "Contoso", "Fabrikam", "Tailspin", "Wingtip", "Litware", "Adatum", "Proseware",
  "Lucerne", "Fourth Coffee", "Margie's Travel", "Humongous", "Woodgrove", "Coho Winery",
  "Alpine Ski House", "Blue Yonder", "Trey Research", "Wide World Importers", "Relecloud", "VanArsdel",
];

function weighted<T extends { weight: number }>(rand: () => number, list: readonly T[]): T {
  let r = rand();
  for (const item of list) {
    r -= item.weight;
    if (r <= 0) return item;
  }
  return list[list.length - 1]!;
}

function generateBookings(count = 1400): PivotDataRow[] {
  const rand = lcg(2026);
  const countries = Object.entries(MARKETS).flatMap(([region, cs]) =>
    Object.entries(cs).map(([country, w]) => ({ region, country, weight: w })),
  );
  const totalW = countries.reduce((s, c) => s + c.weight, 0);
  const markets = countries.map((c) => ({ ...c, weight: c.weight / totalW }));
  const rows: PivotDataRow[] = [];
  for (let i = 0; i < count; i++) {
    const m = weighted(rand, markets);
    const product = weighted(rand, PRODUCTS);
    const segment = weighted(rand, SEGMENTS);
    // Fiscal year starts in February; back-loaded quarters, like most software sales.
    const fm = Math.min(11, Math.floor(Math.pow(rand(), 0.8) * 12)); // 0 = Feb 2025
    const year = fm < 11 ? 2025 : 2026;
    const month = ((fm + 1) % 12) + 1;
    const day = 1 + Math.floor(rand() * 28);
    const arr = Math.round((product.acv * segment.size * (0.45 + rand() * 1.2)) / 100) * 100;
    // Company-wide the year lands a few points over plan; countries spread around that.
    const plan = Math.round(arr / (1.03 * ATTAINMENT[m.country]! * (0.9 + rand() * 0.2)) / 100) * 100;
    const reps = REPS[m.region]!;
    rows.push({
      dealId: `D-${String(24001 + i)}`,
      closeDate: `${year}-${pad(month)}-${pad(day)}`,
      region: m.region,
      country: m.country,
      segment: segment.name,
      channel: rand() < 0.68 ? "Direct" : "Partner",
      product: product.name,
      rep: reps[Math.floor(rand() * reps.length)]!,
      account: `${ACCOUNTS[Math.floor(rand() * ACCOUNTS.length)]!}${rand() < 0.5 ? "" : " Group"}`,
      arr,
      plan,
    });
  }
  return rows;
}

export const BOOKINGS: readonly PivotDataRow[] = generateBookings();

export const BOOKINGS_FIELDS: readonly PivotFieldSpec[] = [
  { field: "closeDate", label: "Close date", type: "date", fiscalYearStartMonth: 2 },
  { field: "region", label: "Region" },
  { field: "country", label: "Country" },
  { field: "segment", label: "Segment" },
  { field: "channel", label: "Channel" },
  { field: "product", label: "Product" },
  { field: "rep", label: "Account executive" },
  { field: "account", label: "Account" },
  { field: "dealId", label: "Deal", type: "text" },
  { field: "arr", label: "New ARR", type: "measure", format: usd },
  { field: "plan", label: "Plan", type: "measure", format: usd },
];

/* ── Support: tickets resolved in the last 12 weeks ───────────────────────── */

const TEAMS = [
  { name: "Billing", load: 0.24, speed: 0.8 },
  { name: "Platform", load: 0.31, speed: 1.35 },
  { name: "Integrations", load: 0.27, speed: 1.15 },
  { name: "Onboarding", load: 0.18, speed: 0.7 },
] as const;

const PRIORITIES = [
  { name: "P1 · Urgent", weight: 0.06, slaHours: 4, base: 2.6 },
  { name: "P2 · High", weight: 0.19, slaHours: 12, base: 8 },
  { name: "P3 · Normal", weight: 0.5, slaHours: 48, base: 26 },
  { name: "P4 · Low", weight: 0.25, slaHours: 120, base: 58 },
] as const;

const SUPPORT_CHANNELS = [
  { name: "Email", weight: 0.46 },
  { name: "Chat", weight: 0.38 },
  { name: "Phone", weight: 0.16 },
] as const;

/** 12 weeks of tickets ending the week of 2026-01-26 (Mondays). */
function generateTickets(count = 2400): PivotDataRow[] {
  const rand = lcg(7);
  const rows: PivotDataRow[] = [];
  const firstMonday = Date.UTC(2025, 10, 10); // 2025-11-10
  for (let i = 0; i < count; i++) {
    const team = weighted(rand, TEAMS.map((t) => ({ ...t, weight: t.load })));
    const prio = weighted(rand, PRIORITIES);
    const channel = weighted(rand, SUPPORT_CHANNELS);
    const week = Math.floor(rand() * 12);
    const day = Math.floor(rand() * 5);
    const d = new Date(firstMonday + (week * 7 + day) * 86_400_000);
    // Holiday weeks (6–7) run slower; a log-normal-ish tail keeps the averages honest.
    const holiday = week === 6 || week === 7 ? 1.45 : 1;
    const tail = Math.exp((rand() - 0.5) * 1.6);
    const hours = +(prio.base * team.speed * holiday * tail).toFixed(1);
    const firstResponse = +(Math.min(hours, prio.slaHours * 0.12 * (0.4 + rand() * 1.4) * holiday)).toFixed(2);
    rows.push({
      ticketId: `T-${String(88001 + i)}`,
      opened: d.toISOString().slice(0, 10),
      team: team.name,
      priority: prio.name,
      channel: channel.name,
      tickets: 1,
      resolutionHours: hours,
      firstResponseHours: firstResponse,
      metSla: hours <= prio.slaHours ? 1 : 0,
      csat: Math.max(1, Math.min(5, Math.round(5.2 - hours / (prio.slaHours * 0.9) - rand() * 0.9))),
    });
  }
  return rows;
}

export const TICKETS: readonly PivotDataRow[] = generateTickets();

export const TICKET_FIELDS: readonly PivotFieldSpec[] = [
  { field: "opened", label: "Opened", type: "date" },
  { field: "team", label: "Team" },
  { field: "priority", label: "Priority" },
  { field: "channel", label: "Channel" },
  { field: "ticketId", label: "Ticket", type: "text" },
  { field: "tickets", label: "Tickets", type: "measure" },
  { field: "resolutionHours", label: "Resolution (h)", type: "measure", aggregate: "avg" },
  { field: "firstResponseHours", label: "First response (h)", type: "measure", aggregate: "avg" },
  { field: "metSla", label: "Within SLA", type: "measure", aggregate: "avg" },
  { field: "csat", label: "CSAT", type: "measure", aggregate: "avg" },
];

/* ── Pipeline: open opportunities by stage ─────────────────────────────────── */

const STAGES = [
  { name: "Discovery", weight: 0.34, prob: 0.1 },
  { name: "Evaluation", weight: 0.27, prob: 0.25 },
  { name: "Proposal", weight: 0.2, prob: 0.5 },
  { name: "Negotiation", weight: 0.12, prob: 0.75 },
  { name: "Commit", weight: 0.07, prob: 0.9 },
] as const;

export const PIPELINE_STAGES = STAGES.map((s) => s.name);

function generatePipeline(count = 900): PivotDataRow[] {
  const rand = lcg(314);
  const teams = Object.entries(REPS);
  const rows: PivotDataRow[] = [];
  for (let i = 0; i < count; i++) {
    const [region, reps] = teams[Math.floor(rand() * teams.length)]!;
    // Some reps carry far bigger books than others — Top N needs a real spread.
    const repIndex = Math.min(reps.length - 1, Math.floor(Math.pow(rand(), 1.6) * reps.length));
    const stage = weighted(rand, STAGES);
    const product = weighted(rand, PRODUCTS);
    const segment = weighted(rand, SEGMENTS);
    const amount = Math.round((product.acv * segment.size * (0.5 + rand() * 1.3)) / 500) * 500;
    rows.push({
      oppId: `O-${String(51001 + i)}`,
      region,
      rep: reps[repIndex]!,
      stage: stage.name,
      product: product.name,
      segment: segment.name,
      account: ACCOUNTS[Math.floor(rand() * ACCOUNTS.length)]!,
      amount,
      weighted: Math.round(amount * stage.prob),
      deals: 1,
    });
  }
  return rows;
}

export const PIPELINE: readonly PivotDataRow[] = generatePipeline();

export const PIPELINE_FIELDS: readonly PivotFieldSpec[] = [
  { field: "region", label: "Region" },
  { field: "rep", label: "Account executive" },
  { field: "stage", label: "Stage" },
  { field: "product", label: "Product" },
  { field: "segment", label: "Segment" },
  { field: "account", label: "Account" },
  { field: "oppId", label: "Opportunity", type: "text" },
  { field: "amount", label: "Amount", type: "measure", format: usd },
  { field: "weighted", label: "Weighted", type: "measure", format: usd },
  { field: "deals", label: "Deals", type: "measure" },
];
