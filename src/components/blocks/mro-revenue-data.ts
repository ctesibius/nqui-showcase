/**
 * MRO revenue outlook — a seeded simulation of a component repair shop.
 *
 * Every work order (WO) is received against a part number (PN). At receipt it
 * is valued at the running average of that PN's previous invoices (or its
 * product line's, when the PN has no history yet). It ships after the PN's
 * turnaround plus any holds (awaiting parts, quote approval) and is invoiced
 * at the real repair scope, which the estimate only approximates.
 *
 * The projection never peeks at the simulated truth: open WOs ship at their
 * PN's expected turnaround, WOs not yet received arrive at the trailing
 * weekday intake rate, and the band comes from how far weekly invoicing
 * landed from its estimates over the last 26 weeks.
 *
 * Storage is columnar (typed arrays) so 240,000 WOs build in a few hundred
 * milliseconds and every aggregate is a single pass over plain numbers.
 */

const DAY_MS = 86_400_000;

export const MRO_SCALES = [
  { value: 12_000, label: "12k" },
  { value: 60_000, label: "60k" },
  { value: 240_000, label: "240k" },
] as const;
export type MroScale = (typeof MRO_SCALES)[number]["value"];

export const LINES = [
  "Hydraulics",
  "Fuel systems",
  "Pneumatics",
  "Electrical power",
  "Landing gear",
  "Avionics",
] as const;
export type MroLine = (typeof LINES)[number];

const LINE_SPEC: { prefix: string; price: number; tat: number; parts: string[] }[] = [
  { prefix: "HY", price: 4_600, tat: 18, parts: ["Hydraulic pump", "Servo valve", "Accumulator", "Flight control actuator", "Priority valve", "Filter manifold"] },
  { prefix: "FS", price: 6_900, tat: 22, parts: ["Fuel control unit", "Boost pump", "Fuel nozzle set", "Shutoff valve", "Flow divider"] },
  { prefix: "PN", price: 8_700, tat: 25, parts: ["Bleed valve", "Pressure regulator", "Air cycle machine", "Check valve", "Precooler"] },
  { prefix: "EP", price: 10_400, tat: 20, parts: ["Starter generator", "Integrated drive generator", "Transformer rectifier", "Battery charger", "Static inverter"] },
  { prefix: "LG", price: 3_400, tat: 12, parts: ["Brake assembly", "Wheel assembly", "Shock strut", "Steering actuator", "Retract actuator"] },
  { prefix: "AV", price: 12_200, tat: 15, parts: ["Air data computer", "Display unit", "VHF transceiver", "Flight control computer", "Weather radar RT"] },
];

const CUSTOMERS = [
  "Northwind Air", "Pacific Regional", "Atlas Cargo", "Meridian Leasing", "Bluefin Airways",
  "Cascade Express", "Harbor Jet", "Sierra Air Group", "Coastal Commuter", "Polar Freight",
  "Summit Aviation", "Redline Charter", "Equator Air", "Granite Leasing", "Silverlake Air",
  "Trident Cargo", "Vantage Regional", "Kestrel Air", "Orion Lease Co", "Mesa Shuttle",
  "Lakeshore Air", "Falcon Technics", "Archway Leasing", "Delta Ridge Air", "Horizon Feeder",
  "Ironwood Cargo", "Seabright Air", "Westgate Aero",
];

export const STATUS = ["Shipped", "Received", "In work", "Awaiting parts", "Quote pending"] as const;
export type MroStatus = (typeof STATUS)[number];
export const SHIPPED = 0;

export type Part = {
  pn: string;
  desc: string;
  line: number;
  price: number;
  tat: number;
  /** PN has invoice history before the simulated window. */
  seeded: boolean;
  /** New PNs: the first day the shop sees one (relative to Jan 1). */
  intro: number;
};

