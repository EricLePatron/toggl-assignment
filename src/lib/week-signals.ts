/**
 * Shared week-signal logic used by both the Calendar week status bar and the
 * the Optimize page, so the two can never disagree.
 */
import { useSyncExternalStore } from "react";
import {
  currentUser,
  formatHours,
  plannedEntries,
  projectById,
  tasks,
  taskById,
  timeEntries,
  TODAY,
  NOW_HOUR,
  WEEKLY_CAPACITY,
  type WeekView,
} from "@/data/fixtures";


/* ---------------- estimate overrides (client-side, in-memory) ------------- */

const overrides = new Map<string, number>();
const completedEstimateUpdates = new Map<
  string,
  { from: number | null; to: number }
>();
const listeners = new Set<() => void>();
let version = 0;

/**
 * Updates a task's estimate. Mocked: lives in memory only and is reset on
 * page reload. The task object itself is patched so every screen (Tasks,
 * Project detail, Calendar) shows the new value.
 */
export function setTaskEstimate(
  taskId: string,
  hours: number,
  options?: { syncPlannedDuration?: boolean; freezeConfirmation?: boolean },
) {
  const task = taskById(taskId);
  const previous = taskEstimate(taskId, task?.estimateHours ?? null);
  overrides.set(taskId, hours);
  if (task) {
    task.estimateHours = hours;
    task.estimate = formatHours(hours);
    task.delta = Math.round((task.tracked - hours) * 4) / 4;
    task.ratio = task.tracked / hours;
    if (options?.syncPlannedDuration) task.plannedHours = hours;
  }
  if (options?.syncPlannedDuration) {
    const blocks = plannedEntries.filter((entry) => entry.taskId === taskId);
    const originalTotal = blocks.reduce((sum, entry) => sum + entry.duration, 0);
    if (blocks.length === 1) {
      const block = blocks[0];
      if (block) {
        block.duration = hours;
        block.end = block.start + hours;
      }
    } else if (blocks.length > 1 && originalTotal > 0) {
      let remaining = hours;
      blocks.forEach((block, index) => {
        const duration =
          index === blocks.length - 1
            ? remaining
            : Math.round(((hours * block.duration) / originalTotal) * 4) / 4;
        block.duration = duration;
        block.end = block.start + duration;
        remaining -= duration;
      });
    }
  }
  if (options?.freezeConfirmation) {
    completedEstimateUpdates.set(taskId, { from: previous, to: hours });
  }
  version++;
  listeners.forEach((l) => l());
}

export function completedEstimateUpdate(taskId: string) {
  return completedEstimateUpdates.get(taskId) ?? null;
}

/* ---------------- overrun resolutions (client-side, in-memory) ------------ */

/* ---------------- scope creep resolutions (client-side, in-memory) -------- */

export type ScopeCreepResolution = {
  action: "estimated" | "kept";
  /** Estimate set when action is "estimated". */
  to: number | null;
};

const resolvedScopeCreep = new Map<string, ScopeCreepResolution>();

/**
 * Resolves a scope creep signal: either an estimate is added to the task, or
 * the off-scope work is accepted as-is. Mocked: lives in memory only and is
 * reset on page reload. A resolved task no longer counts in the week status
 * bar, but the Optimize card keeps showing it with a confirmation state.
 */
export function resolveScopeCreep(
  taskId: string,
  action: "estimated" | "kept",
  hours?: number,
) {
  if (action === "estimated" && hours != null && Number.isFinite(hours) && hours > 0) {
    setTaskEstimate(taskId, hours);
  }
  resolvedScopeCreep.set(taskId, {
    action,
    to: action === "estimated" ? (hours ?? null) : null,
  });
  version++;
  listeners.forEach((l) => l());
}

export function scopeCreepResolution(taskId: string) {
  return resolvedScopeCreep.get(taskId) ?? null;
}

export type OverrunResolution = {
  action: "updated" | "kept";
  /** Estimate before the resolution (null when the task had none). */
  from: number | null;
  /** New estimate when action is "updated". */
  to: number | null;
};

const resolvedOverruns = new Map<string, OverrunResolution>();

/**
 * Resolves an overrun signal: either the initial estimate is updated to a new
 * value, or the overrun is accepted as-is. Mocked: lives in memory only and is
 * reset on page reload. A resolved task no longer counts in the week status
 * bar, but the Optimize card keeps showing it with a confirmation state.
 */
