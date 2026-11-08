import { GanttRoot } from "@nqlib/nqgantt/ui";
import { CAMPAIGN_ISSUES, CAMPAIGN_SCHEDULE, groupCampaignByLane } from "@/lib/pm";
import { toGantt } from "@/lib/pm/adapters";

/*
 * The landing's schedule scene — the real nqgantt engine on the same FY26
 * campaign feed as /blocks → Campaign timeline, cut down to fit the living
 * window: body slot only (no toolbar), a one-column task list, compact rows,
 * critical path on. Lazy-loaded the first time the scene shows, like the
 * chart and pivot scenes, so it never touches the landing's first paint.
 *
 * The campaign's dates are shifted relative to today, and the gantt opens
 * scrolled to today. A seven-row window would otherwise lead with tasks that
 * finished months ago (bars off-screen), so it shows what's in flight: work
 * that ended in the last few weeks or is still to come. The full campaign is
 * one click away on /blocks.
 */

const COLUMNS = ["tasks"];
const RECENT_DAYS = 42;

/** Built once when this lazy module first loads (the scene's first showing). */
function inFlight() {
  const full = toGantt(CAMPAIGN_ISSUES, CAMPAIGN_SCHEDULE);
  const cutoff = Date.now() - RECENT_DAYS * 86_400_000;
  const features = full.features.filter((f) => f.endAt.getTime() >= cutoff);
  const ids = new Set(features.map((f) => f.id));
  const dependencies = full.dependencies.filter((d) => ids.has(d.fromId) && ids.has(d.toId));
  return { ...full, features, dependencies };
}

const DATA = inFlight();
const GROUPS = groupCampaignByLane(DATA.features);

export function MiniGantt() {
  return (
    <GanttRoot
      className="flex h-full min-h-0 flex-col"
      data={DATA}
      groups={GROUPS}
      density="compact"
      defaultRange="monthly"
      defaultZoom={50}
      showCriticalPath
      visibleColumnIds={COLUMNS}
      sidebarWidth={132}
    >
      <GanttRoot.Body className="min-h-0 flex-1" />
    </GanttRoot>
  );
}
