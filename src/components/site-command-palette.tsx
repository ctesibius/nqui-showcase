import { useNavigate } from "react-router-dom";
import {
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandPalette,
  CommandSeparator,
} from "@nqlib/nqui";

const pageSections = [
  { hash: "#top", label: "Hero", keywords: ["start", "top", "home"] },
  { hash: "#product", label: "Live product preview", keywords: ["demo", "table", "calendar", "sortable"] },
  { hash: "#pricing", label: "Pricing", keywords: ["plans", "seats", "slider"] },
  { hash: "#customers", label: "Customers", keywords: ["testimonials", "carousel"] },
  { hash: "#faq", label: "FAQ", keywords: ["accordion", "questions"] },
  { hash: "#cta", label: "Sign up", keywords: ["trial", "start", "form"] },
] as const;

export function SiteCommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (next: boolean) => void;
}) {
  const navigate = useNavigate();

  const close = () => onOpenChange(false);

  const go = (path: string, hash?: string) => {
    close();
    navigate(hash ? { pathname: path, hash } : path);
  };

  return (
    <CommandPalette
      open={open}
      onOpenChange={onOpenChange}
      shortcutEnabled
      className="site-command-palette"
      title="Command menu"
      description="Jump to page sections"
    >
      <CommandInput placeholder="Search sections…" />
      <CommandList>
        <CommandEmpty>No matches.</CommandEmpty>
        <CommandGroup heading="Pages">
          <CommandItem keywords={["home", "northwind", "demo"]} onSelect={() => go("/")}>
            Home — Northwind product preview
          </CommandItem>
          <CommandItem keywords={["readme", "docs", "install"]} onSelect={() => go("/readme")}>
            Readme — install and CLI
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="On this page">
          {pageSections.map((section) => (
            <CommandItem
              key={section.hash}
              keywords={[...section.keywords]}
              onSelect={() => go("/", section.hash)}
            >
              {section.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandPalette>
  );
}
