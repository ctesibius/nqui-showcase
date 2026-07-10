import { Link, useLocation, useSearchParams } from "react-router-dom";
import {
  Button,
  Separator,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@nqlib/nqui";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  BookOpen01Icon,
  Calendar03Icon,
  DashboardSquare01Icon,
  KanbanIcon,
} from "@hugeicons/core-free-icons";

const NAV = [
  { id: "overview", label: "Overview", icon: DashboardSquare01Icon, to: "/ops" },
  { id: "schedule", label: "Schedule", icon: Calendar03Icon, to: "/ops?tab=schedule" },
  { id: "projects", label: "Projects", icon: KanbanIcon, to: "/ops?tab=projects" },
  { id: "docs", label: "Docs", icon: BookOpen01Icon, to: "/readme" },
] as const;

export function OpsSidebarRail() {
  const { pathname } = useLocation();
  const [params] = useSearchParams();
  const tab = params.get("tab") ?? "overview";

  return (
    <aside className="flex h-full w-14 shrink-0 flex-col items-center gap-2 border-r border-border bg-muted/40 py-3">
      <Link
        to="/"
        aria-label="Back to home"
        className="flex size-8 items-center justify-center rounded-md bg-background text-xs font-semibold"
      >
        Q3
      </Link>
      <Separator className="w-8" />
      <nav className="flex flex-1 flex-col items-center gap-1" aria-label="Main">
        {NAV.map((item) => {
          const active =
            item.to === "/readme"
              ? pathname === "/readme"
              : pathname === "/ops" &&
                (item.id === "overview" ? !tab || tab === "overview" : tab === item.id);
          return (
            <Tooltip key={item.id}>
              <TooltipTrigger asChild>
                <Button
                  asChild
                  variant={active ? "secondary" : "ghost"}
                  size="icon"
                  className="size-9"
                >
                  <Link to={item.to} aria-current={active ? "page" : undefined}>
                    <HugeiconsIcon icon={item.icon} />
                    <span className="sr-only">{item.label}</span>
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          );
        })}
      </nav>
    </aside>
  );
}
