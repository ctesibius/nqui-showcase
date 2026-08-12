#!/usr/bin/env node
/**
 * Sync NQChart docs into content/docs/nqchart/:
 *
 * 1. Copy becocharts `src/content/docs/` (API reference).
 * 2. Overlay guide MDX from `docs/nqchart/` (nqgantt-style wikilink rewrite).
 * 3. Merge meta.json so the sidebar is hub + guides + primitives.
 *
 * Usage: pnpm docs:sync:nqchart
 * Env:   NQCHART_DIR — override sibling path (default ../becocharts)
 */
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const apiRoot = path.resolve(
  process.env.NQCHART_DIR ?? path.join(root, "../becocharts"),
  "src/content/docs",
);
const vaultRoot = path.join(root, "docs/nqchart");
const destRoot = path.join(root, "content/docs/nqchart");

/** Guide slugs authored under docs/nqchart/ (index overlays the API dump). */
const GUIDE_PAGES = ["getting-started", "philosophy", "interaction", "cheatsheet"];

const TITLE_BY_SLUG = {
  index: "nqchart",
  "getting-started": "Getting started",
  philosophy: "Design philosophy",
  interaction: "Interaction",
  cheatsheet: "Cheatsheet",
};

if (!existsSync(apiRoot)) {
  console.error(`[docs:sync:nqchart] Missing API source at ${apiRoot}`);
  process.exit(1);
}
if (!existsSync(vaultRoot)) {
  console.error(`[docs:sync:nqchart] Missing vault at ${vaultRoot}`);
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

function slugTitle(slug) {
  return TITLE_BY_SLUG[slug] ?? slug.replace(/-/g, " ");
}

/** [[target]] or [[target|label]] → markdown link under /docs/nqchart (skip inline code). */
function rewriteWikilinks(text) {
  return text.replace(
    /(`[^`]*`)|\[\[([^\]|#]+)(?:#[^\]|]+)?(?:\|([^\]]+))?\]\]/g,
    (m, code, target, label) => {
      if (code) return code;
      const slug = String(target).trim();
      const href = slug === "index" ? "/docs/nqchart" : `/docs/nqchart/${slug}`;
      const textLabel = (label ?? slugTitle(slug)).trim();
      return `[${textLabel}](${href})`;
    },
  );
}

function yamlQuote(value) {
  return JSON.stringify(String(value));
}

function toMdx(raw, slug) {
  const trimmed = raw.replace(/^\uFEFF/, "");
  const h1 = trimmed.match(/^#\s+(.+)\s*$/m);
  const title = TITLE_BY_SLUG[slug] ?? (h1 ? h1[1].trim() : slug);
  let body = trimmed;
  if (h1) {
    body = trimmed.replace(h1[0], "").replace(/^\s*\n/, "");
  }
  body = rewriteWikilinks(body);

  const intention = body
    .split("\n")
    .map((l) => l.trim())
    .find((l) => l.startsWith("**Intention:**"))
    ?.replace(/^\*\*Intention:\*\*\s*/, "")
    ?.replace(/\*\*/g, "");

  const description =
    slug === "index"
      ? "Composable ECharts charts for BI dashboards — live lab, interaction, and API reference."
      : (intention ?? `nqchart — ${title}`).slice(0, 160).trim();

  return `---
title: ${yamlQuote(title)}
description: ${yamlQuote(description)}
---

${body.trim()}\n`;
}

// 1. Wipe + copy API MDX from becocharts
if (existsSync(destRoot)) {
  rmSync(destRoot, { recursive: true, force: true });
}
mkdirSync(destRoot, { recursive: true });

const apiFiles = walk(apiRoot).filter((f) => /\.(mdx?|json)$/.test(f));
let apiCount = 0;
for (const file of apiFiles) {
  const rel = path.relative(apiRoot, file);
  const dest = path.join(destRoot, rel);
  mkdirSync(path.dirname(dest), { recursive: true });
  if (file.endsWith(".json")) {
    cpSync(file, dest);
  } else {
    writeFileSync(dest, rewriteLinks(readFileSync(file, "utf8")), "utf8");
  }
  apiCount += 1;
}

// 2. Overlay guide pages from the vault
const mdFiles = readdirSync(vaultRoot).filter((n) => n.endsWith(".md"));
let guideCount = 0;
for (const name of mdFiles) {
  const slug = name.replace(/\.md$/, "");
  const destName = `${slug}.mdx`;
  if (destName === "installation.mdx" || destName === "changelog.mdx") {
    console.warn(`[docs:sync:nqchart] skip reserved name collision: ${destName}`);
    continue;
  }
  const raw = readFileSync(path.join(vaultRoot, name), "utf8");
  writeFileSync(path.join(destRoot, destName), toMdx(raw, slug), "utf8");
  guideCount += 1;
}

// 3. Merge sidebar: hub + install/changelog + guides + remaining API pages
const metaPath = path.join(destRoot, "meta.json");
const copied = existsSync(metaPath)
  ? JSON.parse(readFileSync(metaPath, "utf8"))
  : { pages: [] };
const reserved = new Set(["index", "installation", "changelog", ...GUIDE_PAGES]);
const apiPages = (copied.pages ?? []).filter((p) => !reserved.has(p));
const meta = {
  title: "nqchart",
  pages: [
    "index",
    "installation",
    "changelog",
    ...GUIDE_PAGES,
    ...apiPages,
  ],
};
writeFileSync(metaPath, `${JSON.stringify(meta, null, 2)}\n`, "utf8");

console.info(
  `[docs:sync:nqchart] Copied ${apiCount} API files, overlaid ${guideCount} guides → ${path.relative(root, destRoot)}`,
);
