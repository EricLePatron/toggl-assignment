/**
 * Shared week-signal logic used by both the Calendar week status bar and the
 * Reports > Impact view, so the two can never disagree.
 */
import { useSyncExternalStore } from "react";
import {
  projectById,
  tasks,
  timeEntries,
  TODAY,
  NOW_HOUR,
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
