import { Avatar, AvatarFallback, cn } from "@nqlib/nqui";

/**
 * Overlapping presence avatars shared by every app surface, so collaborators
 * read identically across Sheets, Projects, and the dashboard.
 *
 * People in one stack always get DISTINCT hues (real products never paint every
 * avatar the same color, and a stack with two identical chips reads as a bug).
 * Hues are walked by index from a per-stack starting offset derived from the
 * roster, so the assignment is stable for a given set. The chip is a soft tint
 * mixed against `--card`, so it adapts to light / mid / dark with no overrides.
 */
const HUES = [
  "oklch(0.58 0.13 18)", // rose
  "oklch(0.62 0.12 60)", // amber
  "oklch(0.58 0.11 150)", // green
  "oklch(0.58 0.10 215)", // teal
  "oklch(0.56 0.13 260)", // blue
  "oklch(0.55 0.14 305)", // violet
] as const;

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

function hash(value: string): number {
  let h = 0;
  for (let i = 0; i < value.length; i += 1) h = (h * 31 + value.charCodeAt(i)) >>> 0;
  return h;
}

export interface PresenceStackProps {
  people: readonly string[];
  /** Visible avatars before collapsing into a +N chip. */
  max?: number;
  label?: string;
  className?: string;
}

export function PresenceStack({ people, max = 4, label = "Collaborators", className }: PresenceStackProps) {
  const shown = people.slice(0, max);
  const overflow = people.length - shown.length;
  const offset = hash(people.join("|")) % HUES.length;

  return (
    <div className={cn("flex -space-x-1.5", className)} aria-label={label}>
      {shown.map((name, i) => {
        const hue = HUES[(offset + i) % HUES.length];
        return (
          <Avatar key={name} className="size-6 border-2 border-card" title={name}>
            <AvatarFallback
              className="text-[10px] font-semibold"
              style={{ backgroundColor: `color-mix(in oklch, ${hue} 16%, var(--card))`, color: hue }}
            >
              {initialsOf(name)}
            </AvatarFallback>
          </Avatar>
        );
      })}
      {overflow > 0 ? (
        <Avatar className="size-6 border-2 border-card" title={`${overflow} more`}>
          <AvatarFallback className="bg-muted text-[10px] font-semibold text-muted-foreground">
            +{overflow}
          </AvatarFallback>
        </Avatar>
      ) : null}
    </div>
  );
}
