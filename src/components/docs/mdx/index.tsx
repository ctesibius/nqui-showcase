import type { MDXComponents } from "mdx/types";
import { Link } from "react-router-dom";
import { cn } from "@nqlib/nqui";

/**
 * Minimal MDX component map for showcase docs.
 * Expanded in Phase 3 for nqchart-specific blocks.
 */
export const mdxComponents: MDXComponents = {
  h1: (props) => (
    <h1 className="scroll-m-24 text-3xl font-semibold tracking-tight text-foreground" {...props} />
  ),
  h2: (props) => (
    <h2
      className="scroll-m-24 mt-10 border-b border-border pb-2 text-xl font-semibold tracking-tight text-foreground first:mt-0"
      {...props}
    />
  ),
  h3: (props) => (
    <h3 className="scroll-m-24 mt-8 text-lg font-semibold text-foreground" {...props} />
  ),
  h4: (props) => (
    <h4 className="scroll-m-24 mt-6 text-base font-semibold text-foreground" {...props} />
  ),
  p: (props) => <p className="leading-7 text-muted-foreground [&:not(:first-child)]:mt-4" {...props} />,
  a: ({ href, children, ...props }) => {
    if (href?.startsWith("/")) {
      return (
        <Link to={href} className="font-medium text-foreground underline-offset-4 hover:underline" {...props}>
          {children}
        </Link>
      );
    }
    return (
      <a
        href={href}
        className="font-medium text-foreground underline-offset-4 hover:underline"
        target={href?.startsWith("http") ? "_blank" : undefined}
        rel={href?.startsWith("http") ? "noreferrer" : undefined}
        {...props}
      >
        {children}
      </a>
    );
  },
  ul: (props) => <ul className="my-4 ml-6 list-disc space-y-2 text-muted-foreground" {...props} />,
  ol: (props) => <ol className="my-4 ml-6 list-decimal space-y-2 text-muted-foreground" {...props} />,
  li: (props) => <li className="leading-7" {...props} />,
  blockquote: (props) => (
    <blockquote className="mt-4 border-l-2 border-border pl-4 italic text-muted-foreground" {...props} />
  ),
  hr: (props) => <hr className="my-8 border-border" {...props} />,
  table: (props) => (
    <div className="my-6 w-full overflow-x-auto">
      <table className="w-full border-collapse text-sm" {...props} />
    </div>
  ),
  th: (props) => (
    <th className="border-b border-border px-3 py-2 text-left font-semibold text-foreground" {...props} />
  ),
  td: (props) => <td className="border-b border-border px-3 py-2 text-muted-foreground" {...props} />,
  tr: (props) => <tr className="even:bg-muted/30" {...props} />,
  pre: ({ className, ...props }) => (
    <pre
      className={cn(
        "my-4 overflow-x-auto rounded-lg border border-border bg-muted p-4 text-[0.8125rem] leading-relaxed",
        className,
      )}
      {...props}
    />
  ),
  code: ({ className, ...props }) => {
    const isBlock = className?.includes("language-");
    if (isBlock) {
      return <code className={cn("font-mono", className)} {...props} />;
    }
    return (
      <code
        className={cn(
          "rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em] text-foreground",
          className,
        )}
        {...props}
      />
    );
  },
  strong: (props) => <strong className="font-semibold text-foreground" {...props} />,
  img: (props) => (
    // eslint-disable-next-line jsx-a11y/alt-text -- MDX authors supply alt
    <img className="my-4 rounded-lg border border-border" {...props} />
  ),
};
