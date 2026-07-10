#!/usr/bin/env node
/**
 * Copy bar UI sources from sibling nqgantt into src/nqgantt/lib/ (reference copies).
 * Usage: pnpm nqgantt:sync-lib
 */
import { copyFileSync, existsSync, mkdirSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const showcaseRoot = path.resolve(__dirname, "..")
const ganttSrc =
  process.env.NQGANTT_DIR
    ? path.join(process.env.NQGANTT_DIR, "src/components/pm/gantt")
    : path.resolve(showcaseRoot, "../nqgantt/packages/nqgantt/src/components/pm/gantt")
const libDir = path.join(showcaseRoot, "src/nqgantt/lib")

const files = [
  ["gantt-bar-progress.ts", "bar-progress.ts"],
  ["gantt-summary-bracket.ts", "summary-bracket.ts"],
  ["gantt-feature-bar.tsx", "feature-bar.tsx"],
  ["gantt-critical-path.ts", "critical-path.ts"],
]

if (!existsSync(ganttSrc)) {
  console.error(`[nqgantt:sync-lib] No gantt source at ${ganttSrc}`)
  console.error("Set NQGANTT_DIR or checkout ../nqgantt next to nqui-showcase.")
  process.exit(1)
}

mkdirSync(libDir, { recursive: true })

for (const [from, to] of files) {
  const src = path.join(ganttSrc, from)
  const dest = path.join(libDir, to)
  if (!existsSync(src)) {
    console.warn(`[nqgantt:sync-lib] skip missing ${src}`)
    continue
  }
  copyFileSync(src, dest)
  console.log(`[nqgantt:sync-lib] ${to} ← ${from}`)
}

console.info("[nqgantt:sync-lib] Re-apply lib import paths in feature-bar.tsx if needed (./bar-progress, ./summary-bracket, ./critical-path).")