export function resolveOverrun(
  taskId: string,
  action: "updated" | "kept",
  hours?: number,
) {
  const task = taskById(taskId);
  const from = task ? taskEstimate(taskId, task.estimateHours) : null;
  if (action === "updated" && hours != null && Number.isFinite(hours) && hours > 0) {
    setTaskEstimate(taskId, hours);
  }
  resolvedOverruns.set(taskId, {
    action,
    from,
    to: action === "updated" ? (hours ?? null) : null,
  });
  version++;
  listeners.forEach((l) => l());
}

export function overrunResolution(taskId: string) {
  return resolvedOverruns.get(taskId) ?? null;
}

/* ---------------- capacity resolutions (client-side, in-memory) ----------- */

export type CapacityResolution = {
  action: "moved" | "kept";
  taskName: string | null;
  hours: number;
  committed: number;
  overage: number;
  targetDate: string | null;
  targetStart: number | null;
};

/** Keyed by week start (YYYY-MM-DD). */
const resolvedCapacity = new Map<string, CapacityResolution>();

/**
 * Resolves an over-capacity signal for a week: either the suggested task was
 * moved to next week, or the overage was accepted as-is. Mocked: lives in
 * memory only and is reset on page reload. A resolved week no longer counts
 * in the week status bar, but the Optimize card keeps showing a frozen
 * confirmation state.
 */
export function resolveCapacity(weekFrom: string, resolution: CapacityResolution) {
  resolvedCapacity.set(weekFrom, resolution);
  version++;
  listeners.forEach((l) => l());
}

export function capacityResolution(week: WeekView) {
  return resolvedCapacity.get(week.from) ?? null;
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

/** Re-renders consumers whenever an estimate override is added. */
export function useEstimateOverrides() {
  return useSyncExternalStore(
    subscribe,
    () => version,
    () => version,
  );
}

export function taskEstimate(taskId: string, base: number | null): number | null {
  return overrides.get(taskId) ?? base;
}

/* ---------------- signals ------------------------------------------------- */

export type ScopeCreepTask = {
  taskId: string;
  taskName: string;
  projectId: string;
  projectName: string;
  client: string | null;
  hours: number;
  rate: number | null;
  amount: number | null;
  resolved: ScopeCreepResolution | null;
};

const iso = (date: Date) => date.toISOString().slice(0, 10);

/** Entry counts only if its end time is in the past relative to the in-app "now". */
export const isPastEntry = (e: { date: string; end: number }) =>
  e.date < iso(TODAY) || (e.date === iso(TODAY) && e.end <= NOW_HOUR);

export function loggedEntriesForWeek(week: WeekView) {
  return timeEntries.filter(
    (e) => e.date >= week.from && e.date <= week.to && isPastEntry(e),
  );
}

/** Scope creep, per qualifying task, for the week in view. Planned time excluded. */
export function scopeCreepTasks(week: WeekView, includeResolved = false): ScopeCreepTask[] {
  const logged = loggedEntriesForWeek(week);
  const rows: ScopeCreepTask[] = [];
  for (const t of tasks) {
    const resolution = resolvedScopeCreep.get(t.id) ?? null;
    if (resolution && !includeResolved) continue;
    if (!resolution && taskEstimate(t.id, t.estimateHours) != null) continue;
    const project = projectById(t.projectId);
    if (!project || t.createdAt <= project.startDate) continue;
    const hours = logged
      .filter((e) => e.taskId === t.id)
      .reduce((s, e) => s + e.duration, 0);
    if (hours <= 0) continue;
    rows.push({
      taskId: t.id,
      taskName: t.name,
      projectId: project.id,
      projectName: project.name,
      client: project.client,
      hours,
      rate: project.rate ?? null,
      amount: project.rate != null ? hours * project.rate : null,
      resolved: resolution,
    });
  }
  return rows.sort((a, b) => b.hours - a.hours);
}

export type OverrunRepeat = {
  taskId: string;
  taskName: string;
  date: string;
  start: number;
  end: number;
  plannedHours: number;
  estimate: number | null;
  suggestedEstimate: number;
  status: import("@/data/fixtures").TaskStatus;
  priority: import("@/data/fixtures").Priority;
  tag: string | null;
};

export type OverrunTask = {
  taskId: string;
  taskName: string;
  projectId: string;
  projectName: string;
  projectColor: import("@/data/fixtures").ProjectColor;
  client: string | null;
  rate: number | null;
  tag: string | null;
  status: import("@/data/fixtures").TaskStatus;
  priority: import("@/data/fixtures").Priority;
  logged: number;
  estimate: number;
  overHours: number;
  overPct: number;
  overCost: number | null;
  repeat: OverrunRepeat | null;
  resolved: OverrunResolution | null;
};

/** Base name shared by a task and its follow-up ("X — phase 2" → "X"). */
const baseName = (name: string) => name.split(" — ")[0]!.trim().toLowerCase();

/** Same task planned again later: a future planned task with the same base name. */
function findRepeat(source: {
  id: string;
  projectId: string;
  name: string;
  loggedRatio: number;
}): OverrunRepeat | null {
  for (const t of tasks) {
    if (t.id === source.id) continue;
    if (t.projectId !== source.projectId) continue;
    if (baseName(t.name) !== baseName(source.name)) continue;
    const blocks = plannedEntries
      .filter((e) => e.taskId === t.id)
      .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : a.start - b.start));
    if (blocks.length === 0) continue;
    const first = blocks[0]!;
    const last = blocks[blocks.length - 1]!;
    const plannedHours = blocks.reduce((s, e) => s + e.duration, 0);
    const estimate = taskEstimate(t.id, t.estimateHours);
    // Observed ratio applied to the current estimate, plus a 30-min safety
    // buffer, rounded up to the full hour (5h × 1.6 = 8h → 9h).
    const suggested = Math.ceil((estimate ?? plannedHours) * source.loggedRatio + 0.5);
    return {
      taskId: t.id,
      taskName: t.name,
      date: first.date,
      start: first.start,
      end: last.end,
      plannedHours,
      estimate,
      suggestedEstimate: suggested,
      status: t.status,
      priority: t.priority,
      tag: t.tag,
    };
  }
  return null;
}

