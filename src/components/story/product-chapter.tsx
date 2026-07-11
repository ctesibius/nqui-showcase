import { Suspense, lazy, useRef } from "react";
import { Skeleton } from "@nqlib/nqui";
import { Chapter, DemoFrame } from "./chapter";
import { useLazyMount } from "./scroll-hooks";

// Both surfaces pull @nqlib/nqchart (echarts) — keep them out of the entry chunk
// and mount as the chapter nears the viewport.
const DealRecord = lazy(() => import("./deal-record").then((m) => ({ default: m.DealRecord })));
const AccountsConsole = lazy(() =>
  import("./accounts-console").then((m) => ({ default: m.AccountsConsole })),
);

function SurfaceSkeleton({ height }: { height: string }) {
  return <Skeleton className={`w-full rounded-none ${height}`} />;
}

/** Mono "bill of materials" caption under a surface — reinforces "real parts". */
function BuiltWith({ nqui, nqchart }: { nqui: string; nqchart: string }) {
  return (
    <p className="mt-3 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center font-mono text-[11px] text-muted-foreground">
      <span className="font-medium text-foreground/70">nqui</span> {nqui}
      <span aria-hidden className="text-border">•</span>
      <span className="font-medium text-foreground/70">nqchart</span> {nqchart}
    </p>
  );
}

export function ProductChapter() {
  const dealRef = useRef<HTMLDivElement>(null);
  const consoleRef = useRef<HTMLDivElement>(null);
  const dealIn = useLazyMount(dealRef);
  const consoleIn = useLazyMount(consoleRef);

  return (
    <Chapter
      id="product"
      eyebrow="nqlib in production — enterprise CRM"
      headline="Components become software."
      lede="No mockups. A deal record and a pipeline console, each assembled entirely from nqui and nqchart — the destination first, then the deep dive on every library that builds it."
      align="center"
    >
      <DemoFrame title="Deals — Northwind Logistics">
        <div ref={dealRef}>
          {dealIn ? (
            <Suspense fallback={<SurfaceSkeleton height="h-[560px]" />}>
              <DealRecord />
            </Suspense>
          ) : (
            <SurfaceSkeleton height="h-[560px]" />
          )}
        </div>
      </DemoFrame>
      <BuiltWith nqui="Badge · Avatar · Button · Separator" nqchart="Sparkline" />

      <DemoFrame title="Pipeline — Accounts">
        <div ref={consoleRef}>
          {consoleIn ? (
            <Suspense fallback={<SurfaceSkeleton height="h-[520px]" />}>
              <AccountsConsole />
            </Suspense>
          ) : (
            <SurfaceSkeleton height="h-[520px]" />
          )}
        </div>
      </DemoFrame>
      <BuiltWith nqui="Table · Checkbox · ToggleGroup · InputGroup · Badge" nqchart="Funnel" />
    </Chapter>
  );
}
