/**
 * Repair-shop work orders for the gantt lab's Production fixtures.
 *
 * Each order moves through receiving → teardown → inspect → assembly → test →
 * ship, sometimes waits on a named hold (parts, quote approval, QA), and
 * sometimes orders parts in parallel with inspection — that overlap is what
 * makes a segmented row pack into a second lane. Deterministic (seeded), dated
 * relative to today so the board always shows work in flight.
 */
import type { GanttDependency, GanttStatus } from "@nqlib/nqgantt"
import type { NextGanttFeature, NextGanttGroup } from "./nqgantt-next"

export type StepKey = "recv" | "tear" | "insp" | "parts" | "hold" | "asm" | "test" | "ship"

export const STEPS: { key: StepKey; name: string; color: string; center?: string; capacity?: number }[] = [
  { key: "recv", name: "Receiving", color: "var(--chart-3)", center: "Receiving dock", capacity: 3 },
  { key: "tear", name: "Teardown", color: "var(--chart-2)", center: "Teardown bays", capacity: 4 },
  { key: "insp", name: "Inspect", color: "var(--chart-4)", center: "Inspection", capacity: 3 },
  { key: "parts", name: "Order parts", color: "var(--info)" },
  { key: "hold", name: "Hold", color: "var(--warning)" },
  { key: "asm", name: "Assembly", color: "var(--chart-1)", center: "Assembly bays", capacity: 5 },
  { key: "test", name: "Test", color: "var(--chart-5)", center: "Test bench", capacity: 2 },
  { key: "ship", name: "Ship", color: "var(--success)", center: "Shipping", capacity: 3 },
]
const STEP = Object.fromEntries(STEPS.map((s) => [s.key, s])) as Record<StepKey, (typeof STEPS)[number]>

const PARTS = [
  "Hydraulic pump", "Starter generator", "Fuel control unit", "Gearbox", "Actuator",
  "Heat exchanger", "Brake assembly", "Air cycle machine", "Valve body", "Landing light",
]
/** Who has to act to release a hold — the person a GM chases. */
export type HoldOwner = "customer" | "supplier" | "shop"
export const HOLD_OWNER_LABEL: Record<HoldOwner, string> = { customer: "Customer", supplier: "Supplier", shop: "Shop" }

const QUOTE = { reason: "Quote approval", short: "Quote", owner: "customer" as const, days: [3, 10] as [number, number] }
const PARTS_HOLD = { reason: "Awaiting parts", short: "Parts", owner: "supplier" as const, days: [2, 8] as [number, number] }
const QA = { reason: "QA review", short: "QA", owner: "shop" as const, days: [1, 3] as [number, number] }
/**
 * Typical wait by hold type, in days — customers sit on quotes longest. Most
 * units need a repair quote approved after inspection unless they are under
 * a flat-rate contract, so quotes dominate (weighted by repetition).
 */
const HOLDS: { reason: string; short: string; owner: HoldOwner; days: [number, number] }[] = [
  QUOTE, QUOTE, QUOTE, QUOTE, QUOTE, QUOTE,
  PARTS_HOLD, PARTS_HOLD, PARTS_HOLD, PARTS_HOLD,
  QA, QA,
]

/** AOG: aircraft on ground — the unit jumps the queue. */
export type Priority = "aog" | "expedite" | "routine"
export const PRIORITY_RANK: Record<Priority, number> = { aog: 0, expedite: 1, routine: 2 }

export const CUSTOMERS = ["Northwind Air", "Bluejay Airlines", "Cascade Regional", "Meridian Cargo", "Solstice Air", "Harbor Aviation"]

/** Contracted turnaround (days, receipt → ship) by part type — typical component-shop TATs. */
export const CONTRACT_TAT: Record<string, number> = {
  "Hydraulic pump": 21, "Starter generator": 21, "Fuel control unit": 24, Gearbox: 28, Actuator: 18,
  "Heat exchanger": 18, "Brake assembly": 14, "Air cycle machine": 24, "Valve body": 14, "Landing light": 10,
}

