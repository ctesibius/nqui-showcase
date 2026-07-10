import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  cn,
} from "@nqlib/nqui";
import type { KpiTile } from "../../data/ops-aggregates";

export function OpsKpiTile({ tile }: { tile: KpiTile }) {
  const deltaGood = tile.positiveIsGood ? tile.delta >= 0 : tile.delta <= 0;
  const deltaNeutral = tile.delta === 0;

  return (
    <Card className="bg-muted/40 shadow-none">
      <CardHeader className="pb-2">
        <CardDescription className="text-xs uppercase tracking-wider">{tile.label}</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums">{tile.value}</CardTitle>
      </CardHeader>
      <CardContent>
        <p
          className={cn(
            "text-xs tabular-nums",
            deltaNeutral
              ? "text-muted-foreground"
              : deltaGood
                ? "text-primary"
                : "text-destructive",
          )}
        >
          {deltaNeutral
            ? tile.deltaLabel
            : `${tile.delta >= 0 ? "+" : ""}${tile.delta}${tile.id === "budget" ? "%" : tile.id === "on-time" ? " pts" : ""} ${tile.deltaLabel}`}
        </p>
      </CardContent>
    </Card>
  );
}
