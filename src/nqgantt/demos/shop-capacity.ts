/**
 * Shop capacity — what a planner configures, and how it maps onto the four
 * capacity inputs nqgantt's resource rows read:
 *
 * | Planner says                         | nqgantt input                         |
 * |--------------------------------------|---------------------------------------|
 * | Shop works Mon–Fri, 8h               | `calendar` (workingDays, hoursPerDay) |
 * | Shop closed for a holiday            | `calendar.holidays`                   |
 * | Lee works part time; stands 2 shifts | `workloadSchemes` + binding           |
 * | Ari is on leave / NDT-1 down         | `resourceCalendars[].absences`        |
 * | Overtime, a weekend shift, any day   | `resolveCapacityHours(id, day)`       |
 *
 * Every date is a local `YYYY-MM-DD` string, and presets are built relative
 * to today so the board always shows them in flight.
 */
import { MACHINES, TECHS } from "./production-orders"
import type {
  NextCapacityResolver,
  NextResourceCalendar,
  NextWorkloadScheme,
} from "./nqgantt-next"

// ── Model ──────────────────────────────────────────────────────────────────

export type PatternId = "standard" | "part-6" | "two-shift" | "three-shift"
export type RuleDays = "all" | "weekdays" | "weekends"

/** A dated rule for one resource or a crew: set hours, or exclude (no capacity). */
export type CapacityRule = {
  id: string
  target: string
  from: string
  to: string
  kind: "hours" | "exclude"
  hours: number
  days: RuleDays
  label: string
}

export type Closure = { id: string; from: string; to: string; label: string }

export type CapacityConfig = {
  hoursPerDay: number
  /** ISO weekdays, 1 = Monday … 7 = Sunday. */
  workingDays: number[]
  closures: Closure[]
  /** Resource id → weekly pattern. Missing = the shop calendar. */
  patterns: Record<string, PatternId>
  rules: CapacityRule[]
}

/** What `GanttRoot` takes, plus a one-line summary for the board. */
export type GanttCapacity = {
  calendar: { workingDays: number[]; holidays: Date[]; hoursPerDay: number }
  workloadSchemes: NextWorkloadScheme[]
  resourceCalendars: NextResourceCalendar[]
  resolveCapacityHours: NextCapacityResolver
  summary: string
}

// ── Resources and crews ────────────────────────────────────────────────────

export type CapacityResource = { id: string; name: string; kind: "tech" | "machine"; detail: string }

export const CAPACITY_RESOURCES: CapacityResource[] = [
  ...TECHS.map((t) => ({ id: t.id, name: t.name, kind: "tech" as const, detail: t.role })),
  ...MACHINES.map((m) => ({ id: `m:${m.id}`, name: m.id, kind: "machine" as const, detail: m.name })),
]

/** Crew targets a rule can name instead of one resource. */
export const CAPACITY_CREWS: { id: string; label: string; members: string[] }[] = [
  { id: "crew:all", label: "Whole shop", members: CAPACITY_RESOURCES.map((r) => r.id) },
  { id: "crew:technicians", label: "All technicians", members: TECHS.map((t) => t.id) },
  { id: "crew:mechanics", label: "Mechanics", members: TECHS.filter((t) => t.role === "Mechanic").map((t) => t.id) },
  { id: "crew:inspection", label: "Inspection", members: TECHS.filter((t) => t.skills.includes("insp")).map((t) => t.id) },
  { id: "crew:machines", label: "All machines", members: MACHINES.map((m) => `m:${m.id}`) },
  { id: "crew:test-stands", label: "Test stands", members: MACHINES.filter((m) => m.step === "test").map((m) => `m:${m.id}`) },
]

const crewById = new Map(CAPACITY_CREWS.map((c) => [c.id, new Set(c.members)]))
const resourceById = new Map(CAPACITY_RESOURCES.map((r) => [r.id, r]))

export function targetLabel(target: string): string {
  return CAPACITY_CREWS.find((c) => c.id === target)?.label ?? resourceById.get(target)?.name ?? target
}

function targets(target: string, resourceId: string): boolean {
  return target === resourceId || (crewById.get(target)?.has(resourceId) ?? false)
}

// ── Weekly patterns ────────────────────────────────────────────────────────

