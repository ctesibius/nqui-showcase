import { Children, useState, type ReactNode } from "react";
import {
  Button,
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@nqlib/nqui";

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 16 16"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      className="shrink-0"
      aria-hidden
    >
      {dir === "left" ? (
        <path d="M10 3.5 5.5 8 10 12.5" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="M6 3.5 10.5 8 6 12.5" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  );
}

export function useDrilldown(reset?: () => void) {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState<string | null>(null);

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      setPage(0);
      reset?.();
    }
  };

  const finish = (message: string) => {
    setStatus(message);
    onOpenChange(false);
  };

  return { open, page, setPage, status, onOpenChange, finish };
}

export function DrilldownCard({
  title,
  subtitle,
  status,
  hint,
  extra,
  children,
}: {
  title: string;
  subtitle: string;
  status: string | null;
  hint: string;
  extra?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 leading-tight">
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
        {children}
      </div>
      {extra}
      <p className="mt-auto text-xs text-muted-foreground">{status ?? hint}</p>
    </div>
  );
}

export function DrilldownPopover({
  open,
  onOpenChange,
  trigger,
  page,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: ReactNode;
  page: number;
  children: ReactNode;
}) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent align="end" className="w-64 gap-0 overflow-hidden p-0">
        <div className="overflow-hidden">
          <div
            className="flex motion-safe:transition-transform motion-safe:duration-[var(--duration-standard)] motion-safe:ease-out motion-reduce:transition-none"
            style={{ transform: `translateX(-${page * 100}%)` }}
          >
            {Children.toArray(children)}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function DrilldownPage({
  title,
  onBack,
  children,
}: {
  title: string;
  onBack?: () => void;
  children: ReactNode;
}) {
  return (
    <section className="flex h-56 w-full shrink-0 basis-full flex-col">
      <header className="flex h-9 shrink-0 items-center gap-0.5 border-b border-border px-1">
        {onBack ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7"
            aria-label="Back"
            onClick={onBack}
          >
            <Chevron dir="left" />
          </Button>
        ) : (
          <span className="w-7" />
        )}
        <p className="min-w-0 flex-1 truncate text-center text-sm font-medium">{title}</p>
        <span className="w-7" />
      </header>
      <div className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto p-1">{children}</div>
    </section>
  );
}

export function DrilldownRow({
  label,
  hint,
  drill,
  current,
  media,
  onSelect,
}: {
  label: string;
  hint: string;
  drill?: boolean;
  current?: boolean;
  media?: ReactNode;
  onSelect: () => void;
}) {
  return (
    <Item asChild size="xs" className="hover:bg-interactive">
      <button type="button" className="w-full text-left" onClick={onSelect}>
        {media ? <ItemMedia className="translate-y-0">{media}</ItemMedia> : null}
        <ItemContent>
          <ItemTitle>{label}</ItemTitle>
          <ItemDescription>{hint}</ItemDescription>
        </ItemContent>
        {drill ? (
          <span className="text-muted-foreground">
            <Chevron dir="right" />
          </span>
        ) : current ? (
          <span className="text-xs font-medium">On</span>
        ) : null}
      </button>
    </Item>
  );
}

export function DrilldownCommit({
  children,
  disabled,
  onClick,
}: {
  children: ReactNode;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <div className="mt-auto px-2 pb-2 pt-1">
      <Button size="sm" className="w-full" disabled={disabled} onClick={onClick}>
        {children}
      </Button>
    </div>
  );
}
