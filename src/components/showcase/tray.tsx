import {
  createContext,
  useContext,
  type ComponentPropsWithoutRef,
  type ElementType,
  type ReactNode,
} from "react"
import { ScrollArea } from "@nqlib/nqui"
import { cn } from "@/lib/utils"
import { scrollAreaFill } from "@/lib/scroll-area-fill"

/**
 * Showcase hybrid elevation (app chrome only — not nqui Card):
 *   page (A) → muted tray (B) → background stage (A) + hairline
 *
 * Nested radius: outer lg + p-1 (4px) rim → inner sm (= radius − 4px), so the rim is
 * concentric. No glow / overlay shadow.
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
  "relative min-w-0 rounded-sm border border-border bg-background"

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
  table: "min-h-64 flex-1 p-0",
  gantt: cn(
    "h-[48rem] min-h-[48rem] flex-none overflow-hidden p-0",
    stageFillChild,
  ),
  report: "min-h-[40rem] flex-1 p-0",
} as const

/** Stages that scroll their content — through nqui ScrollArea, never native overflow. */
const scrollingStages = new Set<TrayStageVariant>(["table", "report"])

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
  /** Scrolling stages (table / report): classes for the content inside the ScrollArea (e.g. padding). */
  contentClassName?: string
  children: ReactNode
} & Omit<ComponentPropsWithoutRef<"div">, "dir">

function TrayStage({
  variant = "default",
  className,
  contentClassName,
  children,
  ...props
}: TrayStageProps) {
  if (scrollingStages.has(variant)) {
    return (
      <ScrollArea
        orientation="both"
        fadeMask={false}
        className={cn(stageBase, stageVariantClass[variant], scrollAreaFill, className)}
        {...props}
      >
        <div className={cn("h-full min-h-0", stageFillChild, contentClassName)}>{children}</div>
      </ScrollArea>
    )
  }
  return (
    <div
      className={cn(stageBase, stageVariantClass[variant], className)}
      {...props}
    >
      {children}
    </div>
  )
}

type TrayHeadingProps = {
  /** Name of the thing shown — sans, the line you scan. */
  title: ReactNode
  /** One mono line under it: the import, e.g. "@nqlib/nqui · Button". */
  meta?: string
  /** Right side: a "Docs" / "Catalog" link or a small toggle. */
  action?: ReactNode
  /** Heading level for the title (catalog specimens sit under an h2). */
  as?: "h2" | "h3" | "p"
  className?: string
}

/**
 * The specimen caption used across the site: name, import line, one action.
 * No paragraph — explanation belongs in the page around the tray.
 */
function TrayHeading({ title, meta, action, as: Heading = "h3", className }: TrayHeadingProps) {
  return (
    <TrayCaption className={cn("items-center pb-1.5", className)}>
      <div className="min-w-0">
        <Heading className="text-sm font-medium leading-snug text-foreground">{title}</Heading>
        {meta ? (
          <p className="truncate font-mono text-[0.6875rem] leading-snug text-muted-foreground" title={meta}>
            {meta}
          </p>
        ) : null}
      </div>
      {action ? <div className="flex shrink-0 items-center gap-2">{action}</div> : null}
    </TrayCaption>
  )
}

/** Quiet text link for a tray heading's action slot. */
export const trayActionLink =
  "rounded-sm text-xs text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:outline-2 focus-visible:outline-ring"

export const Tray = Object.assign(TrayRoot, {
  Caption: TrayCaption,
  Heading: TrayHeading,
  Stage: TrayStage,
})