/** Columnar WO store. Index `i` across every array is one work order. */
export type WoColumns = {
  count: number;
  /** WO sequence number (display: `WO-` + no). */
  no: Int32Array;
  part: Int32Array;
  customer: Int16Array;
  /** Day index relative to Jan 1 of the fiscal year (may be negative). */
  opened: Int16Array;
  /** Actual ship day, or -32768 while still open. */
  shipped: Int16Array;
  /** Expected ship day the projection uses for open WOs. */
  expected: Int16Array;
  status: Uint8Array;
  /** Estimate at receipt: running PN average of prior invoices. */
  est: Float32Array;
  /** 1 when the PN had no invoice history and the line average was used. */
  fallback: Uint8Array;
  /** Invoiced amount (0 while open). */
  invoiced: Float32Array;
};

export const OPEN_DAY = -32768;

export type MroDataset = {
  scale: MroScale;
  year: number;
  /** Index of today within the year. */
  today: number;
  daysInYear: number;
  parts: Part[];
  customers: string[];
  wo: WoColumns;
  /** Per-day series over the fiscal year. */
  day: {
    invoiced: Float64Array;
    shippedCount: Float64Array;
    intakeCount: Float64Array;
    intakeEst: Float64Array;
    intakeByLine: Float64Array[];
    projBacklog: Float64Array;
    projReceipts: Float64Array;
    projIntakeEst: Float64Array;
    projIntakeCount: Float64Array;
    /** Original budget, phased by expected volume. Fixed for the year. */
    budget: Float64Array;
    /**
     * What each remaining day must invoice to still land the annual budget:
     * (budget − invoiced to date) re-spread over the remaining days by the
     * same phasing. Zero for past days.
     */
    required: Float64Array;
  };
  /** Weekly actual ÷ estimate over the last 26 weeks — the band's source. */
  ratio: { p10: number; p50: number; p90: number };
  /** Estimate error for WOs shipped in the last 180 days. */
  accuracy: { bins: { label: string; from: number; count: number }[]; within15: number; bias: number; n: number };
  /** Annual budget (Y). */
  plan: number;
  timings: { buildMs: number; projectMs: number };
};

