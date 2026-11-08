/**
 * October household cash — one flat ledger for the Chen joint account.
 *
 * The pivot and the year chart both read these rows. October is the month
 * that slipped: a design invoice is short, car cover is late, and a few
 * bills came in under plan. Other months run on plan, with three exceptions
 * a real year would have (April invoice, August dinners, December gifts).
 */

export const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

export type CashMonth = (typeof MONTHS)[number];

export const BUCKETS = ["Income", "Bills", "Expenses", "Savings", "Debt"] as const;
export type CashBucket = (typeof BUCKETS)[number];

/** Cash in the joint account on 1 January, before any of this year's lines. */
export const OPENING_CASH = 15_504;

export type CashLine = {
  month: CashMonth;
  bucket: CashBucket;
  item: string;
  who: "Sarah" | "Lucas" | "Joint";
  frequency: "Weekly" | "Biweekly" | "Monthly" | "Quarterly" | "Yearly";
  /** Day of month, when the line has a due date. */
  dueDay: number | null;
  /** Size of one occurrence (a paycheck, a quarterly bill, a yearly premium). */
  occurrence: number;
  plan: number;
  actual: number;
  /** Effect on cash versus plan. Income shortfall is negative; spending less is positive. */
  cashDelta: number;
  status: "paid" | "partial" | "open" | "late";
};

type Template = Omit<CashLine, "month" | "actual" | "cashDelta" | "status">;

const TEMPLATES: readonly Template[] = [
  { bucket: "Income", item: "Sarah salary", who: "Sarah", frequency: "Biweekly", dueDay: null, occurrence: 2420, plan: 4840 },
  { bucket: "Income", item: "Lucas salary", who: "Lucas", frequency: "Monthly", dueDay: 15, occurrence: 3900, plan: 3900 },
  { bucket: "Income", item: "Design projects", who: "Lucas", frequency: "Monthly", dueDay: null, occurrence: 650, plan: 1200 },
  { bucket: "Income", item: "Child benefit", who: "Joint", frequency: "Monthly", dueDay: 20, occurrence: 240, plan: 240 },
  { bucket: "Bills", item: "Mortgage", who: "Joint", frequency: "Monthly", dueDay: 1, occurrence: 2180, plan: 2180 },
  { bucket: "Bills", item: "Energy", who: "Joint", frequency: "Monthly", dueDay: 18, occurrence: 165, plan: 165 },
  { bucket: "Bills", item: "Water", who: "Joint", frequency: "Quarterly", dueDay: null, occurrence: 165, plan: 55 },
  { bucket: "Bills", item: "Phones and web", who: "Joint", frequency: "Monthly", dueDay: 12, occurrence: 165, plan: 165 },
  { bucket: "Bills", item: "Home cover", who: "Joint", frequency: "Yearly", dueDay: null, occurrence: 1140, plan: 95 },
  { bucket: "Bills", item: "Car cover", who: "Lucas", frequency: "Monthly", dueDay: 22, occurrence: 128, plan: 128 },
  { bucket: "Bills", item: "Daycare", who: "Joint", frequency: "Monthly", dueDay: 5, occurrence: 1320, plan: 1320 },
  { bucket: "Expenses", item: "Groceries", who: "Joint", frequency: "Weekly", dueDay: null, occurrence: 180, plan: 900 },
  { bucket: "Expenses", item: "Transit", who: "Joint", frequency: "Monthly", dueDay: null, occurrence: 180, plan: 220 },
  { bucket: "Expenses", item: "Eating out", who: "Joint", frequency: "Monthly", dueDay: null, occurrence: 120, plan: 480 },
  { bucket: "Expenses", item: "Household", who: "Joint", frequency: "Monthly", dueDay: null, occurrence: 80, plan: 400 },
  { bucket: "Savings", item: "Emergency fund", who: "Joint", frequency: "Monthly", dueDay: 1, occurrence: 600, plan: 600 },
  { bucket: "Savings", item: "Vacation", who: "Joint", frequency: "Monthly", dueDay: null, occurrence: 400, plan: 400 },
  { bucket: "Debt", item: "Student loan", who: "Sarah", frequency: "Monthly", dueDay: 8, occurrence: 420, plan: 420 },
  { bucket: "Debt", item: "Car loan", who: "Lucas", frequency: "Monthly", dueDay: 8, occurrence: 310, plan: 310 },
];

function cashDelta(bucket: CashBucket, plan: number, actual: number): number {
  return bucket === "Income" ? actual - plan : plan - actual;
}

function line(month: CashMonth, template: Template, actual: number, status: CashLine["status"]): CashLine {
  return {
    ...template,
    month,
    actual,
    status,
    cashDelta: cashDelta(template.bucket, template.plan, actual),
  };
}

/** Months that are not October: on plan, plus three dated exceptions. */
function actualFor(month: CashMonth, template: Template): { actual: number; status: CashLine["status"] } {
  if (month === "Apr" && template.item === "Design projects") return { actual: 3000, status: "paid" };
  if (month === "Aug" && template.item === "Eating out") return { actual: 880, status: "paid" };
  if (month === "Dec" && template.item === "Household") return { actual: 1000, status: "paid" };
  return { actual: template.plan, status: "paid" };
}

const OCTOBER: Record<string, { actual: number; status: CashLine["status"] }> = {
  "Design projects": { actual: 450, status: "partial" },
  Energy: { actual: 142, status: "paid" },
  "Home cover": { actual: 0, status: "open" },
  "Car cover": { actual: 0, status: "late" },
  Groceries: { actual: 740, status: "paid" },
  Transit: { actual: 180, status: "paid" },
  "Eating out": { actual: 610, status: "paid" },
  Household: { actual: 280, status: "paid" },
  Vacation: { actual: 200, status: "open" },
};

function buildLedger(): CashLine[] {
  const rows: CashLine[] = [];
  for (const month of MONTHS) {
    for (const template of TEMPLATES) {
      const posted =
        month === "Oct"
          ? (OCTOBER[template.item] ?? { actual: template.plan, status: "paid" as const })
          : actualFor(month, template);
      rows.push(line(month, template, posted.actual, posted.status));
    }
  }
  return rows;
}

export const HOUSEHOLD_LEDGER: readonly CashLine[] = buildLedger();

export function monthLines(month: CashMonth): CashLine[] {
  return HOUSEHOLD_LEDGER.filter((row) => row.month === month);
}

/** Activity left over: income received minus everything that left the account. */
export function activityLeftover(rows: readonly CashLine[]): number {
  let income = 0;
  let out = 0;
  for (const row of rows) {
    if (row.bucket === "Income") income += row.actual;
    else out += row.actual;
  }
  return income - out;
}

/** Balance on the first of `month`: January opening plus every earlier month's leftover. */
export function carriedIn(month: CashMonth): number {
  let cash = OPENING_CASH;
  for (const name of MONTHS) {
    if (name === month) return cash;
    cash += activityLeftover(monthLines(name));
  }
  return cash;
}
