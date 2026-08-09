/**
 * @deprecated Import from `@/lib/pm` — thin re-export for Timeline lab / RoadmapGantt.
 */
export {
  CAMPAIGN_ISSUES,
  CAMPAIGN_TASKS,
  CAMPAIGN_SCHEDULE,
  CAMPAIGN_STATUSES,
  CAMPAIGN_BOARD_ORDER,
  CAMPAIGN_LANES,
  CAMPAIGN_LANE_BY_ID,
  CAMPAIGN_HEALTH_BY_ID,
  CAMPAIGN_CRITICAL_IDS,
  cloneCampaignIssues,
  groupCampaignByLane,
  type CampaignLane,
  type CampaignHealth,
} from "@/lib/pm/fixtures/campaign-fy26";

/** Legacy export name used by older schedule shape consumers. */
export { CAMPAIGN_SCHEDULE as CAMPAIGN_SCHEDULE_OPTIONS } from "@/lib/pm/fixtures/campaign-fy26";
