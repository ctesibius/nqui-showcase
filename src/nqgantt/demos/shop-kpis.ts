/**
 * The numbers an MRO general manager is judged on, from the shop floor's own
 * work orders: work in progress, on-time delivery, turnaround against contract,
 * what is late (and the revenue behind it), and who every hold is waiting on.
 */
import {
  activeHold,
  type ActiveHold,
  type HoldOwner,
  type ProductionData,
  type ProductionOrder,
} from "./production-orders"

const DAY = 86_400_000

export type ShopKpis = {
  /** Units physically in the shop (received, not shipped); `inbound` not yet received. */
  wip: { inShop: number; aog: number; expedite: number; inbound: number }
  /** Orders shipped in the last `windowDays`. */
  delivery: { shipped: number; onTime: number; pct: number | null; windowDays: number }
  turnaround: { avgDays: number | null; withinContractPct: number | null }
  late: { count: number; aog: number; valueAtRisk: number }
  waiting: { total: number; byOwner: Record<HoldOwner, number>; oldestDays: number; slipped: number; holds: ActiveHold[] }
}

function shipStep(o: ProductionOrder) {
  return o.steps.find((s) => s.customFields?.step === "ship")
}

function finish(o: ProductionOrder): Date {
  return o.steps.reduce((max, s) => (s.endAt > max ? s.endAt : max), o.steps[0]!.endAt)
}

function isShipped(o: ProductionOrder, now: Date): boolean {
  const ship = shipStep(o)
  return ship != null && ship.endAt.getTime() <= now.getTime()
}

export function computeShopKpis(data: ProductionData, now = new Date(), windowDays = 30): ShopKpis {
  const t = now.getTime()
  const open = data.orders.filter((o) => !isShipped(o, now))
  const inShop = open.filter((o) => o.steps[0]!.startAt.getTime() <= t)

  const recent = data.orders.filter((o) => {
    if (!isShipped(o, now)) return false
    const shipped = shipStep(o)!.endAt.getTime()
    return shipped > t - windowDays * DAY
  })
  // On time: shipped by the end of the promised day.
  const onTime = recent.filter((o) => shipStep(o)!.endAt.getTime() <= o.dueAt.getTime() + DAY).length
  const tats = recent.map((o) => (shipStep(o)!.endAt.getTime() - o.steps[0]!.startAt.getTime()) / DAY)
  const within = recent.filter((o, i) => tats[i]! <= o.contractTat).length

  // Late or at risk: open orders whose plan finishes after the promise.
  const late = open.filter((o) => finish(o).getTime() > o.dueAt.getTime() + DAY)

  const holds = open
    .map((o) => activeHold(o, now))
    .filter((h): h is ActiveHold => h != null)
    .sort((a, b) => b.ageDays - a.ageDays)
  const byOwner: Record<HoldOwner, number> = { customer: 0, supplier: 0, shop: 0 }
  for (const h of holds) byOwner[h.owner]++

  return {
    wip: {
      inShop: inShop.length,
      aog: inShop.filter((o) => o.priority === "aog").length,
      expedite: inShop.filter((o) => o.priority === "expedite").length,
      inbound: open.length - inShop.length,
    },
    delivery: {
      shipped: recent.length,
      onTime,
      pct: recent.length ? Math.round((onTime / recent.length) * 100) : null,
      windowDays,
    },
    turnaround: {
      avgDays: tats.length ? Math.round((tats.reduce((a, b) => a + b, 0) / tats.length) * 10) / 10 : null,
      withinContractPct: recent.length ? Math.round((within / recent.length) * 100) : null,
    },
    late: {
      count: late.length,
      aog: late.filter((o) => o.priority === "aog").length,
      valueAtRisk: late.reduce((sum, o) => sum + o.value, 0),
    },
    waiting: {
      total: holds.length,
      byOwner,
      oldestDays: holds[0]?.ageDays ?? 0,
      slipped: holds.filter((h) => h.slipped).length,
      holds,
    },
  }
}
