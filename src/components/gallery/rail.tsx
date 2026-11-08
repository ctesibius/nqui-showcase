/**
 * Rail primitives — the controls that live in a `RailLayout` sidebar:
 * package header, search, labelled groups, single-choice filters and
 * scroll-spy section links. One row style across all of them so a rail reads
 * as one list whatever it holds. All nqui: InputGroup + Kbd, vertical
 * ToggleGroup, ghost Buttons.
 */
import { useContext, useEffect, useRef, type MouseEvent, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, Search01Icon } from "@hugeicons/core-free-icons";
import {
  Button,
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  Kbd,
  ToggleGroup,
  ToggleGroupItem,
  cn,
} from "@nqlib/nqui";
import { RailCloseContext } from "./rail-context";
import { scrollToSection } from "./gallery-scroll";

/** Package and size — what this gallery is, said once, at the top of the rail. */
export function RailHeader({ pkg, count, unit }: { pkg: string; count: number; unit: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="font-mono text-xs text-foreground">{pkg}</span>
      <span className="text-xs tabular-nums text-muted-foreground">
        {count} {unit}, all live
      </span>
    </div>
  );
}

/** A labelled block in the rail. */
export function RailGroup({
  label,
  action,
  children,
  className,
}: {
  label: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("flex flex-col gap-2", className)}>
      <div className="flex h-5 items-center justify-between gap-2 px-2">
        <h2 className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

/**
 * Search field. `/` focuses it from anywhere on the page, like most
 * catalogues — only the copy that is on screen answers.
 */
export function RailSearch({
  value,
  onChange,
  placeholder,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label: string;
}) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      const input = ref.current;
      // Hidden copies (the desktop rail below lg) have no layout box.
      if (!input || input.getClientRects().length === 0) return;
      e.preventDefault();
      input.focus();
      input.select();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <InputGroup className="h-8 bg-background/70">
      <InputGroupAddon>
        <HugeiconsIcon icon={Search01Icon} strokeWidth={2} className="size-3.5 text-muted-foreground" />
      </InputGroupAddon>
      <InputGroupInput
        ref={ref}
        type="search"
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape" && value) {
            e.preventDefault();
            onChange("");
          }
        }}
        placeholder={placeholder}
        className="text-sm [&::-webkit-search-cancel-button]:appearance-none"
      />
      <InputGroupAddon align="inline-end">
        {value ? (
          <InputGroupButton
            size="icon-xs"
            aria-label="Clear search"
            onClick={() => {
              onChange("");
              ref.current?.focus();
            }}
          >
            <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} />
          </InputGroupButton>
        ) : (
          <Kbd>/</Kbd>
        )}
      </InputGroupAddon>
    </InputGroup>
  );
}

/** Row look shared by filter items and section links, so the rail reads as one list. */
const railRow =
  "h-7 w-full min-w-0 justify-between gap-2 rounded-md px-2 text-left text-sm font-normal text-muted-foreground hover:bg-interactive hover:text-foreground";
const railRowActive = "bg-secondary font-medium text-foreground";

function RailCount({ n }: { n: number }) {
  return <span className="shrink-0 text-xs tabular-nums text-muted-foreground/80">{n}</span>;
}

export type RailFilterItem<T extends string> = { value: T; label: string; count: number };

/** Single-choice filter as a vertical list with counts (nqui ToggleGroup). */
export function RailFilter<T extends string>({
  label,
  value,
  onValueChange,
  items,
}: {
  label: string;
  value: T;
  onValueChange: (value: T) => void;
  items: ReadonlyArray<RailFilterItem<T>>;
}) {
  const close = useContext(RailCloseContext);
  return (
    <ToggleGroup
      type="single"
      orientation="vertical"
      variant="segmented"
      spacing={0.5}
      aria-label={label}
      value={value}
      onValueChange={(v) => {
        if (!v) return;
        onValueChange(v as T);
        close();
      }}
      className="w-full"
    >
      {items.map((item) => (
        <ToggleGroupItem
          key={item.value}
          value={item.value}
          disabled={item.count === 0 && item.value !== value}
          className={cn(railRow, "data-[state=on]:font-medium data-[state=on]:text-foreground")}
        >
          <span className="truncate">{item.label}</span>
          <RailCount n={item.count} />
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}

export type RailLinkChild = {
  id: string;
  label: string;
  /** Route to another page (`/docs/nqui/overlays`). Omit for an in-page `#id` anchor. */
  to?: string;
};

export type RailLinkItem = RailLinkChild & {
  count?: number;
  /** Shown under the item while it is the active one. */
  children?: ReadonlyArray<RailLinkChild>;
};

/**
 * Rail links. In-page items (no `to`) scroll to `#id` with scroll-spy;
 * route items (`to`) navigate. Either way the active item expands to its
 * children, so a section shows its specimens and a docs folder its pages.
 */
export function RailLinks({
  label,
  items,
  activeId,
  activeChildId,
}: {
  label: string;
  items: ReadonlyArray<RailLinkItem>;
  activeId: string | null;
  activeChildId?: string | null;
}) {
  const close = useContext(RailCloseContext);
  const go = (id: string) => (e: MouseEvent) => {
    e.preventDefault();
    close();
    // Let the Sheet start closing before scrolling the page under it.
    requestAnimationFrame(() => scrollToSection(id));
  };

  const target = (link: RailLinkChild, current: boolean, count?: number) => {
    const body = (
      <>
        <span className="truncate">{link.label}</span>
        {count != null ? <RailCount n={count} /> : null}
      </>
    );
    return link.to ? (
      <Link to={link.to} aria-current={current ? "page" : undefined} onClick={close}>
        {body}
      </Link>
    ) : (
      <a href={`#${link.id}`} aria-current={current ? "location" : undefined} onClick={go(link.id)}>
        {body}
      </a>
    );
  };

  return (
    <nav aria-label={label}>
      <ul className="flex flex-col gap-0.5">
        {items.map((item) => {
          const active = item.id === activeId;
          // A route item whose child is the current page is "open", not "current".
          const current = active && !(item.to && activeChildId);
          return (
            <li key={item.id}>
              <Button asChild variant="ghost" size="sm" className={cn(railRow, active && railRowActive)}>
                {target(item, current, item.count)}
              </Button>
              {active && item.children?.length ? (
                <ul className="my-1 ml-2 flex flex-col border-l border-border pl-2">
                  {item.children.map((child) => {
                    const childCurrent = child.id === activeChildId;
                    return (
                      <li key={child.id}>
                        <Button
                          asChild
                          variant="ghost"
                          size="sm"
                          className={cn(
                            railRow,
                            "h-6 text-xs",
                            childCurrent && "font-medium text-foreground",
                          )}
                        >
                          {target(child, childCurrent && Boolean(child.to))}
                        </Button>
                      </li>
                    );
                  })}
                </ul>
              ) : null}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
