/** Mock series for EvilCharts demos on the home page. */

export const throughputBacklogDaily = [
  { day: "D1", throughput: 14, backlog: 62 },
  { day: "D2", throughput: 18, backlog: 58 },
  { day: "D3", throughput: 11, backlog: 64 },
  { day: "D4", throughput: 22, backlog: 51 },
  { day: "D5", throughput: 19, backlog: 47 },
  { day: "D6", throughput: 16, backlog: 52 },
  { day: "D7", throughput: 21, backlog: 44 },
  { day: "D8", throughput: 17, backlog: 41 },
  { day: "D9", throughput: 24, backlog: 36 },
  { day: "D10", throughput: 20, backlog: 33 },
] as const;

/** Longer window for Insights range toggle (mock). */
export const throughputBacklogDaily30 = [
  ...throughputBacklogDaily,
  { day: "D11", throughput: 23, backlog: 30 },
  { day: "D12", throughput: 18, backlog: 34 },
  { day: "D13", throughput: 25, backlog: 28 },
  { day: "D14", throughput: 21, backlog: 26 },
  { day: "D15", throughput: 19, backlog: 24 },
] as const;

export const weeklyMergeOpen = [
  { week: "W09", merged: 28, opened: 22 },
  { week: "W10", merged: 34, opened: 19 },
  { week: "W11", merged: 31, opened: 26 },
  { week: "W12", merged: 42, opened: 18 },
  { week: "W13", merged: 38, opened: 24 },
  { week: "W14", merged: 45, opened: 21 },
] as const;

export const velocityWeekly = [
  { week: "W09", velocity: 112 },
  { week: "W10", velocity: 128 },
  { week: "W11", velocity: 118 },
  { week: "W12", velocity: 142 },
  { week: "W13", velocity: 135 },
  { week: "W14", velocity: 151 },
] as const;

export const workMixHours = [
  { kind: "Features", hours: 128 },
  { kind: "Bugs", hours: 44 },
  { kind: "Chores", hours: 22 },
  { kind: "Spikes", hours: 16 },
] as const;

export const leadMergeShare = [
  { name: "Maya Chen", value: 34 },
  { name: "Jordan Lee", value: 28 },
  { name: "Alex Rivera", value: 22 },
  { name: "Riley Park", value: 18 },
  { name: "Sam Okonkwo", value: 14 },
] as const;