/**
 * Tasks whose cumulative past-logged time exceeds their estimate.
 * Only surfaced for the displayed week when the task has logged activity
 * that week, so the Optimize page and the Calendar status bar stay in sync.
 */
export function overrunTasks(week: WeekView, includeResolved = false): OverrunTask[] {
  const rows: OverrunTask[] = [];
  for (const t of tasks) {
    const resolution = resolvedOverruns.get(t.id) ?? null;
    if (resolution && !includeResolved) continue;
    const liveEstimate = taskEstimate(t.id, t.estimateHours);
    const estimate = resolution ? (resolution.from ?? liveEstimate) : liveEstimate;
    if (estimate == null) continue;
    const entries = timeEntries.filter((e) => e.taskId === t.id && isPastEntry(e));
    const logged = entries.reduce((s, e) => s + e.duration, 0);
    const activeThisWeek = entries.some(
      (e) => e.date >= week.from && e.date <= week.to,
    );
    if (logged <= estimate || !activeThisWeek) continue;
    const project = projectById(t.projectId);
    if (!project) continue;
    const overHours = logged - estimate;
    rows.push({
      taskId: t.id,
      taskName: t.name,
      projectId: project.id,
      projectName: project.name,
      projectColor: project.color,
      client: project.client,
      rate: project.rate ?? null,
      tag: t.tag,
      status: t.status,
      priority: t.priority,
      logged,
      estimate,
      overHours,
      overPct: Math.round((overHours / estimate) * 100),
      overCost: project.rate != null ? overHours * project.rate : null,
      repeat: findRepeat({
        id: t.id,
        projectId: t.projectId,
        name: t.name,
        loggedRatio: logged / estimate,
      }),
      resolved: resolution,
    });
  }
  return rows.sort((a, b) => b.overHours - a.overHours);
}

/* ---------------- capacity & rescheduling --------------------------- */

export const CAPACITY_HOURS = WEEKLY_CAPACITY;

const addDaysIso = (dateIso: string, days: number) => {
  const dt = new Date(`${dateIso}T00:00:00Z`);
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
};

const minePlannedBetween = (from: string, to: string) =>
  plannedEntries.filter(
    (e) => e.memberId === currentUser.id && e.date >= from && e.date <= to,
  );

/** Logged (past) + planned hours committed in a given week, for the current user. */
export function committedHoursForWeek(from: string, to: string) {
  const logged = timeEntries
    .filter(
      (e) => e.memberId === currentUser.id && e.date >= from && e.date <= to && isPastEntry(e),
    )
    .reduce((s, e) => s + e.duration, 0);
  const planned = minePlannedBetween(from, to).reduce((s, e) => s + e.duration, 0);
  return { logged, planned, total: logged + planned };
}

export type CapacityCandidate = {
  taskId: string;
  taskName: string;
  projectId: string;
  projectName: string;
  projectColor: import("@/data/fixtures").ProjectColor;
  client: string | null;
  hours: number;
  estimate: number | null;
  priority: import("@/data/fixtures").Priority;
  status: import("@/data/fixtures").TaskStatus;
  tag: string | null;
  plannedDates: string[]; // YYYY-MM-DD blocks inside the viewed week
  proposedDate: string; // YYYY-MM-DD slot in the next week
  proposedStart: number; // hour of day
};

