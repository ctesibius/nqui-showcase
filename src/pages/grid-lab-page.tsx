/**
 * Grid lab — dev-only. Never reaches a deployed build.
 *
 * `/blocks` Work breakdown has to behave for visitors. This doesn't. It's the
 * bench for nqgrid surfaces + DnD experiments (Pragmatic `./dnd` on tables,
 * spreadsheet/projects chrome) while iterating with `pnpm dev:local`.
 *
 * Registered behind `import.meta.env.DEV` in `App.tsx`, which Vite replaces
 * with a literal `false` at build time, so Rollup drops this module and
 * everything it pulls in. Verify with `pnpm build` — no grid-lab chunk.
 */
import { useState } from "react"
import { Link } from "react-router-dom"
import {
  Badge,
  Label,
  ToggleGroup,
  ToggleGroupItem,
  cn,
} from "@nqlib/nqui"
import { WorkBreakdownBlock } from "@/components/blocks/blocks-grid"
import { Tray } from "@/components/showcase/tray"
import { SpreadsheetPage } from "@/nqgrid/demos/spreadsheet/spreadsheet-page"
import { ProjectsPage } from "@/nqgrid/demos/projects/projects-page"
import { PlaygroundTableSettingsProvider } from "@/nqgrid/playground-table-settings"

type SurfaceId = "wbs" | "projects" | "spreadsheet"

const SURFACES: { id: SurfaceId; label: string; hint: string }[] = [
  {
    id: "wbs",
    label: "WBS",
    hint: "Pragmatic SortableList layout=table — row + column reorder ghost",
  },
  {
    id: "projects",
    label: "Projects",
    hint: "PM grid (still dnd-kit drop chrome) — table / list / board / timeline",
  },
  {
    id: "spreadsheet",
    label: "Spreadsheet",
    hint: "Sheets workbook — formula bar, freeze, pivot; engine stress surface",
  },
]

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="font-mono text-xs tracking-[0.16em] text-muted-foreground uppercase">
        {label}
      </Label>
      {children}
    </div>
  )
}

export function GridLabPage() {
  const [surface, setSurface] = useState<SurfaceId>("wbs")
  const active = SURFACES.find((s) => s.id === surface)!

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="flex shrink-0 flex-wrap items-end justify-between gap-4 border-b border-border px-6 py-4">
        <div>
          <div className="flex items-center gap-2">
            <Link
              to="/blocks"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              nqlib
            </Link>
            <span className="text-muted-foreground/50">/</span>
            <h1 className="text-sm font-medium tracking-tight">Grid lab</h1>
            <Badge variant="outline" className="font-mono text-xs font-normal">
              dev only
            </Badge>
          </div>
          <p className="mt-1 max-w-2xl text-xs text-muted-foreground">
            {active.hint}. Not in the deployed build — break whatever you like.
            Prefer <code className="font-mono text-xs">pnpm dev:local</code> when
            patching the engine.
          </p>
        </div>
        <p className="font-mono text-xs text-muted-foreground">
          sibling <span className="text-foreground">../nqgrid</span> · check{" "}
          <code className="text-foreground">pnpm nqgrid:status</code>
        </p>
      </header>

      <div className="flex shrink-0 flex-wrap items-end gap-x-6 gap-y-3 border-b border-border px-6 py-3">
        <Field label="Surface">
          <ToggleGroup
            type="single"
            size="sm"
            value={surface}
            onValueChange={(v) => v && setSurface(v as SurfaceId)}
          >
            {SURFACES.map((s) => (
              <ToggleGroupItem key={s.id} value={s.id} className="text-xs">
                {s.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </Field>
      </div>

      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col",
          surface === "wbs" ? "p-6" : "overflow-hidden",
        )}
      >
        {surface === "wbs" ? (
          <Tray className="min-h-0 flex-1">
            {/* Definite height, not just min-height: this page's chain is
                auto-sized (min-h-dvh root → flex-1 descendants), so a
                percentage height cannot resolve and the stage's fill-child
                (`[&>*]:h-full`) would collapse to its header. Same shape the
                `gantt` stage variant uses. */}
            <Tray.Stage
              variant="table"
              className="h-[28rem] min-h-[28rem] flex-none overflow-auto p-4"
            >
              <WorkBreakdownBlock />
            </Tray.Stage>
          </Tray>
        ) : null}
        {/* Both demos read PlaygroundTableSettings context and throw without
            the provider. The wrapper needs a definite height (this page's chain
            is auto-sized, so flex-1 alone collapses the grid) *and* must be a
            flex column — both demo roots are `flex-1`, which only resolves
            against a flex parent. Mirrors components/story/grid-chapter. */}
        {surface === "projects" ? (
          <div className="flex h-[70vh] min-h-[520px] flex-col overflow-hidden">
            <PlaygroundTableSettingsProvider>
              <ProjectsPage />
            </PlaygroundTableSettingsProvider>
          </div>
        ) : null}
        {surface === "spreadsheet" ? (
          <div className="flex h-[70vh] min-h-[520px] flex-col overflow-hidden">
            <PlaygroundTableSettingsProvider>
              <SpreadsheetPage />
            </PlaygroundTableSettingsProvider>
          </div>
        ) : null}
      </div>
    </div>
  )
}
