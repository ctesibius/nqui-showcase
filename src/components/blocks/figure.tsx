/**
 * One headline number in a divided figures row (`<dl>`): mono label, value,
 * and a detail line coloured by how it reads — good, watch or bad. Shared by
 * the MRO revenue outlook and the repair shop floor.
 */
import type { ReactNode } from "react";
import { cn } from "@nqlib/nqui";

export function Figure({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: string;
  detail: ReactNode;
  tone?: "good" | "watch" | "bad";
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1 px-4 py-3 first:pl-0 max-lg:odd:pl-0">
      <dt className="font-mono text-[10.5px] tracking-[0.14em] text-muted-foreground uppercase">{label}</dt>
      <dd className="text-xl font-semibold tracking-tight tabular-nums">{value}</dd>
      <dd
        className={cn(
          "text-xs tabular-nums text-muted-foreground",
          tone === "good" && "text-emerald-700 dark:text-emerald-400",
          tone === "watch" && "text-amber-700 dark:text-amber-400",
          tone === "bad" && "text-rose-700 dark:text-rose-400",
        )}
      >
        {detail}
      </dd>
    </div>
  );
}
