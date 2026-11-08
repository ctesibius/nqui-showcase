/**
 * Repair shop floor — nqgantt 0.6.0 on /blocks.
 *
 * Orders: one row per work order, its steps as segments — holds hatched, the
 * promised date as a marker, slack in the sidebar, and who/which machine on
 * each step. Technicians and Machines: the resource view — one row per person
 * or machine headed by its load contour (booked hours against capacity per
 * period), over-allocation flagged; expand a row for its assignments.
 */
import { useCallback, useMemo, useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Calendar03Icon } from "@hugeicons/core-free-icons";
import { Button, ToggleGroup, ToggleGroupItem } from "@nqlib/nqui";
import { ProductionGantt, type ProductionRows } from "@/nqgantt/demos/production-gantt";
import { useSharedGanttBarDesign } from "@/nqgantt/bar-design-store";
import { presetConfig, toGanttCapacity, type CapacityConfig, type PresetId } from "@/nqgantt/demos/shop-capacity";
import { ShopCapacitySheet } from "./shop-capacity-sheet";
import { ShopFloorKpis } from "./shop-floor-kpis";
import { buildProductionOrders } from "@/nqgantt/demos/production-orders";
import { computeShopKpis } from "@/nqgantt/demos/shop-kpis";

const VIEWS: { value: ProductionRows; label: string; note: string }[] = [
  {
    value: "order",
    label: "Orders",
    note: "Each row is a work order and each segment a step, labelled with the technician and the machine it runs on. Holds are hatched, the diamond is the promised date, and slack sits in the sidebar.",
  },
  {
    value: "tech",
    label: "Technicians",
    note: "Each row is a technician: bars are hours booked against that person's own capacity — shifts, part time, leave and overtime included — warm above the line, ∞ where work sits on a day off. Expand a row for their open work.",
  },
  {
    value: "machine",
    label: "Machines",
    note: "Each row is a test stand, wash line or inspection machine against its own shifts and maintenance windows. Red is a clash to move before the day arrives; ∞ is work booked while the machine is down.",
  },
];

// ── Shop floor ─────────────────────────────────────────────────────────────

export function ShopFloorBlock() {
  const [rows, setRows] = useState<ProductionRows>("order");
  // Same bar design as Campaign timeline — pick a style there, it lands here.
  const [design] = useSharedGanttBarDesign();
  // Capacity: a preset, then the planner's edits (preset → null once edited).
  const [preset, setPreset] = useState<PresetId | null>("current");
  const [config, setConfig] = useState<CapacityConfig>(() => presetConfig("current"));
  const capacity = useMemo(() => toGanttCapacity(config), [config]);
  const [sheetOpen, setSheetOpen] = useState(false);
  // One set of orders for the board and the headline numbers.
  const data = useMemo(() => buildProductionOrders(60), []);
  const kpis = useMemo(() => computeShopKpis(data), [data]);
  const rootRef = useRef<HTMLDivElement>(null);
  // From the aged-holds list: show the order, centred, and scroll the timeline to it.
  const openOrder = useCallback((orderId: string) => {
    setRows("order");
    const reveal = (tries: number) => {
      const band = rootRef.current?.querySelector<HTMLElement>(`[data-gantt-group-band][data-gantt-group-id="${orderId}"]`);
      if (!band) {
        if (tries > 0) requestAnimationFrame(() => reveal(tries - 1));
        return;
      }
      band.scrollIntoView({ block: "center", behavior: "smooth" });
      // The band's name is the group's scroll-to button once it mounts in view.
      setTimeout(() => band.querySelector<HTMLButtonElement>("button.truncate")?.click(), 450);
    };
    requestAnimationFrame(() => reveal(30));
  }, []);
  const view = VIEWS.find((v) => v.value === rows)!;
  return (
    <div ref={rootRef} className="flex h-full min-h-0 flex-col gap-3 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-[68ch] text-sm text-muted-foreground">{view.note}</p>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-7 gap-1.5 px-2 text-xs"
            onClick={() => {
              // Capacity only shows on the resource views — open on one.
              if (rows === "order") setRows("tech");
              setSheetOpen(true);
            }}
          >
            <HugeiconsIcon icon={Calendar03Icon} size={14} strokeWidth={1.8} />
            Capacity
          </Button>
          <ToggleGroup type="single" size="sm" value={rows} onValueChange={(v) => v && setRows(v as ProductionRows)} aria-label="Rows">
            {VIEWS.map((v) => (
              <ToggleGroupItem key={v.value} value={v.value} className="text-xs">
                {v.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      </div>
      <ShopFloorKpis kpis={kpis} onOpenOrder={openOrder} />
      <ProductionGantt orders={60} rows={rows} range="daily" density="compact" critical={false} openFirst design={design} capacity={capacity} data={data} />
      <ShopCapacitySheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        config={config}
        onConfigChange={(next) => {
          setConfig(next);
          setPreset(null);
        }}
        preset={preset}
        view={rows === "machine" ? "machine" : "tech"}
        onViewChange={setRows}
        onPresetChange={(id) => {
          setConfig(presetConfig(id));
          setPreset(id);
        }}
      />
    </div>
  );
}
