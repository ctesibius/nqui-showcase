import { useNavigate } from "react-router-dom";
import {
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandPalette,
} from "@nqlib/nqui/command";

export function SiteCommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (next: boolean) => void;
}) {
  const navigate = useNavigate();

  const close = () => onOpenChange(false);

  const go = (path: string, search?: string) => {
    close();
    navigate(search ? { pathname: path, search } : path);
  };

  return (
    <CommandPalette
      open={open}
      onOpenChange={onOpenChange}
      shortcutEnabled
      className="site-command-palette"
      title="Command menu"
      description="Jump to dashboard sections"
    >
      <CommandInput placeholder="Search…" />
      <CommandList>
        <CommandEmpty>No matches.</CommandEmpty>
        <CommandGroup heading="Navigate">
          <CommandItem keywords={["home", "landing", "story", "tour"]} onSelect={() => go("/")}>
            Home — product tour
          </CommandItem>
          <CommandItem keywords={["overview", "dashboard", "kpi"]} onSelect={() => go("/ops")}>
            Overview — KPIs and charts
          </CommandItem>
          <CommandItem keywords={["schedule", "gantt", "timeline"]} onSelect={() => go("/ops", "?tab=schedule")}>
            Schedule — milestone Gantt
          </CommandItem>
          <CommandItem keywords={["projects", "grid", "table"]} onSelect={() => go("/ops", "?tab=projects")}>
            Projects — program grid
          </CommandItem>
          <CommandItem keywords={["readme", "docs", "install"]} onSelect={() => go("/readme")}>
            Docs — install and CLI
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandPalette>
  );
}
