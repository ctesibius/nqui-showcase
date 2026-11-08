import { Tabs, TabsList, TabsTrigger } from "@nqlib/nqui";

export type SheetId = "orders" | "pivot" | "summary";

export const SHEETS: ReadonlyArray<{ id: SheetId; label: string }> = [
  { id: "orders", label: "Orders" },
  { id: "pivot", label: "Pivot" },
  { id: "summary", label: "Summary" },
];

export interface SheetTabsProps {
  active: SheetId;
  onChange: (id: SheetId) => void;
}

/** Excel-style bottom tab strip — switches the visible sheet view (nqui Tabs, no panels). */
export function SheetTabs({ active, onChange }: SheetTabsProps) {
  return (
    <Tabs
      value={active}
      onValueChange={(v) => onChange(v as SheetId)}
      className="shrink-0 border-t border-border px-2 py-1"
    >
      <TabsList aria-label="Sheets">
        {SHEETS.map((sheet) => (
          <TabsTrigger key={sheet.id} value={sheet.id} className="text-xs">
            {sheet.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