/** Typical invoice per repair, USD. AOG work bills a 50% premium. */
const PART_VALUE: Record<string, number> = {
  "Hydraulic pump": 18_400, "Starter generator": 24_200, "Fuel control unit": 31_800, Gearbox: 41_500, Actuator: 12_300,
  "Heat exchanger": 9_100, "Brake assembly": 7_400, "Air cycle machine": 27_900, "Valve body": 6_200, "Landing light": 2_100,
}
/**
 * Technicians and what they are certified to do. Crew sized to the 60-order
 * board (~9 person-days of work per working day), so most run at 75–90% and
 * the red cells are real bunching, not a short-staffed fixture.
 */
export const TECHS: { id: string; name: string; role: string; skills: StepKey[] }[] = [
  { id: "t-jl", name: "Jo Lin", role: "Logistics", skills: ["recv", "ship"] },
  { id: "t-kr", name: "Kim Ruiz", role: "Logistics", skills: ["recv", "ship"] },
  { id: "t-mr", name: "Mo Reyes", role: "Mechanic", skills: ["tear", "asm"] },
  { id: "t-tn", name: "Tam Ngo", role: "Mechanic", skills: ["tear", "asm"] },
  { id: "t-ad", name: "Ana Diaz", role: "Mechanic", skills: ["tear", "asm"] },
  { id: "t-rs", name: "Ravi Sen", role: "Mechanic", skills: ["tear", "asm"] },
  { id: "t-so", name: "Sam Ortiz", role: "Mechanic", skills: ["asm", "test"] },
  { id: "t-ak", name: "Ari Kato", role: "NDT inspector", skills: ["insp"] },
  { id: "t-lp", name: "Lee Park", role: "Inspector", skills: ["insp"] },
  { id: "t-ds", name: "Dee Shah", role: "Test engineer", skills: ["test"] },
  { id: "t-pv", name: "Pia Voss", role: "Test engineer", skills: ["insp", "test"] },
]

/** Shop equipment. Test benches are part-specific; the wash lines and NDT gear are shared. */
export const MACHINES: { id: string; name: string; step: StepKey; parts?: string[] }[] = [
  { id: "WSH-1", name: "Wash & strip line 1", step: "tear" },
  { id: "WSH-2", name: "Wash & strip line 2", step: "tear" },
  { id: "NDT-1", name: "Penetrant booth", step: "insp" },
  { id: "CMM-1", name: "Coordinate measuring machine", step: "insp" },
  { id: "HTS-1", name: "Hydraulic test stand 1", step: "test", parts: ["Hydraulic pump", "Actuator", "Valve body", "Brake assembly"] },
  { id: "HTS-2", name: "Hydraulic test stand 2", step: "test", parts: ["Hydraulic pump", "Actuator", "Valve body", "Brake assembly"] },
  { id: "ETB-1", name: "Electrical test bench", step: "test", parts: ["Starter generator", "Landing light"] },
  { id: "FTR-1", name: "Fuel test rig", step: "test", parts: ["Fuel control unit"] },
  { id: "PTR-1", name: "Pneumatic test rig", step: "test", parts: ["Air cycle machine", "Heat exchanger"] },
  { id: "GTB-1", name: "Gearbox test bench", step: "test", parts: ["Gearbox"] },
]

/**
 * Share of a technician's day a step actually takes (allocation %). Receiving
 * or shipping a unit is a few hours; a multi-day assembly includes cure and
 * wait time. Machines stay at 100% while a step runs on them.
 */
const HANDS_ON: Record<StepKey, number> = {
  recv: 40,
  tear: 80,
  insp: 70,
  parts: 0,
  hold: 0,
  asm: 90,
  test: 75,
  ship: 40,
}

const DONE: GanttStatus = { id: "done", name: "Done", color: "var(--success)" }
const ACTIVE: GanttStatus = { id: "in-progress", name: "In progress", color: "var(--info)" }
const TODO: GanttStatus = { id: "todo", name: "To do", color: "var(--muted-foreground)" }
export const PRODUCTION_STATUSES = [TODO, ACTIVE, DONE]

/** mulberry32 — tiny deterministic PRNG so fixtures are stable across reloads. */
function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const DAY = 86_400_000

function atDay(origin: Date, day: number) {
  return new Date(origin.getFullYear(), origin.getMonth(), origin.getDate() + day)
}

