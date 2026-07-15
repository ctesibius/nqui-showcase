#!/usr/bin/env node
/**
 * Sync the full NQChart example catalog into nqui-showcase.
 *
 * Reads ../becocharts/registry.json, adapts source files to public
 * `@nqlib/nqchart/*` imports, and writes:
 *   - src/nqchart/catalog/adapters/*
 *   - src/nqchart/catalog/manifest.ts
 *
 * Usage:
 *   node scripts/sync-nqchart-catalog.mjs          # regenerate
 *   node scripts/sync-nqchart-catalog.mjs --check  # fail if drift
 */

import { createHash } from "node:crypto";
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
const ROOT = path.resolve(__dirname, "..");
const BECO = process.env.NQCHART_DIR
  ? path.resolve(process.env.NQCHART_DIR)
  : path.resolve(ROOT, "../becocharts");
const OUT_DIR = path.join(ROOT, "src/nqchart/catalog");
const ADAPTERS_DIR = path.join(OUT_DIR, "adapters");
const MANIFEST_PATH = path.join(OUT_DIR, "manifest.ts");
const CHECK = process.argv.includes("--check");

/** Dedicated bg/tooltip demos are replaced by global preview controls. */
const GLOBAL_CONTROL_PREFIXES = ["ex-bg-", "ex-tooltip-"];

const FAMILY_RULES = [
  [/area/, "area"],
  [/bar|histogram|bullet|monospace|hover-trace|grid-bar|isometric/, "bar"],
  [/line/, "line"],
  [/composed|pareto|boxplot|box-plot/, "composed"],
  [/pie/, "pie"],
  [/radar/, "radar"],
  [/radial|gauge/, "radial"],
  [/scatter|bubble/, "scatter"],
  [/funnel/, "funnel"],
  [/waterfall/, "waterfall"],
  [/treemap/, "treemap"],
  [/heatmap/, "heatmap"],
  [/calendar|workload/, "calendar"],
  [/sparkline/, "sparkline"],
  [/legend/, "line"],
];

function inferFamily(name) {
  for (const [re, family] of FAMILY_RULES) {
    if (re.test(name)) return family;
  }
  return "other";
}

function inferCategory(name, family) {
  if (name.startsWith("ex-legend-")) return "legend";
  if (name.includes("loading")) return "loading";
  if (
    name.includes("histogram") ||
    name.includes("pareto") ||
    name.includes("bullet") ||
    name.includes("boxplot") ||
    name.includes("gauge")
  ) {
    return "recipe";
  }
  if (
    name === "monospace-bar-chart" ||
    name === "hover-trace-bar-chart"
  ) {
    // Bar interaction variants (fold/hover) — surface under Variants, not Blocks.
    return "variant";
  }
  if (
    name === "grid-bar-chart" ||
    name === "isometric-bar-chart"
  ) {
    return "block";
  }
  if (name.includes("glowing") || name.includes("gradient")) return "variant";
  return family === "calendar" || family === "heatmap" ? "matrix" : "example";
}

function titleize(name) {
  return name
    .replace(/^ex-/, "")
    .replace(/-chart$/, "")
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function rewriteSource(source, fileName) {
  let out = source
    .replace(/"use client";\s*/g, "")
    .replace(
      /from\s+"@\/registry\/charts\/([^"]+)"/g,
      'from "@nqlib/nqchart/$1"',
    )
    .replace(
      /from\s+"@\/registry\/lib\/chart-recipes"/g,
      'from "@nqlib/nqchart/recipes"',
    )
    .replace(
      /from\s+"@\/registry\/ui\/(?:chart|background|legend|tooltip)"/g,
      'from "@nqlib/nqchart"',
    )
    .replace(
      /from\s+"@\/registry\/examples\/([^"]+)"/g,
      'from "./$1"',
    )
    .replace(
      /import\s+type\s+\{\s*TreemapNode\s*\}\s+from\s+"@\/registry\/echarts-core\/parts\/types";\s*/g,
      "type TreemapNode = { name: string; value?: number; children?: TreemapNode[] };\n",
    )
    .replace(
      /import\s+\{\s*peakBarIndex\s*\}\s+from\s+"@\/registry\/echarts-core\/hover-trace-bar";\s*/g,
      'import { peakBarIndex } from "./peak-bar-index";\n',
    )
    // Published package may not export ChartContainer yet — use catalog shell.
    .replace(
      /import\s+\{\s*([^}]*ChartContainer[^}]*)\s*\}\s+from\s+"@nqlib\/nqchart";?/g,
      (match, named) => {
        const parts = named
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        const rest = parts.filter((p) => !p.includes("ChartContainer"));
        const lines = [];
        if (rest.length) {
          lines.push(`import { ${rest.join(", ")} } from "@nqlib/nqchart";`);
        }
        lines.push(
          `import { CatalogChartContainer as ChartContainer } from "../catalog-chart-container.tsx";`,
        );
        return `${lines.join("\n")}\n`;
      },
    )
    // Keep `import * as React` when the source still uses React.* APIs.
    .replace(/(\s)showBrush(?!\s*=)(\s|>)/g, "$1showBrush={false}$2");

  if (!/\bReact\./.test(out)) {
    out = out.replace(/import\s+\*\s+as\s+React\s+from\s+"react";\s*/g, "");
  }

  return out;
}

