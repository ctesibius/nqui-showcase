import { Link, NavLink, Outlet } from "react-router-dom";
import { Button, cn } from "@nqlib/nqui";
import { ThemeToggle } from "../components/theme-toggle";

const docsNav = [
  { to: "/readme", end: true, label: "nqui" },
  { to: "/readme/nqchart", end: true, label: "nqchart" },
] as const;

export function DocsLayout() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
        <div className="flex items-center gap-1 sm:gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link to="/">← Home</Link>
          </Button>
          <nav className="flex items-center gap-0.5" aria-label="Docs">
            {docsNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    "rounded-md px-2.5 py-1.5 text-sm transition-colors",
                    isActive
                      ? "bg-muted font-medium text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
        <ThemeToggle className="size-8" />
      </div>
      <Outlet />
    </div>
  );
}
