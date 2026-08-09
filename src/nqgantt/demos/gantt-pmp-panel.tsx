/**
 * PMP control panel — the acceptance surface for nqgantt 0.4.0.
 *
 * Four things are being proven here, and each one is only convincing as a
 * before/after:
 *
 *   1. **Baseline integrity** — capture a PMB, then raise a task's budget by
 *      50 %. The baselined CPI must NOT move; toggle the baseline off and it
 *      does. That difference is the whole workstream.
 *   2. **Actuals provenance** — log hours and watch AC come from the log
 *      rather than from a number somebody typed.
 *   3. **Resource truth** — give someone leave, then level, and watch their
 *      task step over the absence instead of into it.
 *   4. **Interop** — export MSPDI, re-import, get the same schedule back.
 *
 * This is a testing surface, not product: it composes engine functions the
 * library exports and holds its own state. Nothing here is logic the library
 * should have shipped.
 */
import { useMemo, useState } from "react";
import {
  Badge,
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  cn,
} from "@nqlib/nqui";
import {
  applyActualsToFeatures,
  appendWorklog,
  captureBaselineSet,
  computeEVMForecast,
  DEFAULT_WORKING_CALENDAR,
  exportMSProjectXML,
  importMSProjectXML,
  levelResources,
  rollupActuals,
  type BaselineSet,
  type GanttDependency,
  type GanttFeature,
  type MSProjectImportResult,
  type ResourceCalendar,
  type WorklogEntry,
  type WorkloadScheme,
} from "@nqlib/nqgantt";
import { TEAM } from "../../lib/mock/ops";

/** Hourly rates for the demo roster — the log needs something to cost against. */
const RATES = new Map(TEAM.map((p, i) => [p.id, 90 + i * 15]));

export interface GanttPmpPanelProps {
  features: GanttFeature[];
  dependencies: GanttDependency[];
  /** Applied when leveling or importing writes a new schedule back. */
  onFeaturesChange?: (features: GanttFeature[]) => void;
  /** Applied when an import brings its own links — otherwise they are parsed and thrown away. */
  onDependenciesChange?: (deps: GanttDependency[]) => void;
  className?: string;
}

const todayIso = () => new Date().toISOString().slice(0, 10);

