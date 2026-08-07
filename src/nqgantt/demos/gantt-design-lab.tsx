/**
 * Dev-only token bench for gantt bar chrome.
 *
 * Opt in with `?ganttlab` on any page that mounts a lab-enabled timeline. Every
 * slider starts at whatever the stylesheet actually computes for the current
 * style, so the panel never lies about the shipped baseline — and "Copy CSS"
 * hands back only the tokens you moved, ready to paste into `gantt-theme.css`.
 */
import { useCallback, useEffect, useState, type RefObject } from "react"
import { useLocation } from "react-router-dom"
import {
  Button,
  ScrollArea,
  Separator,
  Slider,
  cn,
} from "@nqlib/nqui"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Cancel01Icon,
  CheckmarkCircle02Icon,
  Copy01Icon,
  RefreshIcon,
  SlidersHorizontalIcon,
} from "@hugeicons/core-free-icons"
import {
  GANTT_BAR_TOKENS,
  ganttBarDesignToCss,
  ganttBarStyleLabel,
  type GanttBarDesign,
  type GanttBarTokenSpec,
} from "../bar-design"

export function useGanttLabEnabled(): boolean {
  const { search } = useLocation()
  return new URLSearchParams(search).has("ganttlab")
}

/** Read a token's live computed value back into slider space. */
function readToken(el: Element, spec: GanttBarTokenSpec): number {
  const raw = getComputedStyle(el).getPropertyValue(`--gantt-bar-${spec.token}`).trim()
  if (!raw) return spec.min

  // `rgb(255 255 255 / 0.36)` — the sliders speak in whole percent.
  const rgba = raw.match(/\/\s*([\d.]+)\s*\)/)
  if (rgba) return Math.round(Number(rgba[1]) * 100)
  if (raw === "transparent" && spec.format) return 0

  const numeric = Number.parseFloat(raw)
  if (!Number.isFinite(numeric)) return spec.min
  // `lift-alpha` ships as a bare 0–1 float; its slider counts in hundredths.
  if (spec.format && !spec.unit && numeric <= 1) return Math.round(numeric * 100)
  return Math.round(numeric)
}

function TokenRow({
  spec,
  value,
  tuned,
  onChange,
  onReset,
}: {
  spec: GanttBarTokenSpec
  value: number
  tuned: boolean
  onChange: (next: number) => void
  onReset: () => void
}) {
  return (
    <div className="grid grid-cols-[1fr_auto] items-baseline gap-x-3 gap-y-1.5 py-2">
      <div className="min-w-0">
        <span className="text-xs font-medium">{spec.label}</span>
        <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{spec.hint}</p>
      </div>
      <button
        type="button"
        onClick={onReset}
        disabled={!tuned}
        title={tuned ? `Reset ${spec.label.toLowerCase()}` : undefined}
        className={cn(
          "rounded-sm px-1 font-mono text-[11px] tabular-nums transition-colors",
          tuned
            ? "text-foreground hover:bg-foreground/10"
            : "cursor-default text-muted-foreground",
        )}
      >
        {value}
        {spec.unit ?? ""}
      </button>
      <Slider
        className="col-span-2"
        size="sm"
        min={spec.min}
        max={spec.max}
        step={spec.step}
        value={[value]}
        onValueChange={([next]) => onChange(next)}
        aria-label={spec.label}
      />
    </div>
  )
}

