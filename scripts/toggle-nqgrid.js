#!/usr/bin/env node
/**
 * Report how nqui-showcase is currently resolving @nqlib/nqgrid.
 *
 * The showcase consumes the PUBLISHED `@nqlib/nqgrid` for normal dev/build.
 * For engine iteration, run `USE_LOCAL_NQGRID=true pnpm dev` (or `pnpm dev:local`)
 * to alias `@nqlib/nqgrid` → the sibling `../nqgrid/src` (see vite.config.ts).
 * This script just prints which source is active; there is no link/unlink to do
 * because the toggle is a pure vite alias driven by an env var.
 *
 *   node scripts/toggle-nqgrid.js --check
 */
import { existsSync, readFileSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, "..")
const pkgPath = join(root, "package.json")
const installed = join(root, "node_modules", "@nqlib", "nqgrid", "package.json")
const localSrc = resolve(process.env.NQGRID_DIR ?? join(root, "../nqgrid"), "src", "index.ts")

const useLocal = process.env.USE_LOCAL_NQGRID === "true"
const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"))
const declared = pkg.dependencies["@nqlib/nqgrid"] ?? "(not declared)"

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

console.log("\nnqgrid source (nqui-showcase):")
console.log("   Active source:    ", source)
console.log("   USE_LOCAL_NQGRID: ", useLocal ? "true" : "false (default)")
console.log("   package.json dep: ", declared)
console.log("   installed version:", installedVersion)
console.log("   local src present:", localOk ? localSrc : "no — falls back to published")
console.log("\n   • Engine iteration:  pnpm dev:local   (USE_LOCAL_NQGRID=true)")
console.log("   • Published / deploy: pnpm dev | pnpm build\n")
