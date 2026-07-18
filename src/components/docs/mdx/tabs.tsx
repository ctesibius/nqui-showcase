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
    <NquiTabs defaultValue={defaultValue} className={cn("my-4", className)}>
      {children}
    </NquiTabs>
  );
}

export function TabsList({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
  variant?: string;
}) {
  return <NquiTabsList className={className}>{children}</NquiTabsList>;
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
    <TabsTrigger value={value} className={className}>
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
    <NquiTabs className={className} {...props}>
      {children}
    </NquiTabs>
  );
}

export function Tab({ children, className }: { children?: ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}
