import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  FileIcon,
  HomeIcon,
  LayoutIcon,
  CheckListIcon,
  Moon01Icon,
  SettingsIcon,
  Sun01Icon,
} from "@hugeicons/core-free-icons"
import { useTheme } from "next-themes"
import { getShowcaseThemeLabel, nextShowcaseTheme } from "../lib/showcase-theme"
import { useLocation, Link } from "react-router-dom"
import { NQUI_HUB_PATH, showcaseRoutes } from "../config/showcase-nav"
import { NavUser } from "./nav-user"
import {
  NquiLogo,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@nqlib/nqui"

const navIcons: Record<string, typeof HomeIcon> = {
  [NQUI_HUB_PATH]: HomeIcon,
  "/patterns": LayoutIcon,
  "/recipes/settings": SettingsIcon,
  "/recipes/tracker": CheckListIcon,
  "/recipes/elevation": LayoutIcon,
  "/catalog": FileIcon,
  "/design-system": SettingsIcon,
}

const showcaseUser = {
  name: "Nqui",
  email: "dev@nqui.local",
  avatar: "/avatars/shadcn.jpg",
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation()
  const { setTheme, theme } = useTheme()
  const mounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

  const toggleTheme = () => {
    setTheme(nextShowcaseTheme(theme))
  }

  const currentTheme = mounted ? theme || "light" : "light"

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="overflow-visible md:h-8 md:p-0">
              <Link to={NQUI_HUB_PATH}>
                <div className="flex aspect-square size-8 min-w-8 items-center justify-center overflow-visible rounded-lg">
                  <NquiLogo className="size-6" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Nqui</span>
                  <span className="truncate text-xs">Component Library</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent className="px-1.5 md:px-0">
            <SidebarMenu>
              {showcaseRoutes.map((item) => {
                const Icon = navIcons[item.path] ?? HomeIcon
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      asChild
                      tooltip={{
                        children: item.title,
                        hidden: false,
                      }}
                      isActive={location.pathname === item.path}
                      className="px-2.5 md:px-2"
                    >
                      <Link to={item.path}>
                        <HugeiconsIcon icon={Icon} strokeWidth={2} />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={showcaseUser} />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="relative justify-center md:h-8 md:p-0"
              onClick={toggleTheme}
              tooltip={{
                children: `Theme: ${getShowcaseThemeLabel(currentTheme)}`,
                hidden: false,
              }}
            >
              {mounted ? (
                <>
                  <HugeiconsIcon
                    icon={Sun01Icon}
                    size={16}
                    className={`absolute h-4 w-4 transition-all duration-[var(--duration-standard)] ${
                      currentTheme === "light"
                        ? "rotate-0 scale-100 opacity-100"
                        : "rotate-90 scale-0 opacity-0"
                    }`}
                  />
                  <HugeiconsIcon
                    icon={Moon01Icon}
                    size={16}
                    className={`absolute h-4 w-4 transition-all duration-[var(--duration-standard)] ${
                      currentTheme === "dark"
                        ? "rotate-0 scale-100 opacity-100"
                        : "rotate-90 scale-0 opacity-0"
                    }`}
                  />
                </>
              ) : (
                <HugeiconsIcon icon={Sun01Icon} size={16} className="h-4 w-4" />
              )}
              <span className="sr-only">Toggle theme</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
