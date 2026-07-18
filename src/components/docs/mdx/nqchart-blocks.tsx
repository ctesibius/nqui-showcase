import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "@nqlib/nqui";

export function ComponentPreview({
  name,
  title,
  className,
}: {
  name?: string;
  title?: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "my-4 flex flex-col gap-2 rounded-lg border border-border bg-card/40 p-4",
        className,
      )}
    >
      {title ? <p className="text-sm font-medium text-foreground">{title}</p> : null}
      <p className="text-sm text-muted-foreground">
        Live preview{name ? (
          <>
            {" "}
            for <code className="rounded bg-muted px-1 py-0.5 text-xs text-foreground">{name}</code>
          </>
        ) : null}
        . Open the{" "}
        <Link to="/charts" className="font-medium text-foreground underline-offset-4 hover:underline">
          charts catalog
        </Link>{" "}
        or{" "}
        <Link to="/blocks" className="font-medium text-foreground underline-offset-4 hover:underline">
          blocks
        </Link>{" "}
        gallery.
      </p>
    </div>
  );
}

export function ComponentSource({
  name,
  title,
  className,
}: {
  name?: string;
  title?: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div className={cn("my-3 rounded-lg border border-dashed border-border bg-muted/40 p-3", className)}>
      <p className="text-xs font-medium text-foreground">{title ?? name ?? "Source"}</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Source is available via the NQChart registry / npm package. See{" "}
        <a
          href="https://nqchart.vercel.app/docs"
          className="underline-offset-4 hover:underline"
          target="_blank"
          rel="noreferrer"
        >
          nqchart.vercel.app
        </a>{" "}
        for copy-paste blocks.
      </p>
    </div>
  );
}

export function CommandBlock({ commands }: { commands?: string[] }) {
  const line = (commands ?? []).join(" ");
  return (
    <pre className="my-2 overflow-x-auto rounded-lg border border-border bg-muted p-3 text-xs text-foreground">
      pnpm add {line || "…"}
    </pre>
  );
}

export function CliBlock({
  commands,
  action,
}: {
  commands?: string[];
  action?: string;
}) {
  if (action === "init") {
    return (
      <pre className="my-2 overflow-x-auto rounded-lg border border-border bg-muted p-3 text-xs text-foreground">
        pnpm dlx shadcn@latest init
      </pre>
    );
  }
  const items = (commands ?? []).map((c) => `pnpm dlx shadcn@latest add ${c}`).join("\n");
  return (
    <pre className="my-2 overflow-x-auto rounded-lg border border-border bg-muted p-3 text-xs text-foreground">
      {items || "pnpm dlx shadcn@latest add @nqchart/…"}
    </pre>
  );
}

export function SkillsBlock({ commands }: { commands?: string[] }) {
  const line = ["npx skills add", ...(commands ?? [])].join(" ");
  return (
    <pre className="my-2 overflow-x-auto rounded-lg border border-border bg-muted p-3 text-xs text-foreground">
      {line}
    </pre>
  );
}

export function Alert({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "my-4 rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm text-muted-foreground",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function AlertContent({ children, className }: { children?: ReactNode; className?: string }) {
  return <div className={cn("leading-relaxed", className)}>{children}</div>;
}

export function ApiHeading({ children }: { children?: ReactNode }) {
  return <h3 className="mt-8 scroll-m-24 text-lg font-semibold text-foreground">{children}</h3>;
}

export function ApiTable({ children }: { children?: ReactNode }) {
  return (
    <div className="my-4 overflow-x-auto rounded-lg border border-border">
      <table className="w-full border-collapse text-sm">
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function ApiRow({
  name,
  type,
  required,
  children,
}: {
  name?: string;
  type?: string;
  required?: boolean;
  children?: ReactNode;
}) {
  return (
    <tr className="border-b border-border last:border-0">
      <td className="align-top px-3 py-2 font-mono text-xs text-foreground whitespace-nowrap">
        {name}
        {required ? <span className="ml-1 text-destructive">*</span> : null}
      </td>
      <td className="align-top px-3 py-2 font-mono text-xs text-muted-foreground whitespace-nowrap">
        {type}
      </td>
      <td className="align-top px-3 py-2 text-sm text-muted-foreground">{children}</td>
    </tr>
  );
}

export function ShowcaseGrid({ children, className }: { children?: ReactNode; className?: string }) {
  return <div className={cn("my-4 grid gap-4 sm:grid-cols-2", className)}>{children}</div>;
}

export function ComponentProps({ children }: { children?: ReactNode }) {
  return <div className="my-4">{children}</div>;
}

/** Fallback for rare live JSX that isn't a docs primitive. */
export function DocsPassthrough({ children }: { children?: ReactNode }) {
  return <>{children}</>;
}
