/**
 * Shop floor headline row: what an MRO GM is judged on, above the board.
 * Work in progress (and how much of it is AOG), on-time delivery and
 * turnaround against contract over the last 30 days, what the plan says will
 * miss its promise and the
 * revenue behind it, and who every hold is waiting on — with the aged list one
 * click away, each row jumping the board to its work order.
 */
import { Badge, Button, Popover, PopoverContent, PopoverTrigger, ScrollArea, cn } from "@nqlib/nqui";
import { HOLD_OWNER_LABEL, formatHoldAge, type HoldOwner } from "@/nqgantt/demos/production-orders";
import type { ShopKpis } from "@/nqgantt/demos/shop-kpis";
import { Figure } from "./figure";

const money = (v: number) =>
  v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(1)}M` : v >= 1_000 ? `$${Math.round(v / 1_000)}k` : `$${v}`;

const shortDate = (d: Date) => d.toLocaleDateString(undefined, { month: "short", day: "numeric" });

const OWNERS: HoldOwner[] = ["customer", "supplier", "shop"];

function rate(pct: number | null, good: number, watch: number): "good" | "watch" | "bad" | undefined {
  if (pct == null) return undefined;
  return pct >= good ? "good" : pct >= watch ? "watch" : "bad";
}

export function ShopFloorKpis({ kpis, onOpenOrder }: { kpis: ShopKpis; onOpenOrder: (orderId: string) => void }) {
  const { wip, delivery, turnaround, late, waiting } = kpis;
  return (
    <dl className="grid grid-cols-2 border-y border-border lg:grid-cols-5 lg:divide-x lg:divide-border">
      <Figure
        label="In the shop"
        value={String(wip.inShop)}
        detail={
          <span>
            {wip.aog ? <span className="font-medium text-rose-700 dark:text-rose-400">{wip.aog} AOG · </span> : null}
            {wip.expedite} expedite · {wip.inbound} inbound
          </span>
        }
      />
      <Figure
        label={`On time · ${delivery.windowDays}d`}
        value={delivery.pct == null ? "—" : `${delivery.pct}%`}
        detail={`${delivery.onTime} of ${delivery.shipped} shipped by promise`}
        tone={rate(delivery.pct, 90, 75)}
      />
      <Figure
        label={`Turnaround · ${delivery.windowDays}d`}
        value={turnaround.avgDays == null ? "—" : `${turnaround.avgDays}d`}
        detail={turnaround.withinContractPct == null ? "No shipments" : `${turnaround.withinContractPct}% within contract TAT`}
        tone={rate(turnaround.withinContractPct, 85, 70)}
      />
      <Figure
        label="Projected late"
        value={String(late.count)}
        detail={late.count ? `${money(late.valueAtRisk)} at risk${late.aog ? ` · ${late.aog} AOG` : ""}` : "Every open order on plan"}
        tone={late.count ? (late.aog ? "bad" : "watch") : "good"}
      />
      <Figure
        label="Waiting on"
        value={String(waiting.total)}
        detail={
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="link"
                size="sm"
                className="h-auto p-0 text-xs font-normal text-muted-foreground underline decoration-dotted underline-offset-2 hover:text-foreground"
              >
                {OWNERS.filter((o) => waiting.byOwner[o]).map((o) => `${HOLD_OWNER_LABEL[o]} ${waiting.byOwner[o]}`).join(" · ") || "Nothing on hold"}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-[min(30rem,calc(100vw-2rem))] p-0">
              <div className="flex items-baseline justify-between gap-3 border-b border-border/70 px-3 py-2">
                <p className="text-sm font-medium">Waiting on</p>
                <p className="text-xs text-muted-foreground">
                  Oldest {waiting.oldestDays}d{waiting.slipped ? ` · ${waiting.slipped} past their estimate` : ""}
                </p>
              </div>
              <ScrollArea fadeMask={false} viewportStyle={{ maxHeight: "18rem" }}>
                <ul className="divide-y divide-border/60">
                  {waiting.holds.map((h) => (
                    <li key={h.hold.id}>
                      <Button
                        type="button"
                        variant="ghost"
                        className="grid h-auto w-full grid-cols-[1fr_auto] items-center gap-x-3 whitespace-normal rounded-none px-3 py-2 text-left font-normal"
                        onClick={() => onOpenOrder(h.order.id)}
                      >
                        <span className="min-w-0">
                          <span className="flex items-center gap-1.5 text-xs font-medium">
                            {h.order.wo}
                            {h.order.priority === "aog" ? (
                              <Badge variant="destructive" className="px-1 py-0 text-[9px]">AOG</Badge>
                            ) : null}
                            <span className="truncate font-normal text-muted-foreground">· {h.order.part}</span>
                          </span>
                          <span className="block truncate text-[11px] text-muted-foreground">
                            {h.reason} · {HOLD_OWNER_LABEL[h.owner]}
                            {h.owner === "customer" ? ` (${h.order.customer})` : ""}
                          </span>
                        </span>
                        <span className="text-right">
                          <span className={cn("block text-xs font-medium tabular-nums", (h.slipped || h.ageDays >= 7) && "text-amber-700 dark:text-amber-400")}>
                            {formatHoldAge(h.ageDays)}
                          </span>
                          {h.expectedRelease ? (
                            <span className="block text-[11px] text-muted-foreground tabular-nums">
                              {h.slipped ? "was due " : "due "}
                              {shortDate(h.expectedRelease)}
                            </span>
                          ) : null}
                        </span>
                      </Button>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </PopoverContent>
          </Popover>
        }
        tone={waiting.slipped ? "watch" : undefined}
      />
    </dl>
  );
}
