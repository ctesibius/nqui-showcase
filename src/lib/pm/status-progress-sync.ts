/**
 * Pure status ↔ progress sync for showcase PM rows.
 *
 * Default (`direction: "to-progress"`):
 * - status → done ⇒ progress = 100
 * - progress → 100 ⇒ status unchanged
 * - leaving done ⇒ progress left alone (do not auto-lower)
 * - progress drops below 100 while done ⇒ status left alone
 *
 * Opt-in (`direction: "both"`):
 * - progress → 100 ⇒ status = doneStatus
 * - progress drops below 100 while done ⇒ status = statusWhenProgressLeavesDone
 *   only when that option is set; otherwise status stays done
 */

export type StatusProgressSyncDirection = "to-progress" | "both";

export type StatusProgressSyncOptions = {
  /** Status ids treated as done. Default: `["done"]`. */
  doneStatusIds?: readonly string[];
  /** Overrides `doneStatusIds` when provided. */
  isDone?: (status: string) => boolean;
  /**
   * Sync direction. Default `"to-progress"` (status→done bumps progress only).
   * Pass `"both"` to also map progress→100 onto a done status.
   */
  direction?: StatusProgressSyncDirection;
  /**
   * Canonical done status written when `direction: "both"` and progress hits 100.
   * Defaults to `doneStatusIds[0]` or `"done"`.
   */
  doneStatus?: string;
  /**
   * When `direction: "both"` and progress falls below 100 while status is done,
   * set status to this id (e.g. `"in_progress"`). Default: leave status alone.
   */
  statusWhenProgressLeavesDone?: string;
};

export type StatusProgressChange = {
  status?: string;
  progress?: number;
};

export type StatusProgressFields = {
  status: string;
  progress: number;
};

function resolveIsDone(options: StatusProgressSyncOptions): (status: string) => boolean {
  if (options.isDone) return options.isDone;
  const ids = options.doneStatusIds ?? ["done"];
  const set = new Set(ids);
  return (status) => set.has(status);
}

function resolveDoneStatus(options: StatusProgressSyncOptions): string {
  return options.doneStatus ?? options.doneStatusIds?.[0] ?? "done";
}

/**
 * Apply a status and/or progress change with showcase sync policy.
 * Returns the same object when nothing changes (referential equality).
 */
export function applyStatusProgressSync<T extends StatusProgressFields>(
  task: T,
  change: StatusProgressChange,
  options: StatusProgressSyncOptions = {},
): T {
  const direction = options.direction ?? "to-progress";
  const isDone = resolveIsDone(options);
  const doneStatus = resolveDoneStatus(options);

  let status = change.status !== undefined ? change.status : task.status;
  let progress = change.progress !== undefined ? change.progress : task.progress;

  const statusChanged = change.status !== undefined && change.status !== task.status;
  const progressChanged =
    change.progress !== undefined && change.progress !== task.progress;

  // Default + both: marking done completes progress.
  if (statusChanged && isDone(status)) {
    progress = 100;
  }
  // Leaving done: do not auto-lower progress (keep `progress` from change or task).

  if (direction === "both" && progressChanged) {
    if (progress >= 100) {
      progress = 100;
      if (!isDone(status)) status = doneStatus;
    } else if (
      isDone(status) &&
      options.statusWhenProgressLeavesDone != null
    ) {
      // Opt-in only — default leaves done status when progress drops.
      status = options.statusWhenProgressLeavesDone;
    }
  }

  if (status === task.status && progress === task.progress) return task;
  return { ...task, status, progress };
}

/**
 * Single-field write for editors (`setTaskValue` paths). Non status/progress
 * fields pass through unchanged; status/progress go through the sync helper.
 */
export function patchPmIssueField<T extends StatusProgressFields>(
  task: T,
  field: string,
  raw: unknown,
  options?: StatusProgressSyncOptions,
): T {
  if (field === "status") {
    return applyStatusProgressSync(task, { status: String(raw) }, options);
  }
  if (field === "progress") {
    const n = typeof raw === "number" ? raw : Number(raw);
    if (!Number.isFinite(n)) {
      return { ...task, [field]: raw } as T;
    }
    return applyStatusProgressSync(task, { progress: n }, options);
  }
  if ((task as Record<string, unknown>)[field] === raw) return task;
  return { ...task, [field]: raw } as T;
}
