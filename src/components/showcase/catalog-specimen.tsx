import { useContext, useLayoutEffect, type ReactNode } from "react"
import { Link } from "react-router-dom"
import { cn } from "@nqlib/nqui"
import {
  CatalogIndexContext,
  CatalogQueryContext,
  CatalogSectionContext,
  catalogSpecimenId,
  specimenMatches,
} from "./catalog-index"
import {
  catalogGrid,
  catalogSpan,
  catalogStack,
  catalogStageMin,
  type CatalogSize,
} from "./catalog-layout"
import { Tray, trayActionLink } from "./tray"

/** Guide pages under `/docs/nqui` (content/docs/nqui/*.mdx). */
export type CatalogDocsPage =
  | "actions-and-selection"
  | "forms-and-fields"
  | "feedback-and-states"
  | "overlays"
  | "layout-and-surfaces"
  | "components"

type CatalogSpecimenProps = {
  /** Component family name. Plain text: it is the search target and the rail entry. */
  title: string
  /** Exported names shown under the title, e.g. "Button" or "Input, Textarea". */
  imports: string
  /** Module the names come from. */
  from?: string
  /** Guide page for the "Docs" link. */
  docs?: CatalogDocsPage
  size?: CatalogSize
  /** Extra search words: every absorbed component name, common synonyms. */
  keywords?: string
  className?: string
  /** Extra classes on the stage (padding, alignment). */
  stageClassName?: string
  children: ReactNode
}

/**
 * Catalog specimen — thin wrapper over shared {@link Tray}: component name,
 * import line and a Docs link in the rim; the stage centres the specimen.
 *
 * Registers itself with the catalog index so the rail can list it under its
 * section, and drops out when the rail search doesn't match it.
 */
export function CatalogSpecimen({
  title,
  imports,
  from = "@nqlib/nqui",
  docs,
  size = "m",
  keywords,
  className,
  stageClassName,
  children,
}: CatalogSpecimenProps) {
  const query = useContext(CatalogQueryContext)
  const section = useContext(CatalogSectionContext)
  const index = useContext(CatalogIndexContext)
  const visible = specimenMatches(query, title, `${imports} ${from}`, keywords)
  const id = catalogSpecimenId(section?.id, title)

  useLayoutEffect(() => {
    if (!visible || !index || !section) return
    return index.register({ id, title, sectionId: section.id })
  }, [visible, index, section, id, title])

  if (!visible) return null

  const importLine = `${from} · ${imports}`

  return (
    <Tray
      id={id}
      data-catalog-specimen=""
      data-size={size}
      className={cn("scroll-mt-24", catalogSpan[size], className)}
    >
      <Tray.Heading
        title={title}
        meta={importLine}
        action={
          docs ? (
            <Link to={`/docs/nqui/${docs}`} className={trayActionLink} aria-label={`${title} docs`}>
              Docs
            </Link>
          ) : null
        }
      />
      <Tray.Stage
        data-catalog-stage=""
        className={cn("flex flex-col justify-center gap-4", catalogStageMin[size], stageClassName)}
      >
        {children}
      </Tray.Stage>
    </Tray>
  )
}

/** One variant row inside a stage: a 1–2 word muted tag, then the specimen. */
export function CatalogRow({
  tag,
  className,
  children,
}: {
  tag?: string
  className?: string
  children: ReactNode
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5 @md:flex-row @md:items-center @md:gap-3">
      {tag ? (
        <span className="shrink-0 text-xs text-muted-foreground @md:w-16">{tag}</span>
      ) : null}
      <div className={cn("flex min-w-0 flex-1 flex-wrap items-center gap-2", className)}>
        {children}
      </div>
    </div>
  )
}

/** Two trays stacked in one grid cell beside a taller neighbour. */
export function CatalogStack({
  size = "m",
  children,
}: {
  size?: CatalogSize
  children: ReactNode
}) {
  return <div className={cn(catalogStack, catalogSpan[size])}>{children}</div>
}

/**
 * A catalog chapter. Hides itself while a search leaves it no specimens
 * (`:has`, so no bookkeeping round-trip).
 */
export function CatalogSection({
  id,
  title,
  className,
  children,
}: {
  id: string
  title: string
  className?: string
  children: ReactNode
}) {
  return (
    <CatalogSectionContext.Provider value={{ id, title }}>
      <section
        id={id}
        aria-labelledby={`${id}-title`}
        className={cn(
          "@container flex scroll-mt-24 flex-col gap-4 [&:not(:has([data-catalog-specimen]))]:hidden",
          className,
        )}
      >
        <h2 id={`${id}-title`} className="text-xl font-semibold tracking-tight">
          {title}
        </h2>
        <div className={catalogGrid}>{children}</div>
      </section>
    </CatalogSectionContext.Provider>
  )
}
