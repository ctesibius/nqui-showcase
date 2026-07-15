#!/usr/bin/env node
/**
 * Report how nqui-showcase is currently resolving @nqlib/nqchart.
 *
 * Unlike nqgrid/nqgantt (raw sibling `src` aliases), nqchart ships no single
 * `src` barrel — its source lives under `registry/` and needs a build. So
 * local mode aliases `@nqlib/nqchart` (+ every per-chart subpath) at the
 * sibling BUILT output `../becocharts/dist` (see vite.config.ts). Rebuild
 * becocharts (`pnpm build:lib` there, or `pnpm nqchart:build` here) after any
 * source change — the showcase reads dist, not src.
 *
 *   USE_LOCAL_NQCHART=true  pnpm dev   # local ../becocharts/dist
 *   node scripts/toggle-nqchart.js --check
 *   pnpm nqchart:status
 */
import { existsSync, readFileSync, statSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, "..")
const pkgPath = join(root, "package.json")
const installed = join(root, "node_modules", "@nqlib", "nqchart", "package.json")
const beco = resolve(process.env.NQCHART_DIR ?? join(root, "..", "becocharts"))
const dist = join(beco, "dist")
const distEntry = join(dist, "index.mjs")

const useLocal = process.env.USE_LOCAL_NQCHART === "true"
const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"))
const declared = pkg.dependencies["@nqlib/nqchart"] ?? "(not declared)"

function version(pkgJson) {
  try {
    return JSON.parse(readFileSync(pkgJson, "utf-8")).version
  } catch {
    return "unknown"
  }
}

const distOk = existsSync(distEntry)
const localVersion = existsSync(join(beco, "package.json")) ? version(join(beco, "package.json")) : "not found"
const builtAt = distOk ? statSync(distEntry).mtime.toISOString().replace("T", " ").slice(0, 16) : "—"
const source = useLocal && distOk ? `LOCAL (vite alias → ${dist})` : "PUBLISHED (node_modules)"

console.log("\nnqchart source (nqui-showcase):")
console.log("   Active source:     ", source)
console.log("   USE_LOCAL_NQCHART: ", useLocal ? "true" : "false (default)")
console.log("   package.json dep:  ", declared)
console.log("   installed version: ", existsSync(installed) ? version(installed) : "not installed")
console.log("   local becocharts:  ", localVersion === "not found" ? "not found — falls back to published" : `${beco} (v${localVersion})`)
console.log("   local dist built:  ", distOk ? `yes — ${builtAt}` : "NO — run pnpm nqchart:build (dist/index.mjs missing)")
console.log("\n   • Test the fix locally:  pnpm dev:local:charts   (rebuilds becocharts, then local nqchart)")
console.log("   • Full local stack:      pnpm dev:local")
console.log("   • Published / deploy:    pnpm dev | pnpm build")
console.log("\n   NOTE: dist is a BUILD of becocharts source — rebuild it (pnpm nqchart:build)")
console.log("   after editing ../becocharts, or the showcase keeps the old charts.\n")