export type ProductionOrder = {
  id: string
  wo: string
  part: string
  customer: string
  priority: Priority
  /** Contracted turnaround, days. */
  contractTat: number
  /** Expected invoice, USD. */
  value: number
  dueAt: Date
  steps: NextGanttFeature[]
}

export type ProductionData = {
  orders: ProductionOrder[]
  features: NextGanttFeature[]
  dependencies: GanttDependency[]
}

export function buildProductionOrders(count: number, today = new Date()): ProductionData {
  const rand = rng(count * 7919)
  // A second stream for order attributes (priority, customer, hold owner),
  // so adding them never reshuffles the schedule the first stream produces.
  const meta = rng(count * 104_729 + 17)
  const metaPick = <T,>(xs: readonly T[]) => xs[Math.floor(meta() * xs.length)]
  const metaSpan = (min: number, max: number) => min + Math.floor(meta() * (max - min + 1))
  const pick = <T,>(xs: readonly T[]) => xs[Math.floor(rand() * xs.length)]
  const span = (min: number, max: number) => min + Math.floor(rand() * (max - min + 1))
  const origin = atDay(today, 0)
  const nowMs = Date.now()
  // Spread starts so roughly a third are done, a third in flight, a third ahead.
  // At least ~3 months of receipts, so a small board (the /blocks shop floor)
  // still straddles today instead of being mostly shipped history.
  const window = Math.max(100, Math.round(count * 0.9))

  const orders: ProductionOrder[] = []
  const features: NextGanttFeature[] = []
  const dependencies: GanttDependency[] = []

  // A light dispatcher: each step goes to a qualified technician (and, where
  // the step needs one, a machine) free at its start; with none free it takes
  // whoever frees up first — that overlap is the over-allocation the resource
  // view flags, as on a real floor.
  // Bookings per resource as [start, end) intervals. Orders are dispatched one
  // after another, so a single "free from" cursor would let a late booking
  // (an order's ship step) hide every gap before it.
  const techBooked = new Map<string, [number, number][]>()
  const machineBooked = new Map<string, [number, number][]>()
  const overlap = (booked: [number, number][] | undefined, s: number, e: number) => {
    let ms = 0
    for (const [bs, be] of booked ?? []) ms += Math.max(0, Math.min(e, be) - Math.max(s, bs))
    return ms
  }
  const assignFrom = <T extends { id: string }>(
    pool: T[],
    booked: Map<string, [number, number][]>,
    startMs: number,
    endMs: number,
  ) => {
    if (!pool.length) return undefined
    const ready = pool.filter((r) => overlap(booked.get(r.id), startMs, endMs) === 0)
    const choice = ready.length
      ? ready[Math.floor(rand() * ready.length)]
      : pool.reduce((a, b) =>
          overlap(booked.get(a.id), startMs, endMs) <= overlap(booked.get(b.id), startMs, endMs) ? a : b,
        )
    booked.set(choice.id, [...(booked.get(choice.id) ?? []), [startMs, endMs]])
    return choice
  }

  for (let i = 0; i < count; i++) {
    const id = `wo-${24100 + i}`
    const wo = `WO-${24100 + i}`
    const part = pick(PARTS)
    const roll = meta()
    const priority: Priority = roll < 0.08 ? "aog" : roll < 0.24 ? "expedite" : "routine"
    const customer = metaPick(CUSTOMERS)
    let day = Math.round((i / count) * window) - Math.round(window * 0.5) + span(0, 3)
    const steps: NextGanttFeature[] = []
    let prev: string | null = null

    const push = (key: StepKey, days: number, extra: Partial<NextGanttFeature> = {}, chain = true) => {
      const start = atDay(origin, day)
      const end = atDay(origin, day + days)
      const step = STEP[key]
      const startMs = start.getTime()
      const endMs = end.getTime()
      const progress = key === "hold"
        ? undefined
        : endMs <= nowMs ? 100 : startMs >= nowMs ? 0 : Math.round(((nowMs - startMs) / (endMs - startMs)) * 100)
      const feature: NextGanttFeature = {
        id: `${id}-${key}`,
        name: step.name,
        startAt: start,
        endAt: end,
        status: progress === 100 ? DONE : progress && progress > 0 ? ACTIVE : TODO,
        progress,
        lane: step.center,
        customFields: { step: key, wo, part },
        ...extra,
      }
      if (key !== "hold" && key !== "parts") {
        const tech = assignFrom(TECHS.filter((t) => t.skills.includes(key)), techBooked, startMs, endMs)
        if (tech) feature.assignees = [{ id: tech.id, name: tech.name, allocation: HANDS_ON[key] }]
        const machines = MACHINES.filter((m) => m.step === key && (!m.parts || m.parts.includes(part)))
        const machine = assignFrom(machines, machineBooked, startMs, endMs)
        if (machine) feature.customFields = { ...feature.customFields, machine: machine.id }
      }
      steps.push(feature)
      if (chain) {
        if (prev) dependencies.push({ fromId: prev, toId: feature.id, type: "FS" })
        prev = feature.id
        day += days
      }
      return feature
    }

    push("recv", 1)
    // Queue time: a received unit waits for a teardown bay, and an inspected
    // one for an assembly slot. No one is booked, so loads don't change —
    // but turnaround is mostly waiting, as on a real floor, and the gaps
    // between segments are where it shows.
    day += metaSpan(1, 5)
    push("tear", span(1, 3))
    const inspDays = span(1, 3)
    // Parts ordered while inspection runs → overlap → a second lane.
    if (rand() < 0.2) push("parts", inspDays + span(1, 3), {}, false)
    push("insp", inspDays)
    if (rand() < 0.75) {
      const hold = pick(HOLDS)
      const days = span(hold.days[0], hold.days[1])
      // A third of estimates have already slipped: the release date passed
      // and the hold is still open.
      const slip = meta() < 0.35 ? metaSpan(1, 3) : 0
      const h = push("hold", days, {
        name: hold.short,
        kind: "hold",
        holdReason: hold.reason,
        expectedRelease: atDay(origin, day + days - slip),
      })
      h.customFields = { ...h.customFields, holdOwner: hold.owner, holdShort: hold.short }
    }
    day += metaSpan(0, 3)
    push("asm", span(2, 4))
    push("test", span(1, 2))
    push("ship", 1)

    const planned = (steps[steps.length - 1].endAt.getTime() - steps[0].startAt.getTime()) / DAY
    // Promise = plan ± a few days, so some orders are late and some have slack.
    const promise = span(-3, 4)
    // AOG units are promised tight — the customer has an aircraft waiting.
    const dueAt = atDay(steps[0].startAt, Math.round(planned) + (priority === "aog" ? metaSpan(-2, 1) : promise))
    for (const step of steps) step.customFields = { ...step.customFields, priority, customer }

    orders.push({
      id,
      wo,
      part,
      customer,
      priority,
      contractTat: CONTRACT_TAT[part] ?? 12,
      value: Math.round((PART_VALUE[part] ?? 10_000) * (priority === "aog" ? 1.5 : 1)),
      dueAt,
      steps,
    })
    features.push(...steps)
  }

  return { orders, features, dependencies }
}

