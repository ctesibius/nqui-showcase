import type { ReactNode } from "react";
import {
  Tabs as NquiTabs,
  TabsList as NquiTabsList,
  TabsTrigger,
  TabsContent,
  cn,
} from "@nqlib/nqui";

/**
 * Becocharts MDX uses TabsTab / TabsPanel naming (Base UI style).
 * Map onto nqui TabsTrigger / TabsContent.
 *
 * Docs tabs must show full labels — nqui's default trigger uses flex-1 + min-w-0,
 * which compresses "CLI" / "Manual" in narrow article columns.
 */
export function CodeTabs({
  children,
  className,
  defaultValue = "cli",
}: {
  children?: ReactNode;
  className?: string;
  defaultValue?: string;
}) {
  return (
    <NquiTabs defaultValue={defaultValue} className={cn("my-4 w-full", className)}>
      {children}
    </NquiTabs>
  );
}

export function TabsList({
  children,
  className,
  variant: _variant,
}: {
  children?: ReactNode;
  className?: string;
  variant?: string;
}) {
  return (
    <NquiTabsList
      className={cn(
        "h-auto w-fit max-w-full flex-none flex-wrap justify-start gap-1",
        className,
      )}
    >
      {children}
    </NquiTabsList>
  );
}

export function TabsTab({
  children,
  value,
  className,
}: {
  children?: ReactNode;
  value: string;
  className?: string;
}) {
  return (
    <TabsTrigger
      value={value}
      className={cn(
        "min-w-max max-w-none flex-none shrink-0 grow-0 basis-auto px-3 py-1.5",
        className,
      )}
    >
      {children}
    </TabsTrigger>
  );
}

export function TabsPanel({
  children,
  value,
  className,
}: {
  children?: ReactNode;
  value: string;
  className?: string;
}) {
  return (
    <TabsContent value={value} className={cn("mt-4", className)}>
      {children}
    </TabsContent>
  );
}

export function Tabs({
  children,
  className,
  ...props
}: {
  children?: ReactNode;
  className?: string;
  defaultValue?: string;
}) {
  return (
    <NquiTabs className={cn("w-full", className)} {...props}>
      {children}
    </NquiTabs>
  );
}

export function Tab({ children, className }: { children?: ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}