/** mulberry32 — small, fast, seedable. */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gauss(rand: () => number) {
  const u = 1 - rand();
  const v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

const lognormal = (rand: () => number, sigma: number) => Math.exp(gauss(rand) * sigma - (sigma * sigma) / 2);

function buildParts(rand: () => number): { parts: Part[]; cumulative: Float64Array } {
  const parts: Part[] = [];
  const weights: number[] = [];
  let rank = 1;
  LINE_SPEC.forEach((spec, line) => {
    const perLine = 64 + Math.floor(rand() * 24);
    for (let i = 0; i < perLine; i++) {
      const base = spec.parts[i % spec.parts.length];
      parts.push({
        pn: `${spec.prefix}${String(1000 + Math.floor(rand() * 8999))}-${String(1 + Math.floor(rand() * 40)).padStart(2, "0")}`,
        desc: base,
        line,
        price: Math.round(spec.price * lognormal(rand, 0.55)),
        tat: Math.max(5, Math.round(spec.tat * lognormal(rand, 0.22))),
        // ~7% of PNs are new to the shop this year: no invoices to average
        // until their first repairs ship.
        seeded: rand() > 0.07,
        intro: -Infinity,
      });
      weights.push(1 / Math.pow(rank + rand() * 40, 0.85));
      rank++;
    }
  });
  const cumulative = new Float64Array(weights.length);
  let sum = 0;
  weights.forEach((w, i) => {
    sum += w;
    cumulative[i] = sum;
  });
  for (let i = 0; i < cumulative.length; i++) cumulative[i] /= sum;
  return { parts, cumulative };
}

function pickWeighted(cumulative: Float64Array, r: number) {
  let lo = 0;
  let hi = cumulative.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (cumulative[mid] < r) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

/** Weekday intake shape: shops receive mostly Mon–Fri, a trickle at weekends. */
const WEEKDAY = [0.06, 1.18, 1.05, 1.0, 0.98, 0.92, 0.2];
const WEEKDAY_SUM = WEEKDAY.reduce((a, b) => a + b, 0);

const cache = new Map<string, MroDataset>();

export function buildMroDataset(scale: MroScale, now = new Date()): MroDataset {
  const year = now.getFullYear();
  const key = `${scale}:${year}-${now.getMonth()}-${now.getDate()}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const t0 = performance.now();
  const rand = rng(0x5eed ^ scale);
  const fyStart = new Date(year, 0, 1);
  const daysInYear = Math.round((new Date(year + 1, 0, 1).getTime() - fyStart.getTime()) / DAY_MS);
  const today = Math.min(
    daysInYear - 1,
    Math.floor((new Date(year, now.getMonth(), now.getDate()).getTime() - fyStart.getTime()) / DAY_MS),
  );
  const fyStartDow = fyStart.getDay();
  const dow = (d: number) => (((fyStartDow + d) % 7) + 7) % 7;

  const { parts, cumulative } = buildParts(rand);
  for (const p of parts) if (!p.seeded) p.intro = Math.floor(rand() * Math.max(1, today - 20));
  const lineOf = Int32Array.from(parts, (p) => p.line);

  // Invoice history before the window: per-PN running sums seeded from 3–14
  // prior invoices around the true price. New PNs start empty.
  const pnSum = new Float64Array(parts.length);
  const pnCount = new Float64Array(parts.length);
  const lineSum = new Float64Array(LINES.length);
  const lineCount = new Float64Array(LINES.length);
  parts.forEach((p, i) => {
    if (!p.seeded) return;
    const n = 3 + Math.floor(rand() * 12);
    for (let k = 0; k < n; k++) {
      const v = p.price * lognormal(rand, 0.18);
      pnSum[i] += v;
      pnCount[i] += 1;
      lineSum[p.line] += v;
      lineCount[p.line] += 1;
    }
  });

  const SIM_START = -200;
  const horizon = daysInYear + 220;
  // Invoices land on their ship day; bucket them so running averages only
  // ever see invoices dated before a WO's receipt.
  const dueParts: number[][] = Array.from({ length: horizon - SIM_START }, () => []);
  const dueAmount: number[][] = Array.from({ length: horizon - SIM_START }, () => []);

  const perWorkday = scale / 365 / (WEEKDAY_SUM / 7);
  const cap = Math.ceil(scale * 1.45);
  const no = new Int32Array(cap);
  const part = new Int32Array(cap);
  const customer = new Int16Array(cap);
  const opened = new Int16Array(cap);
  const shipped = new Int16Array(cap);
  const expected = new Int16Array(cap);
  const status = new Uint8Array(cap);
  const est = new Float32Array(cap);
  const fallback = new Uint8Array(cap);
  const invoiced = new Float32Array(cap);
  let n = 0;
  let seq = 418_200;

  const invoicedDay = new Float64Array(daysInYear);
  const shippedCount = new Float64Array(daysInYear);
  const intakeCount = new Float64Array(daysInYear);
  const intakeEst = new Float64Array(daysInYear);
  const intakeByLine = LINES.map(() => new Float64Array(daysInYear));

  for (let d = SIM_START; d <= today; d++) {
    // 1. Today's invoices update the running averages first.
    const slot = d - SIM_START;
    const dp = dueParts[slot];
    const da = dueAmount[slot];
    for (let k = 0; k < dp.length; k++) {
      const p = dp[k];
      pnSum[p] += da[k];
      pnCount[p] += 1;
      lineSum[lineOf[p]] += da[k];
      lineCount[lineOf[p]] += 1;
    }
    dueParts[slot] = [];
    dueAmount[slot] = [];

    // 2. Receive today's WOs. Volume grows ~9% across the year with a
    //    spring and autumn peak, plus day-to-day noise.
    const season = 1 + 0.09 * (d / 365) + 0.07 * Math.sin(((d - 40) / 365) * 2 * Math.PI * 2);
    const mean = perWorkday * WEEKDAY[dow(d)] * season * (0.88 + rand() * 0.24);
    const arrivals = Math.max(0, Math.round(mean + gauss(rand) * Math.sqrt(Math.max(mean, 1)) * 0.6));

    for (let a = 0; a < arrivals; a++) {
      let p = pickWeighted(cumulative, rand());
      // A PN new this year can't arrive before its first day in the shop.
      if (d < parts[p].intro) p = pickWeighted(cumulative, rand());
      if (d < parts[p].intro) continue;
      const info = parts[p];
      const hasHistory = pnCount[p] > 0;
      const estimate = hasHistory
        ? pnSum[p] / pnCount[p]
        : lineCount[info.line] > 0
          ? lineSum[info.line] / lineCount[info.line]
          : LINE_SPEC[info.line].price;

      // Truth the estimate can't see: scope, holds, beyond-economical-repair.
      const ber = rand() < 0.04;
      const holdParts = !ber && rand() < 0.22 ? 6 + Math.floor(rand() * 26) : 0;
      const holdQuote = !ber && rand() < 0.14 ? 2 + Math.floor(rand() * 11) : 0;
      const work = Math.max(2, Math.round(info.tat * lognormal(rand, 0.28) * (ber ? 0.4 : 1)));
      const shipDay = d + work + holdParts + holdQuote;
      // Repair prices escalate ~4% a year, so estimates built from older
      // invoices trail what ships now.
      const escalation = 1 + 0.04 * (shipDay / 365);
      const amount = (ber ? info.price * 0.12 : info.price * lognormal(rand, 0.17)) * escalation;

      if (shipDay <= today) {
        const ds = shipDay - SIM_START;
        dueParts[ds].push(p);
        dueAmount[ds].push(amount);
        if (shipDay >= 0) {
          invoicedDay[shipDay] += amount;
          shippedCount[shipDay] += 1;
        }
      }
      if (d >= 0) {
        intakeCount[d] += 1;
        intakeEst[d] += estimate;
        intakeByLine[info.line][d] += 1;
      }

      // Keep FY receipts plus anything still open (the backlog).
      if (d < 0 && shipDay <= today) continue;
      if (n >= cap) continue;
      no[n] = seq++;
      part[n] = p;
      customer[n] = Math.floor(rand() * CUSTOMERS.length);
      opened[n] = d;
      est[n] = estimate;
      fallback[n] = hasHistory ? 0 : 1;
      if (shipDay <= today) {
        shipped[n] = shipDay;
        expected[n] = shipDay;
        status[n] = SHIPPED;
        invoiced[n] = amount;
      } else {
        shipped[n] = OPEN_DAY;
        const age = today - d;
        const quoteEnd = holdQuote ? 1 + holdQuote : 0;
        const partsStart = quoteEnd + Math.floor(work * 0.35);
        status[n] =
          age < 1 ? 1 : holdQuote && age <= quoteEnd ? 4 : holdParts && age >= partsStart && age < partsStart + holdParts ? 3 : 2;
        // The projection's view: PN turnaround plus what the status implies.
        const known = info.tat + (status[n] === 3 ? 10 : 0) + (status[n] === 4 ? 6 : 0);
        expected[n] = Math.max(today + 1 + Math.floor(rand() * 4), d + known);
        invoiced[n] = 0;
      }
      n++;
    }
  }
  const buildMs = performance.now() - t0;

  const wo: WoColumns = {
    count: n,
    no: no.subarray(0, n),
    part: part.subarray(0, n),
    customer: customer.subarray(0, n),
    opened: opened.subarray(0, n),
    shipped: shipped.subarray(0, n),
    expected: expected.subarray(0, n),
    status: status.subarray(0, n),
    est: est.subarray(0, n),
    fallback: fallback.subarray(0, n),
    invoiced: invoiced.subarray(0, n),
  };

  const t1 = performance.now();
  const projected = project({ wo, parts, today, daysInYear, intakeCount, intakeEst, dow });
  const accuracy = estimateAccuracy(wo, today);
  // Plan: the first 120 days' invoicing run-rate, annualised, plus an 8.5% growth target.
  let early = 0;
  for (let d = 0; d < Math.min(120, today); d++) early += invoicedDay[d];
  const plan = Math.round((early / Math.max(1, Math.min(120, today))) * daysInYear * 1.085);

  // Budget phasing: the year's expected volume shape (weekday mix × season),
  // the same pattern a finance team would take from last year's receipts.
  const weight = new Float64Array(daysInYear);
  let weightSum = 0;
  for (let d = 0; d < daysInYear; d++) {
    const season = 1 + 0.09 * (d / 365) + 0.07 * Math.sin(((d - 40) / 365) * 2 * Math.PI * 2);
    weight[d] = WEEKDAY[dow(d)] * season;
    weightSum += weight[d];
  }
  const budget = new Float64Array(daysInYear);
  for (let d = 0; d < daysInYear; d++) budget[d] = (plan * weight[d]) / weightSum;

  // Needed to hit budget: the gap re-spread over the remaining days, by the
  // same phasing — X_m = (Y − Σ actual) × w_m ÷ Σ remaining w.
  let invoicedToDate = 0;
  for (let d = 0; d <= today; d++) invoicedToDate += invoicedDay[d];
  let remainingWeight = 0;
  for (let d = today + 1; d < daysInYear; d++) remainingWeight += weight[d];
  const required = new Float64Array(daysInYear);
  const gap = Math.max(0, plan - invoicedToDate);
  if (remainingWeight > 0) for (let d = today + 1; d < daysInYear; d++) required[d] = (gap * weight[d]) / remainingWeight;
  const projectMs = performance.now() - t1;

  const dataset: MroDataset = {
    scale,
    year,
    today,
    daysInYear,
    parts,
    customers: CUSTOMERS,
    wo,
    day: {
      invoiced: invoicedDay,
      shippedCount,
      intakeCount,
      intakeEst,
      intakeByLine,
      ...projected.day,
      budget,
      required,
    },
    ratio: projected.ratio,
    accuracy,
    plan,
    timings: { buildMs, projectMs },
  };
  cache.set(key, dataset);
  return dataset;
}

function quantile(sorted: number[], q: number) {
  if (!sorted.length) return 1;
  const i = Math.min(sorted.length - 1, Math.max(0, Math.round(q * (sorted.length - 1))));
  return sorted[i];
}

function project({
  wo,
  parts,
  today,
  daysInYear,
  intakeCount,
  intakeEst,
  dow,
}: {
  wo: WoColumns;
  parts: Part[];
  today: number;
  daysInYear: number;
  intakeCount: Float64Array;
  intakeEst: Float64Array;
  dow: (d: number) => number;
}) {
  const projBacklog = new Float64Array(daysInYear);
  const projReceipts = new Float64Array(daysInYear);
  const projIntakeEst = new Float64Array(daysInYear);
  const projIntakeCount = new Float64Array(daysInYear);

  // Open WOs ship on their expected day at their receipt estimate.
  let tatSum = 0;
  let tatN = 0;
  for (let i = 0; i < wo.count; i++) {
    if (wo.shipped[i] === OPEN_DAY) {
      const day = wo.expected[i];
      if (day < daysInYear) projBacklog[day] += wo.est[i];
    } else if (wo.opened[i] >= today - 120) {
      tatSum += wo.shipped[i] - wo.opened[i];
      tatN++;
    }
  }
  const tat = Math.round(tatN ? tatSum / tatN : parts.reduce((s, p) => s + p.tat, 0) / parts.length);

  // WOs not yet received: trailing 8-week intake by weekday, valued at the
  // trailing average estimate, shipping one average turnaround later.
  const byDow = new Float64Array(7);
  const byDowN = new Float64Array(7);
  let estSum = 0;
  let estN = 0;
  for (let d = Math.max(0, today - 56); d < today; d++) {
    byDow[dow(d)] += intakeCount[d];
    byDowN[dow(d)] += 1;
    estSum += intakeEst[d];
    estN += intakeCount[d];
  }
  const avgEst = estN ? estSum / estN : 0;
  for (let d = today + 1; d < daysInYear; d++) {
    const k = dow(d);
    const count = byDowN[k] ? byDow[k] / byDowN[k] : 0;
    projIntakeCount[d] = count;
    projIntakeEst[d] = count * avgEst;
    const ship = d + tat;
    if (ship < daysInYear) projReceipts[ship] += count * avgEst;
  }

  // Band source: weekly invoiced ÷ estimate over the last 26 weeks.
  const weekAct = new Float64Array(27);
  const weekEst = new Float64Array(27);
  for (let i = 0; i < wo.count; i++) {
    const s = wo.shipped[i];
    if (s === OPEN_DAY || s < today - 182) continue;
    const w = Math.floor((today - s) / 7);
    weekAct[w] += wo.invoiced[i];
    weekEst[w] += wo.est[i];
  }
  const ratios: number[] = [];
  for (let w = 0; w < 26; w++) if (weekEst[w] > 0) ratios.push(weekAct[w] / weekEst[w]);
  ratios.sort((a, b) => a - b);

  // Calibrate the outlook: estimates have been landing at p50 × estimate, so
  // projected revenue is too. The band is p10 / p90 relative to that.
  const p50 = quantile(ratios, 0.5);
  for (let d = 0; d < daysInYear; d++) {
    projBacklog[d] *= p50;
    projReceipts[d] *= p50;
  }
  return {
    day: { projBacklog, projReceipts, projIntakeEst, projIntakeCount },
    ratio: { p10: quantile(ratios, 0.1), p50, p90: quantile(ratios, 0.9) },
  };
}

function estimateAccuracy(wo: WoColumns, today: number) {
  const edges = [-40, -30, -20, -10, 0, 10, 20, 30, 40];
  const counts = new Array(edges.length + 1).fill(0);
  let within = 0;
  let n = 0;
  let biasSum = 0;
  for (let i = 0; i < wo.count; i++) {
    const s = wo.shipped[i];
    if (s === OPEN_DAY || s < today - 180 || wo.est[i] <= 0) continue;
    const err = ((wo.invoiced[i] - wo.est[i]) / wo.est[i]) * 100;
    let b = 0;
    while (b < edges.length && err >= edges[b]) b++;
    counts[b]++;
    if (Math.abs(err) <= 15) within++;
    biasSum += err;
    n++;
  }
  // Short tick labels: ten bins share one small chart.
  const label = (b: number) => (b === 0 ? "<−40" : b === edges.length ? "≥40" : fmtPct(edges[b - 1]).replace("%", ""));
  return {
    bins: counts.map((count, b) => ({ label: label(b), from: b === 0 ? -Infinity : edges[b - 1], count })),
    within15: n ? within / n : 0,
    bias: n ? biasSum / n : 0,
    n,
  };
}

function fmtPct(v: number) {
  return v > 0 ? `+${v}%` : v < 0 ? `−${Math.abs(v)}%` : "0%";
}

// ── Periods ────────────────────────────────────────────────────────────────

export type Grain = "week" | "month" | "quarter";

export type PeriodRow = {
  key: string;
  label: string;
  start: number;
  end: number;
  invoiced: number | null;
  projected: number | null;
  low: number | null;
  high: number | null;
  intake: number | null;
  intakeProjected: number | null;
  /** Original phased budget for the period. */
  budget: number;
  /** Actual so far plus what the rest of the period must invoice to land the annual budget. */
  required: number | null;
  wos: number;
  current: boolean;
};

const MONTH = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function periodBounds(ds: MroDataset, grain: Grain): { key: string; label: string; start: number; end: number }[] {
  const out: { key: string; label: string; start: number; end: number }[] = [];
  const dayOf = (m: number) => Math.round((new Date(ds.year, m, 1).getTime() - new Date(ds.year, 0, 1).getTime()) / DAY_MS);
  if (grain === "week") {
    for (let s = 0, w = 1; s < ds.daysInYear; s += 7, w++) {
      const date = new Date(ds.year, 0, 1 + s);
      out.push({ key: `w${w}`, label: `${MONTH[date.getMonth()]} ${date.getDate()}`, start: s, end: Math.min(ds.daysInYear, s + 7) });
    }
  } else if (grain === "month") {
    for (let m = 0; m < 12; m++) out.push({ key: MONTH[m], label: MONTH[m], start: dayOf(m), end: m === 11 ? ds.daysInYear : dayOf(m + 1) });
  } else {
    for (let q = 0; q < 4; q++)
      out.push({ key: `Q${q + 1}`, label: `Q${q + 1}`, start: dayOf(q * 3), end: q === 3 ? ds.daysInYear : dayOf(q * 3 + 3) });
  }
  return out;
}

const sumRange = (a: Float64Array, from: number, to: number) => {
  let s = 0;
  for (let d = Math.max(0, from); d < Math.min(a.length, to); d++) s += a[d];
  return s;
};

export function rollup(ds: MroDataset, grain: Grain): PeriodRow[] {
  const rows = rollupRaw(ds, grain);
  // Intake: the solid line stops at the last whole period; the dashed line
  // starts there, so the two meet instead of leaving a gap.
  const c = rows.findIndex((r) => r.current);
  if (c >= 0) {
    rows[c].intake = null;
    if (c > 0) rows[c - 1].intakeProjected = rows[c - 1].intake;
  }
  return rows;
}

export type CumulativeRow = {
  key: string;
  label: string;
  /** Invoiced to date, cumulative; ends at the last whole period. */
  actual: number | null;
  /** Actual to date plus the outlook, cumulative; starts where actual ends. */
  forecast: number | null;
  low: number | null;
  high: number | null;
  budget: number;
  current: boolean;
};

/** Year-to-date view: cumulative actual and outlook against cumulative budget. */
export function cumulativeRollup(ds: MroDataset, grain: Grain): CumulativeRow[] {
  const d = ds.day;
  const b = band(ds);
  let act = 0;
  let bud = 0;
  let back = 0;
  let rec = 0;
  const rows = periodBounds(ds, grain).map(({ key, label, start, end }) => {
    act += sumRange(d.invoiced, start, Math.min(end, ds.today + 1));
    bud += sumRange(d.budget, start, end);
    back += sumRange(d.projBacklog, Math.max(start, ds.today + 1), end);
    rec += sumRange(d.projReceipts, Math.max(start, ds.today + 1), end);
    const future = end > ds.today + 1;
    return {
      key,
      label,
      actual: future ? null : act,
      forecast: future ? act + back + rec : null,
      low: future ? act + back * b.backLo + rec * b.recLo : null,
      high: future ? act + back * b.backHi + rec * b.recHi : null,
      budget: bud,
      current: start <= ds.today && ds.today < end,
    };
  });
  // Join: the forecast line (and band) starts at the last whole period's actual.
  const firstForecast = rows.findIndex((r) => r.forecast != null);
  if (firstForecast > 0) {
    const join = rows[firstForecast - 1];
    join.forecast = join.actual;
    join.low = join.actual;
    join.high = join.actual;
  }
  return rows;
}

function rollupRaw(ds: MroDataset, grain: Grain): PeriodRow[] {
  const b = band(ds);
  const d = ds.day;
  return periodBounds(ds, grain).map(({ key, label, start, end }) => {
    const past = end <= ds.today + 1;
    const future = start > ds.today;
    const inv = sumRange(d.invoiced, start, Math.min(end, ds.today + 1));
    const backlog = sumRange(d.projBacklog, Math.max(start, ds.today + 1), end);
    const receipts = sumRange(d.projReceipts, Math.max(start, ds.today + 1), end);
    const proj = backlog + receipts;
    const intake = sumRange(d.intakeEst, start, Math.min(end, ds.today + 1));
    const intakeProj = sumRange(d.projIntakeEst, Math.max(start, ds.today + 1), end);
    const wos = sumRange(d.intakeCount, start, Math.min(end, ds.today + 1)) + sumRange(d.projIntakeCount, Math.max(start, ds.today + 1), end);
    return {
      key,
      label,
      start,
      end,
      invoiced: future ? null : inv,
      projected: past ? null : proj,
      // Band: backlog by the 26-week actual÷estimate spread around its median; receipts ±20%.
      low: past ? null : inv + backlog * b.backLo + receipts * b.recLo,
      high: past ? null : inv + backlog * b.backHi + receipts * b.recHi,
      intake: future ? null : intake,
      intakeProjected: past ? null : intakeProj + (future ? 0 : intake),
      budget: sumRange(d.budget, start, end),
      required: past ? null : inv + sumRange(d.required, Math.max(start, ds.today + 1), end),
      wos: Math.round(wos),
      current: start <= ds.today && ds.today < end,
    };
  });
}

/** Totals for a day window, split the way the bridge reads. */
export function windowOutlook(ds: MroDataset, start: number, end: number) {
  const d = ds.day;
  const invoiced = sumRange(d.invoiced, start, Math.min(end, ds.today + 1));
  const backlog = sumRange(d.projBacklog, Math.max(start, ds.today + 1), end);
  const receipts = sumRange(d.projReceipts, Math.max(start, ds.today + 1), end);
  return {
    invoiced,
    backlog,
    receipts,
    projected: invoiced + backlog + receipts,
    low: invoiced + backlog * band(ds).backLo + receipts * band(ds).recLo,
    high: invoiced + backlog * band(ds).backHi + receipts * band(ds).recHi,
  };
}

export function backlogSummary(ds: MroDataset) {
  let open = 0;
  let value = 0;
  let fallback = 0;
  let overdue = 0;
  for (let i = 0; i < ds.wo.count; i++) {
    if (ds.wo.shipped[i] !== OPEN_DAY) continue;
    open++;
    value += ds.wo.est[i];
    fallback += ds.wo.fallback[i];
    const p = ds.parts[ds.wo.part[i]];
    if (ds.today - ds.wo.opened[i] > p.tat + 10) overdue++;
  }
  return { open, value, fallback, overdue };
}

export function dayToDate(ds: MroDataset, d: number) {
  return new Date(ds.year, 0, 1 + d);
}

/** What the rest of the year needs, against what the outlook says it will do. */
export function budgetPace(ds: MroDataset) {
  const d = ds.day;
  const invoiced = sumRange(d.invoiced, 0, ds.today + 1);
  const outlookRest = sumRange(d.projBacklog, ds.today + 1, ds.daysInYear) + sumRange(d.projReceipts, ds.today + 1, ds.daysInYear);
  const gap = Math.max(0, ds.plan - invoiced);
  const monthsLeft = Math.max(1 / 30, (ds.daysInYear - ds.today - 1) / (ds.daysInYear / 12));
  return {
    budget: ds.plan,
    invoiced,
    gap,
    neededPerMonth: gap / monthsLeft,
    outlookPerMonth: outlookRest / monthsLeft,
    monthsLeft,
  };
}

/** Band multipliers on the calibrated outlook: backlog p10/p50…p90/p50, receipts ±20%. */
function band(ds: MroDataset) {
  const { p10, p50, p90 } = ds.ratio;
  return { backLo: p10 / p50, backHi: p90 / p50, recLo: 0.8, recHi: 1.2 };
}
