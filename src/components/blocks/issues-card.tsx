/**
 * Shared issue card — glyph, title, blurb, date, progress, health, assignee.
 * Used by Blocks and Board so the two views share one composition.
 */
import type { ComponentProps, CSSProperties } from "react";
import { Avatar, AvatarFallback, cn } from "@nqlib/nqui";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Activity03Icon,
  Alert02Icon,
  Calendar03Icon,
  Camera01Icon,
  CheckmarkCircle02Icon,
  DiamondIcon,
  Film01Icon,
  Flag01Icon,
  HexagonIcon,
  Image01Icon,
  LockIcon,
  Mail01Icon,
  Megaphone01Icon,
  Package01Icon,
  Pulse01Icon,
  ShoppingBag01Icon,
  SparklesIcon,
  Store01Icon,
  Tag01Icon,
  TruckIcon,
  UserGroupIcon,
  Video01Icon,
  WarehouseIcon,
} from "@hugeicons/core-free-icons";
import {
  CAMPAIGN_STATUSES,
  TEAM_BY_ID,
  daysBetween,
  parseLocalISO,
  type PmIssue,
} from "@/lib/pm";

type GlyphIcon = ComponentProps<typeof HugeiconsIcon>["icon"];

const GLYPH: Record<string, { icon: GlyphIcon; token: string }> = {
  m1: { icon: LockIcon, token: "var(--chart-1)" },
  m2: { icon: Image01Icon, token: "var(--chart-2)" },
  m3: { icon: SparklesIcon, token: "var(--chart-4)" },
  m4: { icon: ShoppingBag01Icon, token: "var(--chart-1)" },
  m4a: { icon: LockIcon, token: "var(--chart-2)" },
  m4b: { icon: Store01Icon, token: "var(--chart-3)" },
  m4c: { icon: Tag01Icon, token: "var(--chart-5)" },
  m5: { icon: Flag01Icon, token: "var(--chart-4)" },
  m6: { icon: Tag01Icon, token: "var(--chart-5)" },
  c1: { icon: Film01Icon, token: "var(--chart-1)" },
  c2: { icon: Megaphone01Icon, token: "var(--chart-2)" },
  c3: { icon: Image01Icon, token: "var(--chart-3)" },
  c4: { icon: Video01Icon, token: "var(--chart-1)" },
  c4a: { icon: Film01Icon, token: "var(--chart-4)" },
  c4b: { icon: Camera01Icon, token: "var(--chart-5)" },
  c4c: { icon: Mail01Icon, token: "var(--chart-2)" },
  c4d: { icon: Megaphone01Icon, token: "var(--chart-3)" },
  c5: { icon: Flag01Icon, token: "var(--chart-4)" },
  c6: { icon: SparklesIcon, token: "var(--chart-1)" },
  o1: { icon: WarehouseIcon, token: "var(--chart-3)" },
  o2: { icon: Package01Icon, token: "var(--chart-2)" },
  o3: { icon: TruckIcon, token: "var(--chart-5)" },
  o4: { icon: UserGroupIcon, token: "var(--chart-1)" },
  o5: { icon: Flag01Icon, token: "var(--chart-4)" },
  o6: { icon: Package01Icon, token: "var(--chart-3)" },
};

const BLURB: Record<string, string> = {
  m1: "Lock SKU mix before vendor buys",
  m2: "Lookbook through to stores",
  m3: "Floor and PDP push",
  m4: "Seasonal intake for BTS",
  m4a: "Confirmed units from vendors",
  m4b: "Bay and endcap map",
  m4c: "Finance sign-off on the buy",
  m5: "Hard date — assortment freeze",
  m6: "Markdown architecture",
  c1: "Principal photography",
  c2: "Always-on prospecting",
  c3: "Print and web lock",
  c4: "Film, stills, and cutdowns",
  c4a: "Brand film cut",
  c4b: "Product photography",
  c4c: "Lifecycle and promo",
  c4d: "15s and 6s for paid",
  c5: "Hard date — site switch",
  c6: "Seeded unboxings",
  o1: "Cubic and labor model",
  o2: "Peak containers on water",
  o3: "Parcel and LTL rates",
  o4: "Seasonal DC labor",
  o5: "Hard date — last inbound",
  o6: "Post-peak reverse logistics",
};

