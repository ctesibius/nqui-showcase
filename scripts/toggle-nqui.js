#!/usr/bin/env node
/**
 * Toggle between LOCAL (link:../nqui) and PUBLISHED @nqlib/nqui.
 *
 * Unlike nqgrid/nqgantt (pure vite aliases to sibling src), nqui's styles
 * pipeline (`@nqlib/nqui/styles` + tailwind @source over dist) requires built
 * output, so local mode symlinks the sibling repo via a pnpm `link:` dep and
 * builds `../nqui/dist`. Rebuilds in ../nqui propagate through the symlink.
 *
 *   USE_LOCAL_NQUI=true  node scripts/toggle-nqui.js   # local ../nqui
 *   USE_LOCAL_NQUI=false node scripts/toggle-nqui.js   # published npm
 *   node scripts/toggle-nqui.js --check                # status only
 *   SKIP_BUILD=true      skip `pnpm build:lib` in ../nqui when dist exists
 */
import { existsSync, readFileSync, realpathSync, writeFileSync } from "node:fs"
import { execSync } from "node:child_process"
import { dirname, isAbsolute, join, relative, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, "..")
const pkgPath = join(root, "package.json")
const installedDir = join(root, "node_modules", "@nqlib", "nqui")

// --- CUSTOMIZE ---
const PUBLISHED_VERSION = "^0.7.3"
// --- END CUSTOMIZE ---

const nquiDir = resolve(process.env.NQUI_DIR ?? join(root, "..", "nqui"))
const useLocal = process.env.USE_LOCAL_NQUI === "true"
const skipBuild = process.env.SKIP_BUILD === "true"
const checkOnly = process.argv.includes("--check") || process.argv.includes("--status")

const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"))
const declared = pkg.dependencies["@nqlib/nqui"] ?? "(not declared)"

function installedVersion() {
  try {
    return JSON.parse(readFileSync(join(installedDir, "package.json"), "utf-8")).version
  } catch {
    return "not installed"
  }
}

/**
 * pnpm ALWAYS symlinks packages into node_modules/.pnpm (even registry
 * installs), so "is it a symlink" can't tell dev-linked from published —
 * only the resolved realpath can. A naive string-prefix check is also unsafe
 * here (e.g. ".../nqui-showcase" starts with ".../nqui"); compare via
 * path.relative instead.
 *
 * NB: a `link:` dep resolves the installed dir to EXACTLY the sibling repo, so
 * relative() returns "" — that is the normal linked state, not a miss. Treating
 * "" as "not linked" made --check cry DRIFTED on a perfectly good link.
 */
function resolvesInsideSiblingRepo() {
  try {
    const installed = realpathSync(installedDir)
    const sibling = realpathSync(nquiDir)
    const rel = relative(sibling, installed)
    if (rel === "") return true // installed *is* the sibling repo
    return !rel.startsWith("..") && !isAbsolute(rel)
  } catch {
    return false
  }
}

function isLinked() {
  return declared.startsWith("link:") || resolvesInsideSiblingRepo()
}

/**
 * pnpm can silently re-resolve `link:` to the published store copy (e.g. a
 * stale lockfile after another `pnpm add`). Detect drift by checking whether
 * the resolved package still lives inside the sibling repo — the declared
 * spec alone lies.
 */
function linkDrifted() {
  return !resolvesInsideSiblingRepo()
}

if (checkOnly) {
  const drifted = declared.startsWith("link:") && linkDrifted()
  console.log("\nnqui source (nqui-showcase):")
  console.log(
    "   Active source:    ",
    drifted
      ? `⚠ DRIFTED — package.json says link but node_modules is ${installedVersion()} from the store. Run: pnpm update @nqlib/nqui`
      : isLinked()
        ? `LOCAL (link → ${nquiDir})`
        : "PUBLISHED (npm)",
  )
  console.log("   package.json dep: ", declared)
  console.log("   installed version:", installedVersion())
  console.log("   local repo:       ", existsSync(nquiDir) ? nquiDir : "not found")
  console.log("   local dist built: ", existsSync(join(nquiDir, "dist", "styles.css")) ? "yes" : "no — run pnpm build:lib in ../nqui")
  console.log("\n   • Local:     USE_LOCAL_NQUI=true node scripts/toggle-nqui.js")
  console.log("   • Published: USE_LOCAL_NQUI=false node scripts/toggle-nqui.js\n")
  process.exit(drifted ? 1 : 0)
}

console.log("\nToggling nqui source...")
console.log("   NQUI_DIR:      ", nquiDir)
console.log("   USE_LOCAL_NQUI:", useLocal, "\n")

if (useLocal) {
  if (!existsSync(join(nquiDir, "package.json"))) {
    console.error("Error: nqui repo not found at", nquiDir, "— set NQUI_DIR.")
    process.exit(1)
  }

  if (skipBuild && existsSync(join(nquiDir, "dist", "styles.css"))) {
    console.log("Skipping build (SKIP_BUILD=true and dist present)")
  } else {
    console.log("Building nqui library (pnpm build:lib in ../nqui)...")
    execSync("pnpm build:lib", { cwd: nquiDir, stdio: "inherit" })
  }

  const linkSpec = `link:${relative(root, nquiDir) || "."}`
  if (declared !== linkSpec) {
    pkg.dependencies["@nqlib/nqui"] = linkSpec
    writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n")
    console.log(`Updated package.json → "@nqlib/nqui": "${linkSpec}"`)
    execSync("pnpm install", { cwd: root, stdio: "inherit" })
  }
  if (linkDrifted()) {
    console.log("Link drifted to the store copy — re-resolving (pnpm update @nqlib/nqui)...")
    execSync("pnpm update @nqlib/nqui", { cwd: root, stdio: "inherit" })
  }

  const version = JSON.parse(readFileSync(join(nquiDir, "package.json"), "utf-8")).version
  console.log(`\nSwitched to LOCAL nqui ${version} (${nquiDir})`)
  console.log("Restart vite after nqui rebuilds: rm -rf node_modules/.vite && pnpm dev\n")
} else {
  if (declared !== PUBLISHED_VERSION) {
    pkg.dependencies["@nqlib/nqui"] = PUBLISHED_VERSION
    writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n")
    console.log(`Updated package.json → "@nqlib/nqui": "${PUBLISHED_VERSION}"`)
    execSync("pnpm install", { cwd: root, stdio: "inherit" })
  } else {
    console.log("Already on published version", PUBLISHED_VERSION)
  }
  console.log(`\nSwitched to PUBLISHED nqui ${installedVersion()}\n`)
}
