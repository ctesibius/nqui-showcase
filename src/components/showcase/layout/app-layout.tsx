import * as React from "react"
import { Outlet, useLocation, Link, useNavigate } from "react-router-dom"
import { AppSidebar } from "./app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  FrostedGlass,
  Separator,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@nqlib/nqui"
import {
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandItemContent,
  CommandItemDescription,
  CommandItemTitle,
  CommandList,
  CommandPalette,
  CommandSeparator,
  CommandShortcut,
} from "@nqlib/nqui/command"
import {
  NQUI_HUB_PATH,
  showcaseCatalogSections,
  showcasePatternSections,
  showcaseRouteLabel,
  showcaseRoutes,
} from "../config/showcase-nav"
import { ThemeControls } from "../theme-tokens/theme-token-sheet"

const routeToBreadcrumbs: Record<string, { label: string; path: string }[]> = {
  [NQUI_HUB_PATH]: [{ label: "Recipes", path: NQUI_HUB_PATH }],
  "/patterns": [
    { label: "Recipes", path: NQUI_HUB_PATH },
    { label: "Commerce dashboard", path: "/patterns" },
  ],
  "/recipes/elevation": [
    { label: "Recipes", path: NQUI_HUB_PATH },
    { label: "Elevation philosophy", path: "/recipes/elevation" },
  ],
  "/catalog": [{ label: "Component catalog", path: "/catalog" }],
  "/design-system": [{ label: "Design system", path: "/design-system" }],
  "/studio": [{ label: "Theme Studio", path: "/studio" }],
  "/settings/appearance": [{ label: "Appearance", path: "/settings/appearance" }],
  "/command": [{ label: "Command lab", path: "/command" }],
}

// Context to share scroll container ref with TOC
export const ScrollContainerContext = React.createContext<React.RefObject<HTMLDivElement | null> | null>(null)

// Context to share page content ref with TOC (for scoping to current page only)
export const PageContentContext = React.createContext<React.RefObject<HTMLDivElement | null> | null>(null)

// Wrapper component that provides page content ref to context
function PageContentWrapper({ children }: { children: React.ReactNode }) {
  const pageContentRef = React.useRef<HTMLDivElement>(null)

  return (
    <PageContentContext.Provider value={pageContentRef}>
      <div ref={pageContentRef} className="relative">
        {children}
      </div>
    </PageContentContext.Provider>
  )
}