const weekdays = (h: number) => ({ 1: h, 2: h, 3: h, 4: h, 5: h })

export const PATTERNS: { id: PatternId; label: string; detail: string; scheme?: NextWorkloadScheme }[] = [
  { id: "standard", label: "Shop calendar", detail: "The shop's days and hours" },
  { id: "part-6", label: "Part time · 6h", detail: "6h weekdays", scheme: { id: "part-6", title: "Part time, 6h", hoursByWeekday: weekdays(6) } },
  { id: "two-shift", label: "Two shifts · 16h", detail: "16h weekdays", scheme: { id: "two-shift", title: "Two shifts", hoursByWeekday: weekdays(16) } },
  { id: "three-shift", label: "Three shifts · 24h", detail: "Around the clock, weekdays", scheme: { id: "three-shift", title: "Three shifts", hoursByWeekday: weekdays(24) } },
]

// ── Dates ──────────────────────────────────────────────────────────────────

export function isoDay(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

function parseIso(iso: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : null
}

function addDays(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
}

/** Next weekday on or after `d`. */
function weekdayFrom(d: Date): Date {
  let out = d
  while (out.getDay() === 0 || out.getDay() === 6) out = addDays(out, 1)
  return out
}

/** Monday of the week `weeks` after the current one. */
function mondayIn(today: Date, weeks: number): Date {
  const day = today.getDay() || 7
  return addDays(today, 1 - day + weeks * 7)
}

function eachIso(from: string, to: string): string[] {
  const a = parseIso(from)
  const b = parseIso(to)
  if (!a || !b || b < a) return []
  const out: string[] = []
  for (let d = a; d <= b; d = addDays(d, 1)) out.push(isoDay(d))
  return out
}

function dayMatches(days: RuleDays, day: Date): boolean {
  const weekend = day.getDay() === 0 || day.getDay() === 6
  return days === "all" || (days === "weekends" ? weekend : !weekend)
}

// ── Mapping to GanttRoot ───────────────────────────────────────────────────

/**
 * - Closures become calendar holidays (zero for everyone, patterns included).
 * - Patterns become schemes bound through `resourceCalendars[].schemeId`.
 * - Exclusions covering every day become dated absences.
 * - Set-hours rules, and exclusions limited to weekdays or weekends, go
 *   through `resolveCapacityHours`; the last matching rule wins.
 */
export function toGanttCapacity(config: CapacityConfig): GanttCapacity {
  const holidays = config.closures.flatMap((c) => eachIso(c.from, c.to)).map((iso) => parseIso(iso)!)

  const usedPatterns = new Set<PatternId>(Object.values(config.patterns).filter((p) => p !== "standard"))
  const workloadSchemes = PATTERNS.filter((p) => p.scheme && usedPatterns.has(p.id)).map((p) => p.scheme!)

  const resourceCalendars: NextResourceCalendar[] = []
  for (const r of CAPACITY_RESOURCES) {
    const pattern = config.patterns[r.id]
    const absences = config.rules
      .filter((rule) => rule.kind === "exclude" && rule.days === "all" && targets(rule.target, r.id))
      .map((rule) => ({ from: rule.from, to: rule.to, label: rule.label }))
    if ((pattern && pattern !== "standard") || absences.length) {
      resourceCalendars.push({
        assigneeId: r.id,
        schemeId: pattern && pattern !== "standard" ? pattern : undefined,
        absences,
      })
    }
  }

  const dayRules = config.rules.filter((rule) => !(rule.kind === "exclude" && rule.days === "all"))
  const resolveCapacityHours: NextCapacityResolver = (resourceId, day) => {
    if (dayRules.length === 0) return undefined
    const iso = isoDay(day)
    let hours: number | undefined
    for (const rule of dayRules) {
      if (iso < rule.from || iso > rule.to) continue
      if (!targets(rule.target, resourceId) || !dayMatches(rule.days, day)) continue
      hours = rule.kind === "exclude" ? 0 : rule.hours
    }
    return hours
  }

  const patterned = Object.values(config.patterns).filter((p) => p !== "standard").length
  const parts = [
    `${config.hoursPerDay}h × ${config.workingDays.length} days`,
    config.closures.length ? `${config.closures.length} closure${config.closures.length > 1 ? "s" : ""}` : null,
    patterned ? `${patterned} on a pattern` : null,
    config.rules.length ? `${config.rules.length} dated rule${config.rules.length > 1 ? "s" : ""}` : null,
  ].filter(Boolean)

  return {
    calendar: { workingDays: [...config.workingDays].sort(), holidays, hoursPerDay: config.hoursPerDay },
    workloadSchemes,
    resourceCalendars,
    resolveCapacityHours,
    summary: parts.join(" · "),
  }
}

// ── Presets ────────────────────────────────────────────────────────────────

export type PresetId = "standard" | "current" | "holiday" | "overtime" | "shutdown"

export const PRESETS: { id: PresetId; label: string; detail: string }[] = [
  { id: "current", label: "This week's plan", detail: "Test stands and wash lines on two shifts, Lee part time, Ari on leave, NDT-1 in maintenance, Mo on overtime." },
  { id: "standard", label: "Standard week", detail: "Everyone on the shop calendar: 8h, Monday to Friday. The baseline to compare against." },
  { id: "holiday", label: "Holiday closure", detail: "This week's plan, with the shop closed Thursday and Friday the week after next." },
  { id: "overtime", label: "Overtime push", detail: "Mechanics on 10h weekdays and a 6h weekend shift for three weeks, to clear the backlog." },
  { id: "shutdown", label: "Machine shutdown", detail: "All test stands down for three days next week for calibration; work still booked shows ∞." },
]

let ruleSeq = 0
export function newRuleId(prefix = "rule"): string {
  ruleSeq += 1
  return `${prefix}-${Date.now().toString(36)}-${ruleSeq}`
}

export function presetConfig(id: PresetId, today = new Date()): CapacityConfig {
  const origin = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const standard: CapacityConfig = { hoursPerDay: 8, workingDays: [1, 2, 3, 4, 5], closures: [], patterns: {}, rules: [] }
  if (id === "standard") return standard

  const leaveFrom = weekdayFrom(addDays(origin, 1))
  const downFrom = weekdayFrom(addDays(origin, 8))
  const current: CapacityConfig = {
    ...standard,
    patterns: {
      "m:WSH-1": "two-shift",
      "m:WSH-2": "two-shift",
      "m:HTS-1": "two-shift",
      "m:HTS-2": "two-shift",
      "t-lp": "part-6",
    },
    rules: [
      { id: "r-ak-leave", target: "t-ak", from: isoDay(leaveFrom), to: isoDay(addDays(leaveFrom, 2)), kind: "exclude", hours: 0, days: "all", label: "Leave" },
      { id: "r-ndt-maint", target: "m:NDT-1", from: isoDay(downFrom), to: isoDay(addDays(downFrom, 1)), kind: "exclude", hours: 0, days: "all", label: "Maintenance" },
      { id: "r-mr-ot", target: "t-mr", from: isoDay(origin), to: isoDay(addDays(origin, 13)), kind: "hours", hours: 10, days: "weekdays", label: "Approved overtime" },
    ],
  }
  if (id === "current") return current

  if (id === "holiday") {
    const thu = addDays(mondayIn(origin, 2), 3)
    return { ...current, closures: [{ id: "c-holiday", from: isoDay(thu), to: isoDay(addDays(thu, 1)), label: "Holiday — shop closed" }] }
  }

  if (id === "overtime") {
    return {
      ...current,
      rules: [
        ...current.rules.filter((r) => r.id !== "r-mr-ot"),
        { id: "r-mech-ot", target: "crew:mechanics", from: isoDay(origin), to: isoDay(addDays(origin, 20)), kind: "hours", hours: 10, days: "weekdays", label: "Backlog overtime" },
        { id: "r-mech-wkd", target: "crew:mechanics", from: isoDay(origin), to: isoDay(addDays(origin, 20)), kind: "hours", hours: 6, days: "weekends", label: "Weekend shift" },
      ],
    }
  }

  // shutdown
  const calFrom = mondayIn(origin, 1)
  return {
    ...standard,
    rules: [
      { id: "r-cal", target: "crew:test-stands", from: isoDay(calFrom), to: isoDay(addDays(calFrom, 2)), kind: "exclude", hours: 0, days: "all", label: "Calibration shutdown" },
    ],
  }
}
