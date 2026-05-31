import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandPalette,
  CommandSeparator,
  CommandShortcut,
} from "@nqlib/nqui";

export function SiteCommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (next: boolean) => void;
}) {
  const navigate = useNavigate();

  const close = () => onOpenChange(false);

  return (
    <CommandPalette
      open={open}
      onOpenChange={onOpenChange}
      shortcutEnabled
      className="site-command-palette"
      title="Command menu"
      description="Search pages and run demo actions"
    >
      <CommandInput placeholder="Search pages and actions…" />
      <CommandList>
        <CommandEmpty>No matches.</CommandEmpty>
        <CommandGroup heading="Pages">
          <CommandItem
            keywords={["home", "components", "marketing", "showcase"]}
            onSelect={() => {
              close();
              navigate("/");
            }}
          >
            Home — component preview
          </CommandItem>
          <CommandItem
            keywords={["charts", "evilcharts", "analytics", "recharts"]}
            onSelect={() => {
              close();
              navigate("/#charts");
            }}
          >
            Charts — EvilCharts on nqui cards
          </CommandItem>
          <CommandItem
            keywords={["readme", "docs", "documentation"]}
            onSelect={() => {
              close();
              navigate("/readme");
            }}
          >
            Readme
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="On this page">
          <CommandItem
            keywords={["charts", "scroll", "anchor", "evilcharts"]}
            onSelect={() => {
              close();
              navigate("/#charts");
            }}
          >
            Jump to charts
          </CommandItem>
          <CommandItem
            keywords={["preview", "scroll", "anchor"]}
            onSelect={() => {
              close();
              navigate("/#preview");
            }}
          >
            Jump to component preview
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Demo actions">
          <CommandItem
            onSelect={() => {
              close();
              toast("New file", { description: "Demo shortcut — no backend." });
            }}
          >
            New file
            <CommandShortcut>⌘N</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() => {
              close();
              toast("Edit file", { description: "Demo shortcut — no backend." });
            }}
          >
            Edit file
            <CommandShortcut>⌘E</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() => {
              close();
              toast("Delete", { description: "Demo shortcut — no backend." });
            }}
          >
            Delete file
            <CommandShortcut>⌘D</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandPalette>
  );
}