function AppLayoutContent() {
  const location = useLocation()
  const breadcrumbs = routeToBreadcrumbs[location.pathname] ?? [
    { label: showcaseRouteLabel(location.pathname), path: location.pathname },
  ]
  const scrollContainerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const scrollContainer = scrollContainerRef.current
    if (!scrollContainer) return

    // Disable browser scroll restoration
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual'
    }

    // Prevent body/html from scrolling
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'

    // Reset scroll to top on route change - use requestAnimationFrame to ensure DOM is ready
    const resetScroll = () => {
      scrollContainer.scrollTop = 0
      window.scrollTo(0, 0)
      document.documentElement.scrollTop = 0
    }

    // Reset immediately and once after render
    resetScroll()
    requestAnimationFrame(() => {
      resetScroll()
    })

    return () => {
      // Restore body/html overflow on cleanup
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
    }
  }, [location.pathname, location.hash])

  // Monitor and prevent scrollIntoView from scrolling our container
  React.useEffect(() => {
    const scrollContainer = scrollContainerRef.current
    if (!scrollContainer) return

    const originalScrollIntoView = Element.prototype.scrollIntoView
    const originalFocus = HTMLElement.prototype.focus

    // Don't intercept focus - allow normal scrolling behavior

    Element.prototype.scrollIntoView = function(...args) {
      const isInsideContainer = scrollContainer.contains(this)

      // Allow scrollIntoView for TOC clicks and user interactions
      if (isInsideContainer) {
        // Always allow scrollIntoView - it's needed for TOC navigation
        return originalScrollIntoView.apply(this, args)
      }

      return originalScrollIntoView.apply(this, args)
    }

    return () => {
      Element.prototype.scrollIntoView = originalScrollIntoView
      HTMLElement.prototype.focus = originalFocus
    }
  }, [])

  return (
    <ScrollContainerContext.Provider value={scrollContainerRef}>
      <AppSidebar />
      <SidebarInset className="flex flex-col h-screen overflow-hidden">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[var(--z-debug)] focus:rounded-md focus:border focus:border-border focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-foreground focus:shadow-sm"
        >
          Skip to main content
        </a>
        {/* Main shell scrollport: native overflow so the page scrollbar stays visible. */}
        <div
          ref={scrollContainerRef}
          data-main-scroll="true"
          className="flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden"
        >
          {/* Header with FrostedGlass for content behind and reflections nearby */}
          <header className="sticky top-0 z-[var(--z-sticky-page)] flex-shrink-0 relative">
            <FrostedGlass blur={16} borderRadius={0} className="z-[var(--z-background)]" />
            <div className="relative z-[var(--z-content)] border-b transition-colors bg-background/40 flex h-12 items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb className="min-w-0 flex-1">
                <BreadcrumbList>
                  {breadcrumbs.map((crumb, index) => (
                    <React.Fragment key={crumb.path}>
                      {index > 0 && <BreadcrumbSeparator />}
                      <BreadcrumbItem
                        className={
                          index === breadcrumbs.length - 1 ? "" : "hidden md:block"
                        }
                      >
                        {index === breadcrumbs.length - 1 ? (
                          <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink asChild>
                            <Link to={crumb.path}>{crumb.label}</Link>
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                    </React.Fragment>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
              <ThemeControls className="shrink-0" />
            </div>
          </header>
          <main id="main" tabIndex={-1} className="outline-none">
            <PageContentWrapper>
              <Outlet />
            </PageContentWrapper>
          </main>
        </div>
      </SidebarInset>
    </ScrollContainerContext.Provider>
  )
}

function CommandPaletteContent() {
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = React.useState(false)

  const goTo = React.useCallback(
    (path: string, hash?: string) => {
      navigate(hash ? { pathname: path, hash } : path)
      setOpen(false)
    },
    [navigate],
  )

  return (
    <CommandPalette open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search pages and sections…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Pages">
          {showcaseRoutes.map((route) => (
            <CommandItem
              key={route.path}
              value={`${route.title} ${route.description}`}
              onSelect={() => goTo(route.path)}
            >
              <CommandItemContent>
                <CommandItemTitle>{route.title}</CommandItemTitle>
                <CommandItemDescription>{route.description}</CommandItemDescription>
              </CommandItemContent>
            </CommandItem>
          ))}
        </CommandGroup>
        {location.pathname === "/catalog" ? (
          <>
            <CommandSeparator />
            <CommandGroup heading="Catalog sections">
              {showcaseCatalogSections.map((section) => (
                <CommandItem
                  key={section.hash}
                  value={section.title}
                  onSelect={() => goTo(section.path, section.hash)}
                >
                  {section.title}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        ) : null}
        {location.pathname === "/patterns" ? (
          <>
            <CommandSeparator />
            <CommandGroup heading="Recipe sections">
              {showcasePatternSections.map((section) => (
                <CommandItem
                  key={section.hash}
                  value={section.title}
                  onSelect={() => goTo(section.path, section.hash)}
                >
                  {section.title}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        ) : null}
        <CommandSeparator />
        <CommandGroup heading="Shortcuts">
          <CommandItem disabled>
            Open palette
            <CommandShortcut>⌘K</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandPalette>
  )
}

export function AppLayout() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "13rem",
        } as React.CSSProperties
      }
    >
      <AppLayoutContent />
      <CommandPaletteContent />
    </SidebarProvider>
  )
}