function firstExportName(source) {
  const m = source.match(/export\s+function\s+([A-Za-z0-9_]+)/);
  return m?.[1] ?? null;
}

function listExtraSharedFiles(becoRoot) {
  const examplesDir = path.join(becoRoot, "src/registry/examples");
  return ["example-shared.ts", "example-datasets.ts", "workload-demo-data.ts", "chart-tokens.ts"]
    .map((f) => path.join(examplesDir, f))
    .filter((p) => existsSync(p));
}

function hashTree(dir) {
  if (!existsSync(dir)) return "";
  const files = [];
  const walk = (d) => {
    for (const ent of readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, ent.name);
      if (ent.isDirectory()) walk(p);
      else files.push(p);
    }
  };
  walk(dir);
  files.sort();
  const h = createHash("sha256");
  for (const f of files) {
    h.update(path.relative(dir, f));
    h.update("\0");
    h.update(readFileSync(f));
    h.update("\0");
  }
  return h.digest("hex");
}

function main() {
  const registryPath = path.join(BECO, "registry.json");
  if (!existsSync(registryPath)) {
    console.error(`[sync-nqchart-catalog] missing ${registryPath}`);
    process.exit(1);
  }

  const registry = JSON.parse(readFileSync(registryPath, "utf8"));
  const blocks = registry.items.filter((i) => i.type === "registry:block");

  const beforeHash = CHECK ? hashTree(OUT_DIR) : "";

  if (!CHECK) {
    rmSync(ADAPTERS_DIR, { recursive: true, force: true });
    mkdirSync(ADAPTERS_DIR, { recursive: true });
  } else {
    mkdirSync(ADAPTERS_DIR, { recursive: true });
  }

  const copied = new Map(); // abs src → adapter base name
  const entries = [];

  const writeAdapter = (absSrc) => {
    if (copied.has(absSrc)) return copied.get(absSrc);
    const base = path.basename(absSrc);
    const relOut = base;
    const source = readFileSync(absSrc, "utf8");
    const rewritten = rewriteSource(source, base);
    if (!CHECK) writeFileSync(path.join(ADAPTERS_DIR, relOut), rewritten);
    copied.set(absSrc, relOut);
    return relOut;
  };

  // Shared support modules first.
  for (const abs of listExtraSharedFiles(BECO)) writeAdapter(abs);

  // Local peak helper for hover-trace block (not public npm API).
  if (!CHECK) {
    writeFileSync(
      path.join(ADAPTERS_DIR, "peak-bar-index.ts"),
      `export function peakBarIndex(
  rows: Record<string, unknown>[],
  dataKey: string,
): number {
  if (rows.length === 0) return 0;
  let peakIndex = 0;
  let peak = Number(rows[0]?.[dataKey] ?? Number.NEGATIVE_INFINITY);
  for (let i = 1; i < rows.length; i++) {
    const v = Number(rows[i]?.[dataKey] ?? Number.NEGATIVE_INFINITY);
    if (v > peak) {
      peak = v;
      peakIndex = i;
    }
  }
  return peakIndex;
}
`,
    );
  }

  for (const item of blocks) {
    if (GLOBAL_CONTROL_PREFIXES.some((p) => item.name.startsWith(p))) continue;

    const fileMeta = item.files?.[0];
    if (!fileMeta?.path) continue;
    const absSrc = path.join(BECO, fileMeta.path);
    if (!existsSync(absSrc)) {
      console.warn(`[sync-nqchart-catalog] skip missing ${absSrc}`);
      continue;
    }

    const adapterFile = writeAdapter(absSrc);
    const source = readFileSync(absSrc, "utf8");
    const exportName = item.meta?.exportName ?? firstExportName(source);
    if (!exportName) {
      console.warn(`[sync-nqchart-catalog] no export for ${item.name}`);
      continue;
    }

    const family = inferFamily(item.name);
    entries.push({
      id: item.name,
      name: titleize(item.name),
      exportName,
      adapterFile,
      family,
      category: inferCategory(item.name, family),
      component: item.registryDependencies?.[0]?.replace(/^@nqchart\//, "") ?? family,
    });
  }

  entries.sort((a, b) => a.id.localeCompare(b.id));

  const manifest = `/* AUTO-GENERATED by scripts/sync-nqchart-catalog.mjs — do not edit. */
export type CatalogCategory =
  | "example"
  | "variant"
  | "recipe"
  | "legend"
  | "loading"
  | "matrix"
  | "block"
  | "other";

export type CatalogEntry = {
  id: string;
  name: string;
  exportName: string;
  adapterFile: string;
  family: string;
  category: CatalogCategory;
  component: string;
};

export const CATALOG_SOURCE = ${JSON.stringify(path.basename(BECO))} as const;
export const CATALOG_COUNT = ${entries.length} as const;

export const NQCHART_CATALOG: CatalogEntry[] = ${JSON.stringify(entries, null, 2)};

export const NQCHART_FAMILIES = [...new Set(NQCHART_CATALOG.map((e) => e.family))].sort();
`;

  if (!CHECK) {
    writeFileSync(MANIFEST_PATH, `${manifest}\n`);
    // loader
    writeFileSync(
      path.join(OUT_DIR, "load-entry.ts"),
      `import type { ComponentType } from "react";
import type { CatalogEntry } from "./manifest";

const loaders: Record<string, () => Promise<Record<string, ComponentType>>> = {
${[...new Set(entries.map((e) => e.adapterFile))]
  .map(
    (f) =>
      `  ${JSON.stringify(f)}: () => import(${JSON.stringify(`./adapters/${f.replace(/\.tsx?$/, "")}`)}) as Promise<Record<string, ComponentType>>,`,
  )
  .join("\n")}
};

export async function loadCatalogComponent(
  entry: CatalogEntry,
): Promise<ComponentType> {
  const mod = await loaders[entry.adapterFile]!();
  const Comp = mod[entry.exportName];
  if (!Comp) {
    throw new Error(\`Missing export \${entry.exportName} in \${entry.adapterFile}\`);
  }
  return Comp;
}
`,
    );
    writeFileSync(
      path.join(OUT_DIR, "index.ts"),
      `export {
  NQCHART_CATALOG,
  NQCHART_FAMILIES,
  CATALOG_COUNT,
  type CatalogEntry,
  type CatalogCategory,
} from "./manifest";
export { loadCatalogComponent } from "./load-entry";
`,
    );
  } else {
    // Write to a temp compare — if OUT_DIR missing, fail.
    if (!existsSync(MANIFEST_PATH)) {
      console.error("[sync-nqchart-catalog] --check failed: manifest missing");
      process.exit(1);
    }
  }

  if (CHECK) {
    // Re-run generation into a temp dir and compare manifests counts/ids.
    const existing = readFileSync(MANIFEST_PATH, "utf8");
    const ids = [...existing.matchAll(/"id": "([^"]+)"/g)].map((m) => m[1]);
    const expected = entries.map((e) => e.id);
    const missing = expected.filter((id) => !ids.includes(id));
    const extra = ids.filter((id) => !expected.includes(id));
    if (missing.length || extra.length) {
      console.error("[sync-nqchart-catalog] --check failed");
      if (missing.length) console.error("  missing:", missing.join(", "));
      if (extra.length) console.error("  extra:", extra.join(", "));
      process.exit(1);
    }
    console.info(
      `[sync-nqchart-catalog] ok — ${entries.length} catalog entries in sync`,
    );
    return;
  }

  console.info(
    `[sync-nqchart-catalog] wrote ${entries.length} entries → ${path.relative(ROOT, OUT_DIR)} (${copied.size} adapter files)`,
  );
}

main();
