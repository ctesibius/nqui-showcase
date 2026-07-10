import { format, parseISO } from "date-fns";
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ScrollArea,
  Separator,
  cn,
} from "@nqlib/nqui";
import { ACTIVITIES, RISKS, TEAM } from "../../lib/mock/ops";

const teamById = new Map(TEAM.map((p) => [p.id, p]));

const severityVariant = {
  high: "destructive",
  medium: "secondary",
  low: "outline",
} as const;

export function OpsRightRail({ className, compact }: { className?: string; compact?: boolean }) {
  const sectionPad = compact ? "px-4 py-0" : undefined;
  const contentPad = compact ? "px-4 pb-4 pt-0" : undefined;

  const activityList = (
    <ul className="flex w-full max-w-full flex-col gap-3">
      {ACTIVITIES.map((item) => {
        const actor = teamById.get(item.actorId);
        const name = actor?.name ?? "System";
        return (
          <li
            key={item.id}
            className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-2 text-xs leading-snug"
          >
            <p className="min-w-0 wrap-break-word">
              <span className="font-medium text-foreground">{name}</span>
              <span className="text-muted-foreground"> — {item.message}</span>
            </p>
            <time
              className="shrink-0 self-start tabular-nums text-muted-foreground"
              dateTime={item.at}
            >
              {format(parseISO(item.at), "HH:mm")}
            </time>
          </li>
        );
      })}
    </ul>
  );

  return (
    <Card
      className={cn(
        "min-w-0 max-w-full bg-muted/40 shadow-none xl:w-72 xl:shrink-0",
        compact && "overflow-hidden",
        className,
      )}
    >
      <CardHeader className={cn("pb-3", sectionPad)}>
        <CardDescription className="text-xs uppercase tracking-wider">Activity</CardDescription>
        <CardTitle className="text-sm font-normal text-muted-foreground">Recent program events</CardTitle>
      </CardHeader>
      <CardContent className={cn("pb-4", contentPad)}>
        {compact ? activityList : <ScrollArea>{activityList}</ScrollArea>}
      </CardContent>

      <Separator />

      <CardHeader className={cn("pb-3 pt-4", sectionPad)}>
        <CardDescription className="text-xs uppercase tracking-wider">Risk register</CardDescription>
        <CardTitle className="text-sm font-normal text-muted-foreground">
          Open items requiring attention
        </CardTitle>
      </CardHeader>
      <CardContent className={contentPad}>
        <ul className="flex w-full max-w-full flex-col gap-2">
          {RISKS.map((risk) => (
            <li
              key={risk.id}
              className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-2 text-xs leading-snug"
            >
              <Badge
                variant={severityVariant[risk.severity]}
                className="mt-0.5 shrink-0 px-1.5 py-0"
              >
                {risk.severity}
              </Badge>
              <span className="min-w-0 wrap-break-word">{risk.summary}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
