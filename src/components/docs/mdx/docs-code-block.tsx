import { Suspense, type ComponentProps, type ReactNode } from "react";
import { useShiki } from "fumadocs-core/highlight/client";
import { ScrollArea, cn } from "@nqlib/nqui";

type DocsCodeBlockProps = {
  code: string;
  /** Shiki language id — shell/bash for CLI, tsx/ts for snippets. */
  lang?: string;
  className?: string;
};

function DocsPre({ className, ...props }: ComponentProps<"pre">) {
  return (
    <ScrollArea
      orientation="horizontal"
      fadeMask={false}
      className="w-full max-w-full"
    >
      <pre
        {...props}
        className={cn(
          "shiki m-0 bg-transparent p-3 font-mono text-[0.8125rem] leading-relaxed whitespace-pre",
          className,
        )}
      />
    </ScrollArea>
  );
}

function HighlightedCode({ code, lang }: { code: string; lang: string }) {
  return useShiki(code, {
    lang,
    components: {
      pre: DocsPre,
    },
  });
}

function PlainFallback({ code }: { code: string }) {
  return (
    <DocsPre>
      <code>{code}</code>
    </DocsPre>
  );
}

/**
 * Fumadocs-style Shiki code block (client). Dual theme via `--shiki-light` / `--shiki-dark`.
 */
export function DocsCodeBlock({ code, lang = "bash", className }: DocsCodeBlockProps): ReactNode {
  const trimmed = code.replace(/\n$/, "");

  return (
    <div
      className={cn(
        "docs-codeblock my-2 w-full max-w-full overflow-hidden rounded-lg border border-border bg-muted",
        className,
      )}
    >
      <Suspense fallback={<PlainFallback code={trimmed} />}>
        <HighlightedCode code={trimmed} lang={lang} />
      </Suspense>
    </div>
  );
}
