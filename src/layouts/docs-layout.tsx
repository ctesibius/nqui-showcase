import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@nqlib/nqui";
import { ShowcaseTopBar } from "../components/showcase-top-bar";
import { DocsSearch } from "../components/docs/docs-search";
import { ThemeControls } from "../components/showcase/theme-tokens/theme-token-sheet";

const docsSegmentItems = [
  { value: "/docs", label: "Hub" },
  { value: "/docs/nqui", label: "nqui" },
  { value: "/docs/nqchart", label: "nqchart" },
  { value: "/docs/nqgrid", label: "nqgrid" },
  { value: "/docs/nqgantt", label: "nqgantt" },
] as const;

function docsSegmentValue(pathname: string): string {
  if (pathname.startsWith("/docs/nqchart")) return "/docs/nqchart";
  if (pathname.startsWith("/docs/nqgrid")) return "/docs/nqgrid";
  if (pathname.startsWith("/docs/nqgantt")) return "/docs/nqgantt";
  if (pathname.startsWith("/docs/nqui")) return "/docs/nqui";
  return "/docs";
}

export function DocsLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <ShowcaseTopBar
        bordered
        sticky
        frosted
        leading={
          <Button asChild variant="ghost" size="sm">
            <Link to="/">← Home</Link>
          </Button>
        }
        segment={{
          value: docsSegmentValue(pathname),
          onValueChange: (value) => navigate(value),
          items: docsSegmentItems,
          "aria-label": "Docs library",
        }}
        trailing={
          <div className="flex items-center gap-2">
            <DocsSearch className="hidden sm:block" />
            <ThemeControls toggleClassName="size-8" />
          </div>
        }
      />
      <Outlet />
    </div>
  );
}