/** Picks the lightest weekday of the week starting `from` for the current user. */
function lightestWeekday(from: string): { date: string; start: number } {
  let best: { date: string; start: number; load: number } | null = null;
  for (let i = 0; i < 5; i++) {
    const date = addDaysIso(from, i);
    const logged = timeEntries
      .filter((e) => e.memberId === currentUser.id && e.date === date)
      .reduce((s, e) => s + e.duration, 0);
    const planned = plannedEntries
      .filter((e) => e.memberId === currentUser.id && e.date === date)
      .reduce((s, e) => s + e.duration, 0);
    const load = logged + planned;
    if (!best || load < best.load) best = { date, start: 9, load };
  }
  return { date: best!.date, start: best!.start };
}

export type CapacitySignal = {
  capacity: number;
  committed: number;
  logged: number;
  planned: number;
  overage: number;
  scopeCreepHours: number;
  scopeCreepProjects: string[];
  candidate: CapacityCandidate | null;
  canMove: boolean;
  nextWeekTotal: number;
  nextWeekAfterMove: number;
};

/** Over-capacity signal for the week in view. Null when the week fits. */
export function capacitySignal(week: WeekView): CapacitySignal | null {
  const { logged, planned, total } = committedHoursForWeek(week.from, week.to);
  const overage = total - CAPACITY_HOURS;
  if (overage <= 0) return null;

  const creep = scopeCreepTasks(week);
  const scopeCreepHours = creep.reduce((s, r) => s + r.hours, 0);
  const scopeCreepProjects = [...new Set(creep.map((r) => r.projectName))];

  // Eligible planned tasks in this week: not started, not high priority.
  const plannedByTask = new Map<string, number>();
  for (const e of minePlannedBetween(week.from, week.to)) {
    if (!e.taskId) continue;
    plannedByTask.set(e.taskId, (plannedByTask.get(e.taskId) ?? 0) + e.duration);
  }
  const eligible = [...plannedByTask.entries()]
    .map(([taskId, hours]) => ({ task: taskById(taskId), hours }))
    .filter(
      (r) => r.task && r.task.status === "Todo" && r.task.priority !== "High",
    )
    .map((r) => ({ task: r.task!, hours: r.hours }))
    .sort((a, b) => a.hours - b.hours);

  const pick =
    eligible.find((r) => r.hours >= overage) ?? eligible[eligible.length - 1] ?? null;

  const nextFrom = addDaysIso(week.from, 7);
  const nextTo = addDaysIso(week.to, 7);
  const nextWeekTotal = committedHoursForWeek(nextFrom, nextTo).total;
  const nextWeekAfterMove = nextWeekTotal + (pick?.hours ?? 0);

  let candidate: CapacitySignal["candidate"] = null;
  if (pick) {
    const project = projectById(pick.task.projectId);
    const plannedDates = minePlannedBetween(week.from, week.to)
      .filter((e) => e.taskId === pick.task.id)
      .map((e) => e.date)
      .sort();
    candidate = {
      taskId: pick.task.id,
      taskName: pick.task.name,
      projectId: pick.task.projectId,
      projectName: project?.name ?? "",
      projectColor: project?.color ?? "violet",
      client: project?.client ?? null,
      hours: pick.hours,
      estimate: taskEstimate(pick.task.id, pick.task.estimateHours),
      priority: pick.task.priority,
      status: pick.task.status,
      tag: pick.task.tag,
      plannedDates,
      ...(() => {
        const slot = lightestWeekday(nextFrom);
        return { proposedDate: slot.date, proposedStart: slot.start };
      })(),
    };
  }

  return {
    capacity: CAPACITY_HOURS,
    committed: total,
    logged,
    planned,
    overage,
    scopeCreepHours,
    scopeCreepProjects,
    candidate,
    canMove: candidate != null && nextWeekAfterMove <= CAPACITY_HOURS,
    nextWeekTotal,
    nextWeekAfterMove,
  };
}

/** Moves a task's planned blocks to a specific slot (date + start hour). */
export function moveTaskToNextWeek(
  taskId: string,
  targetDate: string,
  startHour = 9,
) {
  let cursor = startHour;
  for (const e of plannedEntries) {
    if (e.taskId !== taskId) continue;
    e.date = targetDate;
    e.start = cursor;
    e.end = cursor + e.duration;
    cursor = e.end;
  }
  plannedEntries.sort((a, b) =>
    a.date < b.date ? -1 : a.date > b.date ? 1 : a.start - b.start,
  );
  version++;
  listeners.forEach((l) => l());
}
