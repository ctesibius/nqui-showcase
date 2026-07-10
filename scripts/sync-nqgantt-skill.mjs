#!/usr/bin/env node
/**
 * Copy consumer Agent Skill from sibling nqgantt into .cursor/skills/nqgantt/.
 * Preserves showcase-only references/nqui-showcase.md if it already exists.
 *
 * Usage: pnpm nqgantt:sync-skill
 */
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const showcaseRoot = path.resolve(__dirname, "..")
const source = process.env.NQGANTT_SKILL_DIR
  ? path.resolve(process.env.NQGANTT_SKILL_DIR)
  : path.resolve(showcaseRoot, "../nqgantt/skills/consumer/nqgantt")
const dest = path.join(showcaseRoot, ".cursor/skills/nqgantt")
const showcaseRef = path.join(dest, "references/nqui-showcase.md")
const showcaseRefTemplate = path.join(showcaseRoot, "scripts/nqgantt-showcase-skill-addon/nqui-showcase.md")

if (!existsSync(source)) {
  console.error(`[nqgantt:sync-skill] No consumer skill at ${source}`)
  console.error("Set NQGANTT_SKILL_DIR or checkout ../nqgantt next to nqui-showcase.")
  process.exit(1)
}

const preservedShowcaseRef = existsSync(showcaseRef) ? readFileSync(showcaseRef, "utf8") : null

rmSync(dest, { recursive: true, force: true })
mkdirSync(path.join(dest, "references"), { recursive: true })
cpSync(source, dest, { recursive: true })

if (preservedShowcaseRef) {
  writeFileSync(showcaseRef, preservedShowcaseRef)
} else if (existsSync(showcaseRefTemplate)) {
  writeFileSync(showcaseRef, readFileSync(showcaseRefTemplate, "utf8"))
}

const skillPath = path.join(dest, "SKILL.md")
let skill = readFileSync(skillPath, "utf8")
if (!skill.includes("nqui-showcase.md")) {
  skill = skill.replace(
    "## Reference files\n",
    "## Reference files\n\n- [references/nqui-showcase.md](references/nqui-showcase.md) — **this repo** (Path B embed, CSS chrome, deploy rules)\n",
  )
  writeFileSync(skillPath, skill)
}

console.info("[nqgantt:sync-skill] copied consumer skill → .cursor/skills/nqgantt/")
console.info(`  source: ${source}`)
