/**
 * Shared week-signal logic used by both the Calendar week status bar and the
 * Reports > Impact view, so the two can never disagree.
 */
import { useSyncExternalStore } from "react";
import {
  currentUser,
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
const listeners = new Set<() => void>();
let version = 0;

export function setTaskEstimate(taskId: string, hours: number) {
  overrides.set(taskId, hours);
  version++;
  listeners.forEach((l) => l());
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
  return overrides.has(taskId) ? overrides.get(taskId)! : base;
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
export function scopeCreepTasks(week: WeekView): ScopeCreepTask[] {
  const logged = loggedEntriesForWeek(week);
  const rows: ScopeCreepTask[] = [];
  for (const t of tasks) {
    if (taskEstimate(t.id, t.estimateHours) != null) continue;
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
    });
  }
  return rows.sort((a, b) => b.hours - a.hours);
}

export type OverrunTask = {
  taskId: string;
  taskName: string;
  projectId: string;
  projectName: string;
  client: string | null;
  logged: number;
  estimate: number;
  overHours: number;
  overPct: number;
  overCost: number | null;
};

/**
 * Tasks whose cumulative past-logged time exceeds their estimate.
 * NOT scoped to the displayed week — overrun is a cumulative signal.
 */
export function overrunTasks(): OverrunTask[] {
  const rows: OverrunTask[] = [];
  for (const t of tasks) {
    const estimate = taskEstimate(t.id, t.estimateHours);
    if (estimate == null) continue;
    const logged = timeEntries
      .filter((e) => e.taskId === t.id && isPastEntry(e))
      .reduce((s, e) => s + e.duration, 0);
    if (logged <= estimate) continue;
    const project = projectById(t.projectId);
    if (!project) continue;
    const overHours = logged - estimate;
    rows.push({
      taskId: t.id,
      taskName: t.name,
      projectId: project.id,
      projectName: project.name,
      client: project.client,
      logged,
      estimate,
      overHours,
      overPct: Math.round((overHours / estimate) * 100),
      overCost: project.rate != null ? overHours * project.rate : null,
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

/** Moves a task's planned blocks from the given week to Monday of the next week. */
export function moveTaskToNextWeek(taskId: string, weekFrom: string) {
  const nextMonday = addDaysIso(weekFrom, 7);
  let cursor = 16;
  for (const e of plannedEntries) {
    if (e.taskId !== taskId) continue;
    e.date = nextMonday;
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
