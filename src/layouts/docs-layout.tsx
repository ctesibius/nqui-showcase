import { Link, Outlet } from "react-router-dom";
import { Button } from "@nqlib/nqui";
import { ThemeToggle } from "../components/theme-toggle";

export function DocsLayout() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
        <Button asChild variant="ghost" size="sm">
          <Link to="/">← Back to home</Link>
        </Button>
        <ThemeToggle className="size-8" />
      </div>
      <Outlet />
    </div>
  );
}