export function initials(name: string) {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function statusMeta(id: string) {
  return CAMPAIGN_STATUSES.find((s) => s.id === id);
}

function formatBlockDate(issue: PmIssue): string {
  const start = parseLocalISO(issue.timeline.start);
  const end = parseLocalISO(issue.timeline.end);
  if (daysBetween(start, end) >= 60) {
    const q = Math.floor(start.getMonth() / 3) + 1;
    return `Q${q} ${start.getFullYear()}`;
  }
  return start.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export function LaneMark({ status }: { status: string }) {
  const color = statusMeta(status)?.color ?? "var(--muted-foreground)";
  const style = { color } satisfies CSSProperties;
  if (status === "done") {
    return (
      <span className="inline-flex size-3.5 shrink-0" style={style}>
        <HugeiconsIcon icon={CheckmarkCircle02Icon} size={14} strokeWidth={2} />
      </span>
    );
  }
  if (status === "blocked") {
    return (
      <span className="inline-flex size-3.5 shrink-0" style={style}>
        <HugeiconsIcon icon={Alert02Icon} size={14} strokeWidth={2} />
      </span>
    );
  }
  const filled = status === "in_progress";
  return (
    <span className="inline-flex size-3.5 shrink-0" style={style}>
      <HugeiconsIcon
        icon={HexagonIcon}
        size={14}
        strokeWidth={2}
        className={filled ? "fill-current" : undefined}
      />
    </span>
  );
}

function HealthPulse({ health }: { health?: PmIssue["health"] }) {
  const tone =
    health === "off-track"
      ? "text-rose-600 dark:text-rose-400"
      : health === "at-risk"
        ? "text-amber-600 dark:text-amber-400"
        : "text-emerald-600 dark:text-emerald-400";
  const label = health === "off-track" ? "Off track" : health === "at-risk" ? "At risk" : "On track";
  return (
    <span className={cn("inline-flex size-3.5 shrink-0", tone)} title={label} aria-label={label}>
      <HugeiconsIcon
        icon={health === "on-track" || !health ? Pulse01Icon : Activity03Icon}
        size={14}
        strokeWidth={2}
      />
    </span>
  );
}

export function IssueBlockCard({ issue }: { issue: PmIssue }) {
  const person = TEAM_BY_ID.get(issue.assignee);
  const glyph = GLYPH[issue.id] ?? { icon: DiamondIcon, token: "var(--chart-1)" };
  const blurb = BLURB[issue.id];
  const showProgress = issue.progress > 0 && issue.progress < 100 && Boolean(issue.lane);

  return (
    <div className="flex flex-col gap-2 p-2.5">
      <div className="flex items-start gap-2">
        <span
          className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-[5px]"
          style={{
            color: glyph.token,
            backgroundColor: `color-mix(in oklch, ${glyph.token} 18%, transparent)`,
          }}
          aria-hidden
        >
          <HugeiconsIcon icon={glyph.icon} size={13} strokeWidth={2} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium leading-snug text-foreground">{issue.title}</p>
          {blurb ? (
            <p className="mt-0.5 line-clamp-1 text-xs leading-snug text-muted-foreground">{blurb}</p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-1.5 pt-0.5">
          <HealthPulse health={issue.health} />
          {person ? (
            <Avatar className="size-5">
              <AvatarFallback
                className="text-[0.625rem] text-white"
                style={{ backgroundColor: person.color }}
              >
                {initials(person.name)}
              </AvatarFallback>
            </Avatar>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 pl-8 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1 tabular-nums">
          <HugeiconsIcon icon={Calendar03Icon} size={12} strokeWidth={2} className="opacity-70" />
          {formatBlockDate(issue)}
        </span>
        {showProgress ? (
          <span className="inline-flex min-w-0 items-center gap-1">
            <HugeiconsIcon
              icon={DiamondIcon}
              size={11}
              strokeWidth={2}
              className="shrink-0 text-amber-600 dark:text-amber-400"
            />
            <span className="truncate">{issue.lane}</span>
            <span className="tabular-nums opacity-80">· {issue.progress}%</span>
          </span>
        ) : null}
      </div>
    </div>
  );
}
