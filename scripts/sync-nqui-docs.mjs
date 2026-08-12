#!/usr/bin/env node
/**
 * Sync app-builder Markdown from docs/nqui/ into Fumadocs content/docs/nqui/.
 *
 * - Converts Obsidian [[wikilinks]] → /docs/nqui/... markdown links
 * - Adds frontmatter from the leading H1
 * - Preserves hand-authored installation / changelog / CLI / CSS / imports / components / concepts
 *
 * Usage: pnpm docs:sync:nqui
 */
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const srcRoot = path.join(root, "docs/nqui");
const destRoot = path.join(root, "content/docs/nqui");

/** Pages authored only under content/docs (not in docs/nqui/). */
const PRESERVE = new Set([
  "installation.mdx",
  "changelog.mdx",
  "concepts.mdx",
  "components.mdx",
  "cli.mdx",
  "css.mdx",
  "imports.mdx",
]);

/** Sidebar order after the hub + developer stubs. */
const GUIDE_PAGES = [
  "getting-started",
  "philosophy",
  // Working the UI
  "actions-and-selection",
  "forms-and-fields",
  "layout-and-surfaces",
  "overlays",
  "feedback-and-states",
  "theming-and-tokens",
  "icons-and-styling",
  // Practice + reference
  "practice-in-catalog",
  "adoption-playbook",
  "glossary",
  "cheatsheet",
];

const TITLE_BY_SLUG = {
  index: "nqui",
  "getting-started": "Getting started",
  philosophy: "Design philosophy",
  "actions-and-selection": "Actions and selection",
  "forms-and-fields": "Forms and fields",
  "layout-and-surfaces": "Layout and surfaces",
  overlays: "Overlays",
  "feedback-and-states": "Feedback and states",
  "theming-and-tokens": "Theming and tokens",
  "icons-and-styling": "Icons and styling",
  "practice-in-catalog": "Practice in catalog",
  "adoption-playbook": "Adoption playbook",
  glossary: "Glossary",
  cheatsheet: "Cheatsheet",
};

if (!existsSync(srcRoot)) {
  console.error(`[docs:sync:nqui] Missing source at ${srcRoot}`);
  process.exit(1);
}

mkdirSync(destRoot, { recursive: true });

function slugTitle(slug) {
  return TITLE_BY_SLUG[slug] ?? slug.replace(/-/g, " ");
}

/** [[target]] or [[target|label]] → markdown link under /docs/nqui (skip inline code). */
function rewriteWikilinks(text) {
  return text.replace(
    /(`[^`]*`)|\[\[([^\]|#]+)(?:#[^\]|]+)?(?:\|([^\]]+))?\]\]/g,
    (m, code, target, label) => {
      if (code) return code;
      const slug = String(target).trim();
      const href = slug === "index" ? "/docs/nqui" : `/docs/nqui/${slug}`;
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
      ? "Component kit, composition guide, and adoption playbook for @nqlib/nqui."
      : (intention ?? `nqui — ${title}`).slice(0, 160).trim();

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
    console.warn(`[docs:sync:nqui] skip reserved name collision: ${destName}`);
    continue;
  }
  const raw = readFileSync(path.join(srcRoot, name), "utf8");
  writeFileSync(path.join(destRoot, destName), toMdx(raw, slug), "utf8");
  count += 1;
}

const meta = {
  title: "nqui",
  pages: [
    "index",
    "installation",
    "changelog",
    "concepts",
    ...GUIDE_PAGES,
    "components",
    "cli",
    "css",
    "imports",
  ],
};
writeFileSync(path.join(destRoot, "meta.json"), `${JSON.stringify(meta, null, 2)}\n`, "utf8");

const expected = new Set([
  ...GUIDE_PAGES.map((slug) => `${slug}.mdx`),
  "index.mdx",
  ...PRESERVE,
  "meta.json",
]);
for (const file of readdirSync(destRoot)) {
  if (expected.has(file)) continue;
  rmSync(path.join(destRoot, file));
  console.info(`[docs:sync:nqui] Pruned stale page ${file}`);
}

console.info(
  `[docs:sync:nqui] Wrote ${count} pages + meta.json → ${path.relative(root, destRoot)}`,
);
