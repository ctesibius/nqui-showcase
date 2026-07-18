#!/usr/bin/env node
/**
 * Sync NQChart Fumadocs MDX from sibling becocharts into content/docs/nqchart/.
 *
 * Usage: pnpm docs:sync:nqchart
 * Env:   NQCHART_DIR — override sibling path (default ../becocharts)
 */
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const srcRoot = path.resolve(
  process.env.NQCHART_DIR ?? path.join(root, "../becocharts"),
  "src/content/docs",
);
const destRoot = path.join(root, "content/docs/nqchart");

if (!existsSync(srcRoot)) {
  console.error(`[docs:sync:nqchart] Missing source at ${srcRoot}`);
  process.exit(1);
}

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

/** Rewrite absolute docs links to the nested /docs/nqchart prefix. */
function rewriteLinks(text) {
  return text
    .replace(/(href|to)=(["'])\/docs\/(?!nqchart\/)/g, "$1=$2/docs/nqchart/")
    .replace(/\]\(\/docs\/(?!nqchart\/)/g, "](/docs/nqchart/")
    .replace(/https:\/\/nqchart\.vercel\.app\/docs\//g, "/docs/nqchart/");
}

// Wipe previous sync (keep nothing — full replace)
if (existsSync(destRoot)) {
  rmSync(destRoot, { recursive: true, force: true });
}
mkdirSync(destRoot, { recursive: true });

const files = walk(srcRoot).filter((f) => /\.(mdx?|json)$/.test(f));
let count = 0;
for (const file of files) {
  const rel = path.relative(srcRoot, file);
  const dest = path.join(destRoot, rel);
  mkdirSync(path.dirname(dest), { recursive: true });
  if (file.endsWith(".json")) {
    cpSync(file, dest);
  } else {
    const raw = readFileSync(file, "utf8");
    writeFileSync(dest, rewriteLinks(raw), "utf8");
  }
  count += 1;
}

// Ensure folder meta has a title for the page tree
const metaPath = path.join(destRoot, "meta.json");
if (existsSync(metaPath)) {
  const meta = JSON.parse(readFileSync(metaPath, "utf8"));
  if (!meta.title) meta.title = "nqchart";
  // Root meta from becocharts has "root": true — nest under nqchart, not app root
  delete meta.root;
  writeFileSync(metaPath, `${JSON.stringify(meta, null, 2)}\n`, "utf8");
}

console.info(`[docs:sync:nqchart] Copied ${count} files → ${path.relative(root, destRoot)}`);
