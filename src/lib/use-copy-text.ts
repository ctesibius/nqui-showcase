import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Copy text on a click, with a short "copied" state for the label.
 * Falls back to a selection-based copy when the Clipboard API is denied
 * (embedded panes), which only needs the click gesture we already have.
 */
export function useCopyText(resetMs = 2000) {
  const [copied, setCopied] = useState<string | null>(null);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = useCallback(
    async (text: string) => {
      let ok = false;
      try {
        await navigator.clipboard.writeText(text);
        ok = true;
      } catch {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        try {
          ok = document.execCommand("copy");
        } finally {
          ta.remove();
        }
      }
      if (!ok) return;
      setCopied(text);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(null), resetMs);
    },
    [resetMs],
  );

  return { copied, copy };
}
