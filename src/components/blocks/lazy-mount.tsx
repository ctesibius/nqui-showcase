import { Suspense, useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Docs-app pattern (nqchart LazyMount): defer heavy chart mounts until the
 * card is near the viewport. Mounting 14 ECharts instances at once floods
 * zrender animation and breaks hover (stuck tooltip / pie glitter).
 */
export function LazyMount({
  children,
  fallback = null,
  rootMargin = "300px 0px",
  className,
}: {
  children: ReactNode;
  fallback?: ReactNode;
  rootMargin?: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (visible) return;
    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === "undefined") {
      queueMicrotask(() => setVisible(true));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [visible, rootMargin]);

  return (
    <div ref={ref} className={className ?? "size-full"}>
      {visible ? <Suspense fallback={fallback}>{children}</Suspense> : fallback}
    </div>
  );
}
