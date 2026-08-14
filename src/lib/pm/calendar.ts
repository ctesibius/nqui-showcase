/**
 * Showcase schedule helpers — local civil dates only.
 *
 * ISO `YYYY-MM-DD` parsed as UTC midnight slips a day west of Greenwich.
 * Fixtures stay authored against a seed "today"; `shiftToNow` maps that
 * calendar onto the viewer's local date so Gantt labs always show past,
 * in-progress, and future bars.
 */

export function localToday(now = new Date()): Date {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0);
}

export function parseLocalISO(iso: string): Date {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day, 12, 0, 0);
}

export function formatLocalISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0);
  next.setDate(next.getDate() + days);
  return next;
}

export function daysBetween(from: Date, to: Date): number {
  const a = localToday(from);
  const b = localToday(to);
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

export function isoToday(now = new Date()): string {
  return formatLocalISO(localToday(now));
}

/**
 * Shift a seed-calendar ISO date so `seedToday` lands on `today`.
 * Preserves inclusive durations, lags, and milestone identity (start === end).
 */
export function shiftToNow(
  iso: string,
  { seedToday, today = localToday() }: { seedToday: string; today?: Date },
): string {
  const delta = daysBetween(parseLocalISO(seedToday), today);
  return formatLocalISO(addDays(parseLocalISO(iso), delta));
}
