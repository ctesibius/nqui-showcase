#!/usr/bin/env node
/**
 * Report how nqui-showcase is currently resolving @nqlib/nqgantt and its
 * @nqlib/nqgantt-engine dependency.
 *
 * The showcase consumes the PUBLISHED packages for normal dev/build. For
 * engine/UI iteration — or to test an unpublished nqgantt bump before
 * `npm publish` — run `USE_LOCAL_NQGANTT=true pnpm dev` (or `pnpm dev:local`)
 * to alias both `@nqlib/nqgantt` and `@nqlib/nqgantt-engine` → the sibling
 * `../nqgantt/packages/{nqgantt,nqgantt-engine}/src` (see vite.config.ts).
 * This script prints which source is active for each.
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
const workspacePackages = resolve(process.env.NQGANTT_DIR ?? join(root, "../nqgantt/packages"))

const useLocal = process.env.USE_LOCAL_NQGANTT === "true"
const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"))

function report(label, pkgName, srcRelPath) {
  const installedPkg = join(root, "node_modules", "@nqlib", pkgName, "package.json")
  const localSrc = join(workspacePackages, pkgName, srcRelPath)
  const declared = pkg.dependencies[`@nqlib/${pkgName}`] ?? "(not declared)"

  let installedVersion = "not installed"
  if (existsSync(installedPkg)) {
    try {
      installedVersion = JSON.parse(readFileSync(installedPkg, "utf-8")).version
    } catch {
      installedVersion = "unknown"
    }
  }

  const localOk = existsSync(localSrc)
  const source = useLocal && localOk ? `LOCAL (vite alias → ${localSrc})` : "PUBLISHED (node_modules)"

  console.log(`\n${label} (nqui-showcase):`)
  console.log("   Active source:     ", source)
  console.log("   package.json dep:  ", declared)
  console.log("   installed version: ", installedVersion)
  console.log("   local src present: ", localOk ? localSrc : "no — falls back to published")
}

report("@nqlib/nqgantt", "nqgantt", "src/index.ts")
report("@nqlib/nqgantt-engine", "nqgantt-engine", "src/index.ts")

console.log("\n   USE_LOCAL_NQGANTT: ", useLocal ? "true" : "false (default)")
console.log("   • Engine/UI iteration: pnpm dev:local   (USE_LOCAL_NQGRID + USE_LOCAL_NQGANTT + USE_LOCAL_NQCHART)")
console.log("   • Published / deploy:    pnpm dev | pnpm build\n")
