import { useCallback, useMemo, useState } from "react";
import { GanttRoot } from "@nqlib/nqgantt/ui";
import { captureBaselineSet, computeEVMForecast } from "@nqlib/nqgantt";
import type { BaselineSet } from "@nqlib/nqgantt";
import { ExampleControls, ExampleFrame, NAME_ONLY_COLUMNS, STATUS, Tile, day, feature } from "./shared";
import { Button } from "@nqlib/nqui";

const INITIAL = [
  feature("a", "Foundations", -21, -10, {
    progress: 100, status: STATUS.done, budget: 40000, actualCost: 44000,
  }),
  feature("b", "Structure", -7, 11, {
    progress: 60, status: STATUS.doing, budget: 80000, actualCost: 52000,
  }),
  feature("c", "Fit-out", 14, 32, { progress: 10, budget: 30000, actualCost: 4000 }),
];

/** Mid-flight: work behind us, work running, work ahead. */
const AS_OF = day(2);

export default function ExEarnedValue() {
  const [features, setFeatures] = useState(INITIAL);
  const [baseline, setBaseline] = useState<BaselineSet | null>(null);
  const [measure, setMeasure] = useState(true);

  const evm = useMemo(
    () => computeEVMForecast(features, AS_OF, measure && baseline ? { baseline } : {}),
    [features, baseline, measure],
  );

  const capture = useCallback(() => {
    setBaseline(
      captureBaselineSet(features, { id: "pmb", label: "PMB", capturedAt: day(-28) }),
    );
  }, [features]);

  const inflate = useCallback(() => {
    setFeatures((prev) =>
      prev.map((f) => (f.id === "b" ? { ...f, budget: (f.budget ?? 0) + 60000 } : f)),
    );
  }, []);

  return (
    <ExampleFrame>
      <ExampleControls
        hint={
          baseline
            ? measure
              ? "Measured against the approved plan. Raising a budget does not move BAC — that is what makes the number defensible."
              : "Measuring against live values. BAC and CPI follow whatever the budget happens to be today."
            : "Capture a baseline, then raise a budget by 60k and watch what stays still."
        }
      >
        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={capture}>
          1 · Capture baseline
        </Button>
        <Button size="sm" variant="outline" className="h-7 text-xs" disabled={!baseline} onClick={inflate}>
          2 · Raise a budget by 60k
        </Button>
        <label className="flex cursor-pointer items-center gap-1.5 text-xs">
          <input
            type="checkbox"
            checked={measure}
            disabled={!baseline}
            onChange={(e) => setMeasure(e.target.checked)}
            className="h-3 w-3"
          />
          3 · Measure against it
        </label>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 text-xs"
          onClick={() => { setFeatures(INITIAL); setBaseline(null); setMeasure(true); }}
        >
          Reset
        </Button>
      </ExampleControls>

      <div className="grid grid-cols-3 gap-2 pb-3 sm:grid-cols-6">
        <Tile label="BAC" value={evm.bac} />
        <Tile label="PV" value={evm.pv} />
        <Tile label="EV" value={evm.ev} />
        <Tile label="AC" value={evm.ac} />
        <Tile label="CPI" value={evm.cpi} precision={2} tone={evm.cpi >= 1 ? "good" : "bad"} />
        <Tile label="SPI" value={evm.spi} precision={2} tone={evm.spi >= 1 ? "good" : "bad"} />
      </div>

      <GanttRoot
        className="min-h-0 flex-1"
        data={{ features, dependencies: [] }}
        defaultRange="weekly"
        visibleColumnIds={NAME_ONLY_COLUMNS}
        sidebarWidth={150}
      />
    </ExampleFrame>
  );
}
