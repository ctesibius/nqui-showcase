/**
 * Bar design picker — one button, one menu, live specimens.
 *
 * Every row shows the look it names: the swatch is painted from the exact same
 * `--gantt-bar-*` tokens the timeline reads, so what you compare in the menu is
 * what lands on the bars. See `../bar-design.ts` for the token contract.
 */
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  cn,
} from "@nqlib/nqui"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowDown01Icon, PaintBoardIcon, RefreshIcon } from "@hugeicons/core-free-icons"
import {
  GANTT_BAR_DESIGN_DEFAULT,
  GANTT_BAR_STYLES,
  GANTT_GROUP_ROWS,
  ganttBarStyleLabel,
  isGanttBarStyleId,
  isGanttGroupRowsId,
  isGanttBarDesignDirty,
  type GanttBarDesign,
  type GanttBarStyleId,
  type GanttGroupRowsId,
} from "../bar-design"

/** Miniature task bar — same tokens, 1/8 scale. */
function BarSwatch({ styleId }: { styleId: GanttBarStyleId }) {
  return (
    <span className="gantt-bar-swatch" data-gantt-bar-style={styleId} aria-hidden>
      <span className="gantt-bar-swatch__fill" />
    </span>
  )
}

/** Rollup silhouette — drawn, so the three shapes stay legible at 12px. */
function GroupSwatch({ rows }: { rows: GanttGroupRowsId }) {
  return (
    <svg
      viewBox="0 0 40 12"
      className="mt-0.5 h-3 w-10 shrink-0 text-muted-foreground"
      fill="currentColor"
      aria-hidden
    >
      {rows === "bracket" ? (
        <>
          <rect x="0" y="1" width="40" height="4" rx="1.5" />
          <path d="M0 5h4L0 11Z" />
          <path d="M40 5h-4l4 6Z" />
        </>
      ) : rows === "rail" ? (
        <>
          <rect x="0" y="4.75" width="40" height="2.5" rx="1.25" />
          <rect x="0" y="2" width="2.5" height="8" rx="0.75" />
          <rect x="37.5" y="2" width="2.5" height="8" rx="0.75" />
        </>
      ) : (
        <rect x="0" y="2" width="40" height="8" rx="2.5" />
      )}
    </svg>
  )
}

export function GanttDesignMenu({
  design,
  onDesignChange,
  className,
}: {
  design: GanttBarDesign
  onDesignChange: (next: GanttBarDesign) => void
  className?: string
}) {
  const dirty = isGanttBarDesignDirty(design)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className={cn("h-7 gap-1.5 px-2 text-xs", className)}
        >
          <HugeiconsIcon icon={PaintBoardIcon} size={14} strokeWidth={1.8} />
          <span className="text-muted-foreground">Design</span>
          <span className="font-medium">{ganttBarStyleLabel(design.barStyle)}</span>
          <HugeiconsIcon icon={ArrowDown01Icon} size={13} strokeWidth={2} className="opacity-60" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="font-mono text-[10px] font-normal tracking-[0.16em] text-muted-foreground uppercase">
          Bar style
        </DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={design.barStyle}
          onValueChange={(v) => {
            if (isGanttBarStyleId(v)) onDesignChange({ ...design, barStyle: v })
          }}
        >
          {GANTT_BAR_STYLES.map((style) => (
            <DropdownMenuRadioItem
              key={style.id}
              value={style.id}
              className="items-start gap-3 py-1 text-xs"
            >
              <span className="min-w-0 flex-1">
                <span className="block font-medium">{style.label}</span>
                <span className="block text-[11px] leading-snug text-muted-foreground">
                  {style.blurb}
                </span>
              </span>
              <BarSwatch styleId={style.id} />
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>

        <DropdownMenuSeparator />
        <DropdownMenuLabel className="font-mono text-[10px] font-normal tracking-[0.16em] text-muted-foreground uppercase">
          Group rows
        </DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={design.groupRows}
          onValueChange={(v) => {
            if (isGanttGroupRowsId(v)) onDesignChange({ ...design, groupRows: v })
          }}
        >
          {GANTT_GROUP_ROWS.map((option) => (
            <DropdownMenuRadioItem
              key={option.id}
              value={option.id}
              className="items-start gap-3 py-1 text-xs"
            >
              <span className="min-w-0 flex-1">
                <span className="block font-medium">{option.label}</span>
                <span className="block text-[11px] leading-snug text-muted-foreground">
                  {option.blurb}
                </span>
              </span>
              <GroupSwatch rows={option.id} />
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>

        {dirty ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2 text-xs"
              onSelect={() => onDesignChange(GANTT_BAR_DESIGN_DEFAULT)}
            >
              <HugeiconsIcon icon={RefreshIcon} size={13} strokeWidth={1.8} />
              Back to the shipped look
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