/** The hold an order is waiting on right now, with its age. */
export function activeHold(order: ProductionOrder, now: Date) {
  const t = now.getTime()
  const hold = order.steps.find((s) => s.kind === "hold" && s.startAt.getTime() <= t && t < s.endAt.getTime())
  if (!hold) return null
  const owner = (hold.customFields?.holdOwner as HoldOwner | undefined) ?? "shop"
  const ageDays = Math.max(0, Math.floor((t - hold.startAt.getTime()) / DAY))
  const slipped = hold.expectedRelease != null && hold.expectedRelease.getTime() < t
  return {
    order,
    hold,
    owner,
    short: (hold.customFields?.holdShort as string | undefined) ?? hold.name,
    reason: hold.holdReason ?? hold.name,
    ageDays,
    expectedRelease: hold.expectedRelease,
    slipped,
  }
}

export type ActiveHold = NonNullable<ReturnType<typeof activeHold>>

/** "today" for a hold that started today, else "9d". */
export function formatHoldAge(days: number): string {
  return days === 0 ? "today" : `${days}d`
}

const shortDate = (d: Date) => d.toLocaleDateString(undefined, { month: "short", day: "numeric" })

/** Sidebar badges: priority first, then the hold the order is waiting on and for how long. */
export function orderBadges(order: ProductionOrder, now: Date): NonNullable<NextGanttGroup["badges"]> {
  const badges: NonNullable<NextGanttGroup["badges"]> = []
  if (order.priority === "aog") badges.push({ id: "pri", label: "AOG", tone: "destructive", title: `Aircraft on ground · ${order.customer}` })
  else if (order.priority === "expedite") badges.push({ id: "pri", label: "Expedite", tone: "info", title: `Expedite · ${order.customer}` })
  const h = activeHold(order, now)
  if (h) {
    badges.push({
      id: "hold",
      label: `${h.short} · ${formatHoldAge(h.ageDays)}`,
      tone: h.slipped || h.ageDays >= 7 ? "warning" : "neutral",
      title: `${h.reason} — waiting on ${HOLD_OWNER_LABEL[h.owner].toLowerCase()} for ${h.ageDays} days${
        h.expectedRelease ? ` · ${h.slipped ? "was due" : "expected"} ${shortDate(h.expectedRelease)}` : ""
      }`,
    })
  }
  return badges
}

