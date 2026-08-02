import { useEffect } from "react"
import { Link } from "react-router-dom"
import { Button } from "@nqlib/nqui"
import { useThemeStudio } from "@/context/theme-studio-context"

/**
 * Theme Studio hub — opens the floating panel and points people to real pages.
 * The canvas is the rest of the app; Studio floats over every route.
 */
export default function ThemeStudioPage() {
  const { openStudio } = useThemeStudio()

  useEffect(() => {
    openStudio()
  }, [openStudio])

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6 p-4 md:p-8">
      <header className="space-y-2">
        <p className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
          Theme Studio
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">Design on any page</h1>
        <p className="text-sm text-muted-foreground">
          Studio floats over the whole showcase — open it from the paintboard or the
          corner button, then browse catalog, blocks, or landing while tokens update
          live. Export{" "}
          <code className="text-[11px]">colors.css</code> or an AI prompt when ready.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" onClick={openStudio}>
          Open Studio panel
        </Button>
        <Button type="button" size="sm" variant="outline" asChild>
          <Link to="/catalog">Observe catalog</Link>
        </Button>
        <Button type="button" size="sm" variant="outline" asChild>
          <Link to="/blocks">Observe blocks</Link>
        </Button>
        <Button type="button" size="sm" variant="outline" asChild>
          <Link to="/">Observe landing</Link>
        </Button>
      </div>
    </div>
  )
}
