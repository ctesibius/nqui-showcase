import type { ReactNode } from "react"
import {
  Tray,
  trayCaptionDescription,
  trayCaptionTitle,
} from "./tray"

type CatalogSpecimenProps = {
  title: ReactNode
  description?: ReactNode
  className?: string
  /** Extra classes on the stage (e.g. space-y-3). */
  stageClassName?: string
  children: ReactNode
}

/**
 * Catalog specimen — thin wrapper over shared {@link Tray}
 * (muted rim → background stage + hairline).
 */
export function CatalogSpecimen({
  title,
  description,
  className,
  stageClassName,
  children,
}: CatalogSpecimenProps) {
  return (
    <Tray className={className}>
      <Tray.Caption>
        <div className="min-w-0">
          <div className={trayCaptionTitle}>{title}</div>
          {description != null ? (
            <div className={trayCaptionDescription}>{description}</div>
          ) : null}
        </div>
      </Tray.Caption>
      <Tray.Stage className={stageClassName}>{children}</Tray.Stage>
    </Tray>
  )
}
