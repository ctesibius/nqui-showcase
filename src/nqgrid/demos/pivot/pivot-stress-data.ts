/**
 * Deterministic pivot stress rows for `/grid-lab` Pivot surface.
 * Mirrors nqgrid `bench/dataset.ts`: region → department → line × month.
 */
import type { PivotDataRow, PivotSpec } from "@nqlib/nqgrid/core"

export const PIVOT_STRESS_SIZES = [1_000, 10_000, 29_000] as const
export type PivotStressSize = (typeof PIVOT_STRESS_SIZES)[number]

const MONTHS = ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"] as const
const REGIONS = ["North", "South", "East", "West", "Central", "Online"] as const
const DEPARTMENTS = ["Footwear", "Apparel", "Camp", "Packs", "Climb", "Water", "Bike", "Snow"] as const
const LINES_PER_DEPARTMENT = 6

function lcg(seed: number): () => number {
  let s = seed >>> 0
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0
    return s / 0x100000000
  }
}

const cache = new Map<PivotStressSize, PivotDataRow[]>()

export function generatePivotStressRows(count: PivotStressSize, seed = 11): PivotDataRow[] {
  const hit = cache.get(count)
  if (hit) return hit

  const rand = lcg(seed)
  const rows: PivotDataRow[] = new Array(count)
  for (let i = 0; i < count; i++) {
    const d = Math.floor(rand() * DEPARTMENTS.length)
    const actual = Math.round(1000 + rand() * 50_000)
    rows[i] = {
      region: REGIONS[Math.floor(rand() * REGIONS.length)],
      department: DEPARTMENTS[d],
      line: `${DEPARTMENTS[d]} ${1 + Math.floor(rand() * LINES_PER_DEPARTMENT)}`,
      month: MONTHS[i % 12],
      actual,
      plan: Math.round(actual * (0.9 + rand() * 0.2)),
      units: 1 + Math.floor(rand() * 40),
    }
  }
  cache.set(count, rows)
  return rows
}

const usd = { style: "currency" as const, currency: "USD", compact: true }

/** 3 row dims, month columns, 3 measures — matches the package bench shape. */
export const pivotStressSpec: PivotSpec = {
  version: 1,
  id: "showcase-pivot-stress",
  title: "Pivot stress",
  rows: [{ field: "region" }, { field: "department" }, { field: "line" }],
  columns: { field: "month", order: [...MONTHS], keepEmpty: true },
  measures: [
    { id: "actual", field: "actual", format: usd },
    { id: "plan", field: "plan", format: usd },
    { id: "units", field: "units", aggregate: "avg" },
  ],
  values: ["actual", "plan", "units"],
  totals: { rowTotal: true },
  heat: { measure: "actual", scope: "group" },
  headerCharts: { measure: "actual", breakdown: true },
  kpis: [
    { id: "actual", measure: "actual", compareTo: "plan" },
  ],
  kpiLevels: [0, 1],
  facets: ["region", "department"],
}
