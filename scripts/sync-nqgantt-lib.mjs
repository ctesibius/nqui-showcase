#!/usr/bin/env node
/**
 * Copy bar UI sources from sibling nqgantt into src/nqgantt/lib/ (reference copies).
 * Usage: pnpm nqgantt:sync-lib
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
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

// Rewrite package-relative imports to showcase lib filenames.
const rewrite = {
  '"./gantt-critical-path"': '"./critical-path"',
  '"./gantt-bar-progress"': '"./bar-progress"',
  '"./gantt-summary-bracket"': '"./summary-bracket"',
}
for (const [, to] of files) {
  const dest = path.join(libDir, to)
  if (!existsSync(dest)) continue
  let text = readFileSync(dest, "utf8")
  let next = text
  for (const [a, b] of Object.entries(rewrite)) next = next.replaceAll(a, b)
  if (to === "feature-bar.tsx" && !next.includes("Showcase-owned copy")) {
    next =
      "/**\n" +
      " * Showcase-owned copy of @nqlib/nqgantt GanttFeatureBarShell / ProjectSummaryBar.\n" +
      " * Not imported at runtime — see README.md. Sync: pnpm nqgantt:sync-lib\n" +
      " */\n" +
      next
  }
  if (next !== text) writeFileSync(dest, next)
}

console.info("[nqgantt:sync-lib] Import paths rewritten to ./bar-progress, ./summary-bracket, ./critical-path.")
