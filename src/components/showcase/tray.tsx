import {
  createContext,
  useContext,
  type ComponentPropsWithoutRef,
  type ElementType,
  type ReactNode,
} from "react"
import { cn } from "@/lib/utils"

/**
 * Showcase hybrid elevation (app chrome only — not nqui Card):
 *   page (A) → muted tray (B) → background stage (A) + hairline
 *
 * Nested radius: outer lg + p-1 rim → inner md. No glow / overlay shadow.
 */

const trayRoot =
  "flex min-w-0 flex-col rounded-lg bg-muted p-1"

const trayInteractive =
  "transition-[background-color] duration-[var(--duration-standard)] ease-[var(--ease-out)] hover:[background:color-mix(in_oklch,var(--muted)_88%,var(--foreground))] motion-reduce:transition-none"

const trayCaption =
  "flex items-baseline justify-between gap-3 px-2 py-1"

export const trayCaptionTitle = "font-mono text-xs font-medium text-foreground"

export const trayCaptionDescription =
  "mt-0.5 text-xs leading-snug text-muted-foreground"

/** Rim chrome padding for blurb / tag rows under the stage (blocks / charts). */
export const trayMeta = "px-2 pb-[0.35rem] pt-2"
export const trayTags = "flex flex-wrap gap-1 px-2 pb-2 pt-0"

const stageBase =
  "relative min-w-0 rounded-md border border-border bg-background"

/** Full-bleed jobs: stage child (LazyMount / Suspense) fills the frame. */
const stageFillChild = "[&>*]:min-h-0 [&>*]:h-full"

const stageVariantClass = {
  /** Padded UI specimens (catalog / compact blocks). No overflow clip — popovers must escape. */
  default: "min-h-0 flex-1 p-3.5",
  /** Docs / custom height via className — no inset. Height comes from className (not flex-1). */
  flush: cn("min-h-0 flex-none overflow-hidden p-0", stageFillChild),
  chart: cn(
    "h-auto w-full flex-none aspect-[4/3] overflow-hidden p-0",
    stageFillChild,
  ),
  table: cn("min-h-64 flex-1 overflow-auto p-0", stageFillChild),
  gantt: cn(
    "h-[48rem] min-h-[48rem] flex-none overflow-hidden p-0",
    stageFillChild,
  ),
  report: cn(
    "min-h-[40rem] flex-1 overflow-auto p-0 [scrollbar-gutter:stable]",
    stageFillChild,
  ),
} as const

export type TrayStageVariant = keyof typeof stageVariantClass

type TrayAs = "figure" | "div"

type TrayContextValue = { as: TrayAs }

const TrayContext = createContext<TrayContextValue>({ as: "figure" })

type TrayProps = {
  as?: TrayAs
  /** Subtle muted hover (blocks / charts shelf). Off for catalog specimens. */
  interactive?: boolean
  className?: string
  children: ReactNode
} & Omit<ComponentPropsWithoutRef<"figure">, "as" | "children" | "className">

function TrayRoot({
  as = "figure",
  interactive = false,
  className,
  children,
  ...props
}: TrayProps) {
  const Comp = as as ElementType
  return (
    <TrayContext.Provider value={{ as }}>
      <Comp
        className={cn(trayRoot, interactive && trayInteractive, className)}
        {...props}
      >
        {children}
      </Comp>
    </TrayContext.Provider>
  )
}

type TrayCaptionProps = {
  className?: string
  children: ReactNode
} & ComponentPropsWithoutRef<"div">

function TrayCaption({ className, children, ...props }: TrayCaptionProps) {
  const { as } = useContext(TrayContext)
  const Comp = (as === "figure" ? "figcaption" : "div") as ElementType
  return (
    <Comp className={cn(trayCaption, className)} {...props}>
      {children}
    </Comp>
  )
}

type TrayStageProps = {
  variant?: TrayStageVariant
  className?: string
  children: ReactNode
} & ComponentPropsWithoutRef<"div">

function TrayStage({
  variant = "default",
  className,
  children,
  ...props
}: TrayStageProps) {
  return (
    <div
      className={cn(stageBase, stageVariantClass[variant], className)}
      {...props}
    >
      {children}
    </div>
  )
}

export const Tray = Object.assign(TrayRoot, {
  Caption: TrayCaption,
  Stage: TrayStage,
})
