#!/usr/bin/env node
/**
 * Report how nqui-showcase is currently resolving @nqlib/nqgantt.
 *
 * The showcase consumes the PUBLISHED `@nqlib/nqgantt` for normal dev/build.
 * For engine/UI iteration, run `USE_LOCAL_NQGANTT=true pnpm dev` (or `pnpm dev:local`)
 * to alias `@nqlib/nqgantt` → the sibling `../nqgantt/packages/nqgantt/src`
 * (see vite.config.ts). This script prints which source is active.
 *
 *   node scripts/toggle-nqgantt.js --check
 *   pnpm nqgantt:status
 */
import { existsSync, readFileSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, "..")
const pkgPath = join(root, "package.json")
const installed = join(root, "node_modules", "@nqlib", "nqgantt", "package.json")
const localSrc = resolve(
  process.env.NQGANTT_DIR ?? join(root, "../nqgantt/packages/nqgantt"),
  "src",
  "index.ts",
)

const useLocal = process.env.USE_LOCAL_NQGANTT === "true"
const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"))
const declared = pkg.dependencies["@nqlib/nqgantt"] ?? "(not declared)"

let installedVersion = "not installed"
if (existsSync(installed)) {
  try {
    installedVersion = JSON.parse(readFileSync(installed, "utf-8")).version
  } catch {
    installedVersion = "unknown"
  }
}

const localOk = existsSync(localSrc)
const source = useLocal && localOk ? `LOCAL (vite alias → ${localSrc})` : "PUBLISHED (node_modules)"

console.log("\nnqgantt source (nqui-showcase):")
console.log("   Active source:     ", source)
console.log("   USE_LOCAL_NQGANTT: ", useLocal ? "true" : "false (default)")
console.log("   package.json dep:  ", declared)
console.log("   installed version: ", installedVersion)
console.log("   local src present: ", localOk ? localSrc : "no — falls back to published")
console.log("\n   • Engine/UI iteration: pnpm dev:local   (USE_LOCAL_NQGRID + USE_LOCAL_NQGANTT)")
console.log("   • Published / deploy:    pnpm dev | pnpm build\n")