export function GanttDesignLab({
  ganttRef,
  design,
  onDesignChange,
}: {
  /** Wrapper around the live timeline — the panel reads its `.gantt` node. */
  ganttRef: RefObject<HTMLElement | null>
  design: GanttBarDesign
  onDesignChange: (next: GanttBarDesign) => void
}) {
  const [open, setOpen] = useState(true)
  const [baseline, setBaseline] = useState<Record<string, number>>({})
  const [copied, setCopied] = useState(false)

  // Re-read the stylesheet whenever the style changes — the baseline is the
  // authored look, not the last slider position.
  useEffect(() => {
    const node = ganttRef.current?.querySelector(".gantt")
    if (!node) return
    const next: Record<string, number> = {}
    for (const spec of GANTT_BAR_TOKENS) next[spec.token] = readToken(node, spec)
    setBaseline(next)
  }, [ganttRef, design.barStyle])

  const setToken = useCallback(
    (token: string, value: number) => {
      onDesignChange({ ...design, tuning: { ...design.tuning, [token]: value } })
    },
    [design, onDesignChange],
  )

  const resetToken = useCallback(
    (token: string) => {
      const { [token]: _dropped, ...rest } = design.tuning
      onDesignChange({ ...design, tuning: rest })
    },
    [design, onDesignChange],
  )

  const copy = useCallback(async () => {
    await navigator.clipboard.writeText(ganttBarDesignToCss(design))
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }, [design])

  const tunedCount = Object.keys(design.tuning).length

  if (!open) {
    return (
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={() => setOpen(true)}
        className="fixed right-4 bottom-4 z-[var(--z-floating)] h-8 gap-1.5 px-2.5 text-xs shadow-[var(--shadow-elevated)]"
      >
        <HugeiconsIcon icon={SlidersHorizontalIcon} size={14} strokeWidth={1.8} />
        Bar tokens
        {tunedCount > 0 ? (
          <span className="rounded-full bg-primary/15 px-1.5 text-[10px] tabular-nums">
            {tunedCount}
          </span>
        ) : null}
      </Button>
    )
  }

  return (
    <aside
      aria-label="Gantt bar token bench"
      className="fixed right-4 bottom-4 z-[var(--z-floating)] flex max-h-[min(32rem,calc(100vh-6rem))] w-[19rem] flex-col overflow-hidden rounded-[var(--radius-lg)] border border-border bg-background/85 shadow-[var(--shadow-elevated)] backdrop-blur-md"
    >
      <header className="flex h-10 shrink-0 items-center gap-2 border-b border-border px-3">
        <HugeiconsIcon
          icon={SlidersHorizontalIcon}
          size={14}
          strokeWidth={1.8}
          className="text-muted-foreground"
        />
        <span className="text-xs font-medium">Bar tokens</span>
        <span className="font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
          {ganttBarStyleLabel(design.barStyle)}
        </span>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => setOpen(false)}
          aria-label="Hide token bench"
          className="ml-auto size-6 p-0"
        >
          <HugeiconsIcon icon={Cancel01Icon} size={14} strokeWidth={1.8} />
        </Button>
      </header>

      <ScrollArea className="min-h-0 flex-1">
        <div className="divide-y divide-border/60 px-3">
          {GANTT_BAR_TOKENS.map((spec) => (
            <TokenRow
              key={spec.token}
              spec={spec}
              value={design.tuning[spec.token] ?? baseline[spec.token] ?? spec.min}
              tuned={spec.token in design.tuning}
              onChange={(next) => setToken(spec.token, next)}
              onReset={() => resetToken(spec.token)}
            />
          ))}
        </div>
      </ScrollArea>

      <Separator />
      <footer className="flex shrink-0 items-center gap-2 px-3 py-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={copy}
          disabled={tunedCount === 0}
          className="h-7 gap-1.5 px-2 text-xs"
        >
          <HugeiconsIcon
            icon={copied ? CheckmarkCircle02Icon : Copy01Icon}
            size={13}
            strokeWidth={1.8}
          />
          {copied ? "Copied" : "Copy CSS"}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => onDesignChange({ ...design, tuning: {} })}
          disabled={tunedCount === 0}
          className="h-7 gap-1.5 px-2 text-xs"
        >
          <HugeiconsIcon icon={RefreshIcon} size={13} strokeWidth={1.8} />
          Reset
        </Button>
        <span className="ml-auto font-mono text-[10px] tabular-nums text-muted-foreground">
          {tunedCount} tuned
        </span>
      </footer>
    </aside>
  )
}
