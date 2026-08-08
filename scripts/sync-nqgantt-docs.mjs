#!/usr/bin/env node
/**
 * Sync PM / PMO Markdown from docs/nqgantt/ into Fumadocs content/docs/nqgantt/.
 *
 * - Converts Obsidian [[wikilinks]] → /docs/nqgantt/... markdown links
 * - Adds frontmatter from the leading H1
 * - Preserves hand-authored installation / changelog / concepts
 *
 * Usage: pnpm docs:sync:nqgantt
 */
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const srcRoot = path.join(root, "docs/nqgantt");
const destRoot = path.join(root, "content/docs/nqgantt");

/** Pages authored only under content/docs (not in docs/nqgantt/). */
const PRESERVE = new Set(["installation.mdx", "changelog.mdx", "concepts.mdx"]);

/** Sidebar order after the hub + developer stubs. */
const PM_PAGES = [
  "getting-started",
  "philosophy",
  "bars-and-timeline",
  "dependencies",
  "dependency-types",
  "auto-schedule",
  "monday-com-mapping",
  "critical-path",
  "practice-in-gantt-lab",
  "pmo-playbook",
  "glossary",
  "cheatsheet",
];

const TITLE_BY_SLUG = {
  index: "nqgantt",
  "getting-started": "Getting started",
  philosophy: "Design philosophy",
  "bars-and-timeline": "Bars and timeline",
  dependencies: "Dependencies",
  "dependency-types": "Dependency types",
  "auto-schedule": "Auto-schedule",
  "monday-com-mapping": "Monday.com mapping",
  "critical-path": "Critical path",
  "practice-in-gantt-lab": "Practice in Gantt lab",
  "pmo-playbook": "PMO playbook",
  glossary: "Glossary",
  cheatsheet: "Cheatsheet",
};

if (!existsSync(srcRoot)) {
  console.error(`[docs:sync:nqgantt] Missing source at ${srcRoot}`);
  process.exit(1);
}

mkdirSync(destRoot, { recursive: true });

function slugTitle(slug) {
  return TITLE_BY_SLUG[slug] ?? slug.replace(/-/g, " ");
}

/** [[target]] or [[target|label]] → markdown link under /docs/nqgantt (skip inline code). */
function rewriteWikilinks(text) {
  return text.replace(
    /(`[^`]*`)|\[\[([^\]|#]+)(?:#[^\]|]+)?(?:\|([^\]]+))?\]\]/g,
    (m, code, target, label) => {
      if (code) return code;
      const slug = String(target).trim();
      const href =
        slug === "index" ? "/docs/nqgantt" : `/docs/nqgantt/${slug}`;
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
      ? "Schedule engine, Gantt UI, and PM / PMO guide for @nqlib/nqgantt."
      : (intention ?? `nqgantt — ${title}`).slice(0, 160).trim();

  return `---
title: ${yamlQuote(title)}
description: ${yamlQuote(description)}
---

${body.trim()}\n`;
}

const mdFiles = readdirSync(srcRoot).filter((n) => n.endsWith(".md"));
let count = 0;
for (const name of mdFiles) {
  const slug = name.replace(/\.md$/, "");
  const destName = `${slug}.mdx`;
  if (PRESERVE.has(destName)) {
    console.warn(`[docs:sync:nqgantt] skip reserved name collision: ${destName}`);
    continue;
  }
  const raw = readFileSync(path.join(srcRoot, name), "utf8");
  writeFileSync(path.join(destRoot, destName), toMdx(raw, slug), "utf8");
  count += 1;
}

const meta = {
  title: "nqgantt",
  pages: [
    "index",
    "installation",
    "changelog",
    "concepts",
    ...PM_PAGES,
  ],
};
writeFileSync(path.join(destRoot, "meta.json"), `${JSON.stringify(meta, null, 2)}\n`, "utf8");

console.info(
  `[docs:sync:nqgantt] Wrote ${count} pages + meta.json → ${path.relative(root, destRoot)}`,
);