export function GanttPmpPanel({
  features,
  dependencies,
  onFeaturesChange,
  onDependenciesChange,
  className,
}: GanttPmpPanelProps) {
  const [baselines, setBaselines] = useState<BaselineSet[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [useBaseline, setUseBaseline] = useState(true);
  const [worklog, setWorklog] = useState<WorklogEntry[]>([]);
  const [absentId, setAbsentId] = useState<string>(TEAM[0]?.id ?? "");
  const [absenceFrom, setAbsenceFrom] = useState(todayIso());
  const [absenceTo, setAbsenceTo] = useState(todayIso());
  const [absences, setAbsences] = useState<ResourceCalendar[]>([]);
  const [schemes, setSchemes] = useState<WorkloadScheme[]>([]);
  const [imported, setImported] = useState<MSProjectImportResult | null>(null);

  const active = useMemo(
    () => baselines.find((b) => b.id === activeId),
    [baselines, activeId],
  );

  /**
   * Actuals are folded in BEFORE the metrics run, so AC is derived from the
   * log for every task that has entries. Tasks with none keep whatever
   * `actualCost` the fixture carries.
   */
  const measured = useMemo(
    () => applyActualsToFeatures(features, worklog, { rates: RATES }),
    [features, worklog],
  );

  const forecast = useMemo(
    () =>
      computeEVMForecast(
        measured,
        new Date(),
        useBaseline && active ? { baseline: active } : {},
      ),
    [measured, useBaseline, active],
  );

  const logTotals = useMemo(
    () => rollupActuals(worklog, { rates: RATES }),
    [worklog],
  );

  const captureBaseline = () => {
    const n = baselines.length + 1;
    const set = captureBaselineSet(features, {
      id: `pmb-${n}`,
      label: n === 1 ? "PMB" : `Baseline ${n}`,
      capturedAt: new Date(),
    });
    setBaselines((prev) => [...prev, set]);
    setActiveId(set.id);
  };

  const logHours = (taskId: string, assigneeId: string, hours: number) => {
    const result = appendWorklog(worklog, {
      id: `w-${worklog.length + 1}`,
      taskId,
      assigneeId,
      date: todayIso(),
      hours,
    });
    if (result.ok) setWorklog(result.log);
  };

  const addAbsence = () => {
    setAbsences((prev) => {
      const existing = prev.find((rc) => rc.assigneeId === absentId);
      const absence = { from: absenceFrom, to: absenceTo, label: "PTO" };
      return existing
        ? prev.map((rc) =>
            rc.assigneeId === absentId
              ? { ...rc, absences: [...rc.absences, absence] }
              : rc,
          )
        : [...prev, { assigneeId: absentId, absences: [absence] }];
    });
  };

  const levelWithAvailability = () => {
    if (!onFeaturesChange) return;
    onFeaturesChange(
      levelResources(features, DEFAULT_WORKING_CALENDAR, 50, {
        resourceCalendars: absences,
        schemes,
      }),
    );
  };

  const exportXml = () => {
    const xml = exportMSProjectXML(features, dependencies, {
      projectName: "nqgantt Roadmap",
      baseline: active,
      // Without this the exporter emits no <Resources>, and the round-trip
      // report below always reads "0 resources" — the demo understating its
      // own interop.
      assignees: TEAM.map((p) => ({ id: p.id, name: p.name })),
    });
    const blob = new Blob([xml], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "roadmap.xml";
    a.click();
    URL.revokeObjectURL(url);
    // Round-trip immediately so the panel can report what survived.
    setImported(importMSProjectXML(xml));
  };

  const importXml = async (file: File) => {
    setImported(importMSProjectXML(await file.text()));
  };

  const firstTask = features.find((f) => !f.isMilestone);

  return (
    <div className={cn("space-y-4 rounded-lg border bg-card p-4 text-sm", className)}>
      <header className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">PMP controls</h3>
          <p className="text-xs text-muted-foreground">
            Baseline, actuals, availability and MS Project interop.
          </p>
        </div>
        <Badge variant="outline" className="text-[10px]">
          nqgantt 0.4.0
        </Badge>
      </header>

      <Separator />

      {/* 1 — Baseline integrity ------------------------------------------- */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium">1 · Performance measurement baseline</Label>
          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={captureBaseline}>
            Capture baseline
          </Button>
        </div>

        {baselines.length > 0 ? (
          <div className="flex items-center gap-2">
            <Select value={activeId} onValueChange={setActiveId}>
              <SelectTrigger className="h-7 flex-1 text-xs">
                <SelectValue placeholder="No baseline" />
              </SelectTrigger>
              <SelectContent>
                {baselines.map((b) => (
                  <SelectItem key={b.id} value={b.id} className="text-xs">
                    {b.label} · {b.records.size} tasks
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <label className="flex cursor-pointer items-center gap-1.5 text-[11px]">
              <input
                type="checkbox"
                checked={useBaseline}
                onChange={(e) => setUseBaseline(e.target.checked)}
                className="h-3 w-3"
              />
              Measure against it
            </label>
          </div>
        ) : (
          <p className="text-[11px] text-muted-foreground">
            Capture one, then change a budget in the sidebar. CPI should not move.
          </p>
        )}

        <div className="grid grid-cols-4 gap-2">
          <Tile label="PV" value={forecast.pv} />
          <Tile label="EV" value={forecast.ev} />
          <Tile label="AC" value={forecast.ac} />
          <Tile label="BAC" value={forecast.bac} />
          <Tile label="CPI" value={forecast.cpi} precision={2} tone={forecast.cpi >= 1 ? "good" : "bad"} />
          <Tile label="SPI" value={forecast.spi} precision={2} tone={forecast.spi >= 1 ? "good" : "bad"} />
          <Tile label="EAC" value={forecast.eac} />
          <Tile label="VAC" value={forecast.vac} tone={forecast.vac >= 0 ? "good" : "bad"} />
        </div>

        {forecast.scopeChangeTaskIds.length > 0 ? (
          <p className="rounded-md bg-amber-500/10 px-2 py-1 text-[11px] text-amber-700 dark:text-amber-400">
            {forecast.scopeChangeTaskIds.length} task
            {forecast.scopeChangeTaskIds.length === 1 ? "" : "s"} added after this baseline —
            their cost is charged but sits outside BAC.
          </p>
        ) : null}
      </section>

      <Separator />

      {/* 2 — Actuals provenance ------------------------------------------- */}
      <section className="space-y-2">
        <Label className="text-xs font-medium">2 · Worklog</Label>
        {firstTask ? (
          <div className="flex flex-wrap items-center gap-1.5">
            {[2, 4, 8].map((h) => (
              <Button
                key={h}
                size="sm"
                variant="outline"
                className="h-7 text-xs"
                onClick={() => logHours(firstTask.id, TEAM[0]!.id, h)}
              >
                Log {h}h on “{firstTask.name}”
              </Button>
            ))}
            {worklog.length > 0 ? (
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs"
                onClick={() => setWorklog([])}
              >
                Clear
              </Button>
            ) : null}
          </div>
        ) : null}
        <p className="text-[11px] text-muted-foreground">
          {logTotals.entryCount} entries · {logTotals.actualHours}h ·{" "}
          {logTotals.actualCost.toLocaleString(undefined, {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 0,
          })}{" "}
          — AC above is derived from these, not typed.
        </p>
      </section>

      <Separator />

      {/* 3 — Resource availability ---------------------------------------- */}
      <section className="space-y-2">
        <Label className="text-xs font-medium">3 · Availability</Label>
        <div className="flex flex-wrap items-end gap-1.5">
          <Select value={absentId} onValueChange={setAbsentId}>
            <SelectTrigger className="h-7 w-32 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TEAM.map((p) => (
                <SelectItem key={p.id} value={p.id} className="text-xs">
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="date"
            value={absenceFrom}
            onChange={(e) => setAbsenceFrom(e.target.value)}
            className="h-7 w-32 text-xs"
          />
          <Input
            type="date"
            value={absenceTo}
            onChange={(e) => setAbsenceTo(e.target.value)}
            className="h-7 w-32 text-xs"
          />
          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={addAbsence}>
            Add leave
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs"
            onClick={() => {
              // Mon/Wed/Fri half days — the other half of per-resource
              // availability, and the case a plain absence never exercises.
              const id = `mwf-${absentId}`;
              setSchemes((prev) =>
                prev.some((s) => s.id === id)
                  ? prev
                  : [...prev, {
                      id,
                      title: "Mon/Wed/Fri",
                      hoursByWeekday: { 1: 4, 3: 4, 5: 4 },
                    }],
              );
              setAbsences((prev) => {
                const existing = prev.find((rc) => rc.assigneeId === absentId);
                return existing
                  ? prev.map((rc) =>
                      rc.assigneeId === absentId ? { ...rc, schemeId: id } : rc,
                    )
                  : [...prev, { assigneeId: absentId, schemeId: id, absences: [] }];
              });
            }}
          >
            Make part-time
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs"
            disabled={!onFeaturesChange}
            onClick={levelWithAvailability}
          >
            Level
          </Button>
        </div>
        {absences.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {absences.flatMap((rc) =>
              rc.absences.map((a, i) => (
                <Badge key={`${rc.assigneeId}-${i}`} variant="outline" className="text-[10px]">
                  {TEAM.find((p) => p.id === rc.assigneeId)?.name ?? rc.assigneeId}: {a.from} →{" "}
                  {a.to}
                </Badge>
              )),
            )}
          </div>
        ) : (
          <p className="text-[11px] text-muted-foreground">
            Add leave, then Level — the task steps over the absence, not into it.
          </p>
        )}
      </section>

      <Separator />

      {/* 4 — MS Project interop ------------------------------------------- */}
      <section className="space-y-2">
        <Label className="text-xs font-medium">4 · MS Project (MSPDI)</Label>
        <div className="flex flex-wrap items-center gap-1.5">
          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={exportXml}>
            Export .xml
          </Button>
          <label className="inline-flex h-7 cursor-pointer items-center rounded-md border px-2 text-xs hover:bg-accent">
            Import .xml
            <input
              type="file"
              accept=".xml,text/xml,application/xml"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void importXml(file);
                e.target.value = "";
              }}
            />
          </label>
          {imported && onFeaturesChange ? (
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              onClick={() => {
                onFeaturesChange(imported.features);
                onDependenciesChange?.(imported.dependencies);
                if (imported.baseline) {
                  setBaselines((prev) => [...prev, imported.baseline!]);
                  setActiveId(imported.baseline.id);
                }
              }}
            >
              Apply {imported.features.length} tasks
              {imported.dependencies.length > 0
                ? ` + ${imported.dependencies.length} links`
                : ""}
            </Button>
          ) : null}
        </div>
        {imported ? (
          <div className="space-y-1">
            <p className="text-[11px] text-muted-foreground">
              {imported.features.length} tasks · {imported.dependencies.length} links ·{" "}
              {imported.assignees.length} resources
              {imported.baseline ? ` · baseline (${imported.baseline.records.size})` : ""}
            </p>
            {imported.warnings.length > 0 ? (
              <ul className="max-h-24 space-y-0.5 overflow-y-auto rounded-md bg-muted/50 p-1.5">
                {imported.warnings.map((w, i) => (
                  <li key={i} className="text-[10px] text-muted-foreground">
                    {w.scope ? <span className="font-medium">{w.scope}: </span> : null}
                    {w.message}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400">
                Round-tripped with no warnings.
              </p>
            )}
          </div>
        ) : null}
      </section>
    </div>
  );
}

function Tile({
  label,
  value,
  precision = 0,
  tone,
}: {
  label: string;
  value: number;
  precision?: number;
  tone?: "good" | "bad";
}) {
  return (
    <div className="rounded-md border px-2 py-1.5">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div
        className={cn(
          "font-mono text-xs tabular-nums",
          tone === "good" && "text-emerald-600 dark:text-emerald-400",
          tone === "bad" && "text-destructive",
        )}
      >
        {value.toLocaleString(undefined, {
          minimumFractionDigits: precision,
          maximumFractionDigits: precision,
        })}
      </div>
    </div>
  );
}