/** One segmented row per work order, with priority and hold badges. */
export function groupByOrder(data: ProductionData, now = new Date()): NextGanttGroup[] {
  return data.orders.map((o) => ({
    id: o.id,
    name: `${o.wo} · ${o.part}`,
    features: o.steps,
    layout: "segments",
    dueAt: o.dueAt,
    badges: orderBadges(o, now),
  }))
}

/** Open work, soonest first: what an expanded resource row lists. */
const openWork = (fs: NextGanttFeature[]) =>
  fs.filter((f) => f.progress !== 100).sort((a, b) => a.startAt.getTime() - b.startAt.getTime())

/** Every step relabelled "WO-24124 · Assembly", so a resource's rows read as a work list. */
const asWorkItem = (f: NextGanttFeature): NextGanttFeature => ({
  ...f,
  // AOG leads the work item, so a technician's queue shows it first thing.
  name: `${f.customFields?.priority === "aog" ? "AOG · " : ""}${f.customFields?.wo} · ${f.name}`,
})

/**
 * Resource view by technician. Each row is headed by a load contour (booked
 * hours against an 8-hour day per timeline period, computed by nqgantt from
 * every assignment) and lists that person's open work when expanded.
 */
export function technicianView(data: ProductionData): { features: NextGanttFeature[]; groups: NextGanttGroup[] } {
  const features = data.features.map(asWorkItem)
  const groups = TECHS.map((t) => ({
    id: t.id,
    name: `${t.name} · ${t.role}`,
    resourceId: t.id,
    features: openWork(features.filter((f) => f.assignees?.some((a) => a.id === t.id))),
  }))
  return { features, groups }
}

/**
 * Resource view by machine: the same steps assigned to the equipment they run
 * on (machines as assignees, at 100% while a step runs), so each machine gets
 * its own load contour.
 */
export function machineView(data: ProductionData): { features: NextGanttFeature[]; groups: NextGanttGroup[] } {
  const features: NextGanttFeature[] = []
  const byMachine = new Map<string, NextGanttFeature[]>()
  for (const f of data.features) {
    const id = f.customFields?.machine as string | undefined
    if (!id) continue
    const machine = MACHINES.find((m) => m.id === id)!
    const copy: NextGanttFeature = {
      ...asWorkItem(f),
      assignees: [{ id: `m:${id}`, name: machine.name, allocation: 100 }],
    }
    features.push(copy)
    byMachine.set(id, [...(byMachine.get(id) ?? []), copy])
  }
  const groups = MACHINES.filter((m) => byMachine.has(m.id)).map((m) => ({
    id: `m:${m.id}`,
    name: `${m.id} · ${m.name}`,
    resourceId: `m:${m.id}`,
    features: openWork(byMachine.get(m.id)!),
  }))
  return { features, groups }
}

export function stepColor(feature: NextGanttFeature): string | undefined {
  const key = feature.customFields?.step as StepKey | undefined
  return key ? STEP[key]?.color : undefined
}
