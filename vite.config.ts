import { existsSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import mdx from "fumadocs-mdx/vite"
import { defineConfig, type Alias, type PluginOption } from "vite"
import * as MdxConfig from "./source.config"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * Local nqgrid source toggle (`USE_LOCAL_NQGRID=true pnpm dev`, or `pnpm dev:local`).
 *
 * Local nqgantt source toggle (`USE_LOCAL_NQGANTT=true`, or `pnpm dev:local` which sets both).
 *
 * Points `@nqlib/nqgrid` + its public sub-barrels at the sibling `../nqgrid/src`
 * so engine edits are picked up live with no rebuild. A plain `pnpm dev` /
 * `pnpm build` uses the PUBLISHED `@nqlib/nqgrid` from node_modules, so deploys
 * never depend on a checked-out sibling repo. Deep imports beyond the public
 * barrels deliberately have no alias and won't resolve — same contract the
 * nqgrid playground enforces.
 */
function localNqgridAliases(): Alias[] {
  if (process.env.USE_LOCAL_NQGRID !== "true") return []
  const base = process.env.NQGRID_DIR ?? path.resolve(__dirname, "../nqgrid")
  const src = path.join(base, "src")
  if (!existsSync(src)) {
    console.warn(`[nqui-showcase] USE_LOCAL_NQGRID=true but no src at ${src}; using published @nqlib/nqgrid.`)
    return []
  }
  console.info(`[nqui-showcase] @nqlib/nqgrid → ${src}`)
  const barrel = (name: string) => path.join(src, name, "index.ts")
  return [
    { find: /^@nqlib\/nqgrid$/, replacement: path.join(src, "index.ts") },
    { find: /^@nqlib\/nqgrid\/engine$/, replacement: barrel("engine") },
    { find: /^@nqlib\/nqgrid\/grid$/, replacement: barrel("grid") },
    { find: /^@nqlib\/nqgrid\/sheet$/, replacement: barrel("sheet") },
    { find: /^@nqlib\/nqgrid\/spreadsheet$/, replacement: barrel("spreadsheet") },
    { find: /^@nqlib\/nqgrid\/advanced$/, replacement: barrel("advanced") },
    { find: /^@nqlib\/nqgrid\/configurator$/, replacement: barrel("configurator") },
    { find: /^@nqlib\/nqgrid\/fixtures$/, replacement: barrel("fixtures") },
  ]
}

function localNqganttAliases(): Alias[] {
  if (process.env.USE_LOCAL_NQGANTT !== "true") return []
  const workspaceRoot = process.env.NQGANTT_DIR ?? path.resolve(__dirname, "../nqgantt/packages")
  const base = path.join(workspaceRoot, "nqgantt")
  const src = path.join(base, "src")
  if (!existsSync(src)) {
    console.warn(`[nqui-showcase] USE_LOCAL_NQGANTT=true but no src at ${src}; using published @nqlib/nqgantt.`)
    return []
  }
  console.info(`[nqui-showcase] @nqlib/nqgantt → ${src}`)

  // packages/nqgantt imports the schedule kernel as `@nqlib/nqgantt-engine`
  // (a separate workspace package, framework-free, no build step needed —
  // it's plain TS Vite can transpile directly). Alias it alongside nqgantt
  // itself so local-mode testing doesn't fall back to the published engine.
  const engineSrc = path.join(workspaceRoot, "nqgantt-engine", "src", "index.ts")
  const engineAlias: Alias[] = existsSync(engineSrc)
    ? [{ find: /^@nqlib\/nqgantt-engine$/, replacement: engineSrc }]
    : (console.warn(`[nqui-showcase] USE_LOCAL_NQGANTT=true but no src at ${engineSrc}; using published @nqlib/nqgantt-engine.`), [])
  if (engineAlias.length) console.info(`[nqui-showcase] @nqlib/nqgantt-engine → ${engineSrc}`)

  return [
    { find: /^@nqlib\/nqgantt$/, replacement: path.join(src, "index.ts") },
    { find: /^@nqlib\/nqgantt\/ui$/, replacement: path.join(src, "ui.ts") },
    { find: /^@nqlib\/nqgantt\/mock$/, replacement: path.join(src, "mock.ts") },
    { find: /^@nqlib\/nqgantt\/engine$/, replacement: path.join(src, "engine.ts") },
    { find: /^@nqlib\/nqgantt\/item-gantt-adapter$/, replacement: path.join(src, "item-gantt-adapter.ts") },
    ...engineAlias,
  ]
}

/**
 * Local nqchart source toggle (`USE_LOCAL_NQCHART=true`, or `pnpm dev:local`).
 *
 * nqchart ships no single `src` barrel (its source lives under registry/ and
 * needs a build), so — unlike nqgrid/nqgantt which alias raw `src` — local mode
 * points `@nqlib/nqchart` and its per-chart subpaths at the sibling built
 * `../becocharts/dist`. Rebuild becocharts to pick up engine changes. A plain
 * `pnpm dev`/`pnpm build` uses the PUBLISHED `@nqlib/nqchart` from node_modules.
 */
function localNqchartAliases(): Alias[] {
  if (process.env.USE_LOCAL_NQCHART !== "true") return []
  const base = process.env.NQCHART_DIR ?? path.resolve(__dirname, "../becocharts")
  const dist = path.join(base, "dist")
  if (!existsSync(path.join(dist, "index.mjs"))) {
    console.warn(`[nqui-showcase] USE_LOCAL_NQCHART=true but no dist at ${dist}; using published @nqlib/nqchart.`)
    return []
  }
  console.info(`[nqui-showcase] @nqlib/nqchart → ${dist}`)
  return [
    { find: /^@nqlib\/nqchart$/, replacement: path.join(dist, "index.mjs") },
    { find: /^@nqlib\/nqchart\/(.+)$/, replacement: path.join(dist, "$1.mjs") },
  ]
}

// https://vite.dev/config/
export default defineConfig(async ({ mode }) => ({
  plugins: [
    (await mdx(MdxConfig)) as PluginOption,
    react(),
    tailwindcss(),
  ],
  // The local @nqlib/nqchart alias points at `../becocharts/dist` (pre-bundled
  // ESM outside node_modules, so vite's optimizer doesn't shim it). That dist
  // references `process.env.{NODE_ENV,NEXT_PUBLIC_APP_URL}`; define them so the
  // local toggle runs in the browser. Harmless for the published-package path.
  define: {
    "process.env.NODE_ENV": JSON.stringify(mode === "production" ? "production" : "development"),
    "process.env.NEXT_PUBLIC_APP_URL": JSON.stringify(""),
  },
  // nqui is published (^0.7.2) by default, but `USE_LOCAL_NQUI=true` still
  // dev-links the sibling repo — the dep optimizer mangles a symlinked
  // package's named exports (e.g. InlineTabsList disappears), so keep this
  // exclude to serve its ESM dist unbundled whenever local mode is active.
  optimizeDeps: {
    exclude: ["@nqlib/nqui"],
  },
  resolve: {
    alias: [
      ...localNqgridAliases(),
      ...localNqganttAliases(),
      ...localNqchartAliases(),
      { find: "@", replacement: path.resolve(__dirname, "./src") },
      { find: "collections", replacement: path.resolve(__dirname, "./.source") },
    ],
    // Single copies of the engine's peers when running against local nqgrid src.
    // `@nqlib/nqchart` too — duplicate copies break Grid reference equality in
    // apply-preview-controls (pattern XOR Grid strip).
    // fumadocs packages must stay deduped / noExternal to avoid duplicate React context.
    dedupe: [
      "recharts",
      "echarts",
      "motion",
      "react",
      "react-dom",
      "@tanstack/react-table",
      "@tanstack/react-virtual",
      "@nqlib/nqchart",
      "fumadocs-core",
      "fumadocs-mdx",
    ],
  },
  ssr: {
    noExternal: ["fumadocs-core", "fumadocs-mdx"],
  },
  // Bind to loopback only so dev does not trigger “local network” device prompts on some mobile browsers.
  // PORT env (set by preview tooling) wins over the default so parallel dev servers don't collide.
  server: {
    host: "127.0.0.1",
    strictPort: true,
    port: Number(process.env.PORT) || 5173,
  },
  preview: {
    host: "127.0.0.1",
    strictPort: true,
    port: Number(process.env.PORT) || 4173,
  },
}))
