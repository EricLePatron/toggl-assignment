import { useState } from "react";
import { AlertTriangle, CalendarClock, Clock3 } from "lucide-react";
import {
  currentUser,
  formatHours,
  money,
  plannedEntries,
  projectById,
  projectColorClass,
  timeEntries,
  type WeekView,
} from "@/data/fixtures";

import { Card } from "@/components/app/primitives";
import {
  capacitySignal,
  isPastEntry,
  moveTaskToNextWeek,
  overrunTasks,
  scopeCreepTasks,
  setTaskEstimate,
  useEstimateOverrides,
} from "@/lib/week-signals";
import { cn } from "@/lib/utils";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

function dayRows(week: WeekView) {
  return week.days.map((d, i) => ({
    label: DAY_LABELS[i]!,
    date: d.date,
    short: `${Number(d.date.slice(5, 7))}/${Number(d.date.slice(8, 10))}`,
    logged: timeEntries
      .filter(
        (e) => e.date === d.date && e.memberId === currentUser.id && isPastEntry(e),
      )
      .reduce((s, e) => s + e.duration, 0),
    planned: plannedEntries
      .filter((e) => e.date === d.date && e.memberId === currentUser.id)
      .reduce((s, e) => s + e.duration, 0),
  }));
}

function LoggedVsPlannedChart({ week }: { week: WeekView }) {
  const days = dayRows(week);
  const peak = Math.max(1, ...days.map((d) => Math.max(d.logged, d.planned)));
  const max = Math.max(2, Math.ceil(peak / 2) * 2);
  const ticks = Array.from({ length: 6 }, (_, i) => (max / 5) * (5 - i));
  return (
    <div className="relative h-64">
      {ticks.map((v) => (
        <div
          key={v}
          className="absolute inset-x-0 flex items-center gap-3"
          style={{ bottom: `${(v / max) * 100}%` }}
        >
          <span className="tnum w-6 shrink-0 text-xs text-subtle">{Math.round(v)}h</span>
          <span className="h-px flex-1 border-t border-dashed border-border" />
        </div>
      ))}
      <div className="absolute inset-y-0 left-9 right-0 flex items-end gap-6">
        {days.map((d) => (
          <div key={d.date} className="flex flex-1 flex-col items-center gap-2">
            <span className="tnum text-xs text-muted-foreground">
              {d.logged || d.planned ? formatH(Math.max(d.logged, d.planned)) : ""}
            </span>
            <div className="flex w-full items-end justify-center gap-1">
              <div
                className="w-1/2 rounded-t-sm bg-accent"
                style={{ height: `${(d.logged / max) * 210}px` }}
              />
              <div
                className="w-1/2 rounded-t-sm bg-accent-pink/50"
                style={{ height: `${(d.planned / max) * 210}px` }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="absolute -bottom-12 left-9 right-0 flex gap-6">
        {days.map((d) => (
          <div key={d.date} className="flex-1 text-center text-xs text-muted-foreground">
            <div>{d.label}</div>
            <div className="tnum">{d.short}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ScopeCreepCard({ week }: { week: WeekView }) {
  const rows = scopeCreepTasks(week);
  if (rows.length === 0) return null;
  const totalHours = rows.reduce((s, r) => s + r.hours, 0);
  const totalAmount = rows.reduce((s, r) => s + (r.amount ?? 0), 0);

  return (
    <div className="panel overflow-hidden border-destructive/35">
      <div className="flex items-center gap-3 px-5 py-4">
        <span
          className="flex size-8 shrink-0 items-center justify-center rounded-[10px] text-destructive"
          style={{
            backgroundColor:
              "color-mix(in oklab, var(--color-destructive) 16%, transparent)",
          }}
        >
          <AlertTriangle className="size-4" />
        </span>
        <div className="min-w-0">
          <h2 className="text-base font-semibold">Scope creep</h2>
          <p className="pt-0.5 text-sm text-muted-foreground">
            Tasks logged this week that were never estimated.
          </p>
        </div>
        <span
          className="tnum ml-auto shrink-0 rounded-full border border-destructive/40 px-3 py-1 text-xs font-semibold text-destructive"
          style={{
            backgroundColor:
              "color-mix(in oklab, var(--color-destructive) 10%, transparent)",
          }}
        >
          {rows.length} task{rows.length > 1 ? "s" : ""} · {formatHours(totalHours)} ·{" "}
          {money(totalAmount)}
        </span>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_9rem_7rem_9rem_7rem] items-center gap-4 border-y border-border bg-surface-2/50 px-5 py-2 text-[11px] font-semibold uppercase tracking-wide text-subtle">
        <span>Project | Task</span>
        <span>Client</span>
        <span className="text-right">Logged time</span>
        <span className="text-center">Estimated time</span>
        <span className="text-right">Amount</span>
      </div>

      <div className="divide-y divide-border">
        {rows.map((r) => (
          <ScopeCreepRow key={r.taskId} row={r} />
        ))}
      </div>
    </div>
  );
}

function ScopeCreepRow({ row }: { row: ReturnType<typeof scopeCreepTasks>[number] }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState("");
  const project = projectById(row.projectId);

  const save = () => {
    const hours = Number(value.replace(",", ".").replace(/h/gi, "").trim());
    if (Number.isFinite(hours) && hours > 0) setTaskEstimate(row.taskId, hours);
    setEditing(false);
    setValue("");
  };

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_9rem_7rem_9rem_7rem] items-center gap-4 px-5 py-3 text-sm transition-colors hover:bg-surface-2/40">
      <div className="flex min-w-0 items-center gap-2.5">
        <span
          className={cn(
            "size-2.5 shrink-0 rounded-[3px]",
            project ? projectColorClass[project.color] : "bg-muted-foreground",
          )}
        />
        <div className="min-w-0">
          <div className="truncate font-medium">{row.taskName}</div>
          <div className="truncate text-xs text-muted-foreground">{row.projectName}</div>
        </div>
      </div>
      <div className="truncate text-muted-foreground">{row.client ?? "—"}</div>
      <div className="tnum text-right">{formatHours(row.hours)}</div>
      <div className="flex justify-center">
        {editing ? (
          <div className="flex items-center gap-1.5">
            <div
              className={cn(
                "flex items-center rounded-[10px] border border-accent bg-surface-2 px-2 py-1",
                "ring-2 ring-accent/25",
              )}
            >
              <input
                autoFocus
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") save();
                  if (e.key === "Escape") setEditing(false);
                }}
                onBlur={save}
                placeholder="0"
                aria-label={`Estimate in hours for ${row.taskName}`}
                className="tnum w-10 bg-transparent text-right text-sm outline-none"
              />
              <span className="pl-0.5 text-sm text-muted-foreground">h</span>
            </div>
            <span className="text-xs text-subtle">total</span>
          </div>
        ) : (
          <button
            className={cn(
              "border border-dashed pill-dashed rounded-[10px] px-2.5 py-1 text-xs text-muted-foreground",
              "transition-colors hover:border-accent hover:text-foreground",
            )}
            onClick={() => setEditing(true)}
          >
            Set estimate
          </button>
        )}
      </div>
      <div className="tnum text-right font-medium">
        {row.amount != null ? money(row.amount) : "—"}
      </div>
    </div>
  );
}


function OverrunCard() {
  const rows = overrunTasks();
  if (rows.length === 0) return null;
  const totalOver = rows.reduce((s, r) => s + r.overHours, 0);
  const totalCost = rows.reduce((s, r) => s + (r.overCost ?? 0), 0);

  return (
    <div
      className="panel border-warning/40"
      style={{
        backgroundColor: "color-mix(in oklab, var(--color-warning) 8%, transparent)",
      }}
    >
      <div className="flex items-start gap-3 px-5 py-4">
        <Clock3 className="size-5 shrink-0 text-warning" />
        <div>
          <h2 className="text-base font-semibold">Estimate overrun</h2>
          <p className="pt-0.5 text-sm text-muted-foreground">
            Tasks whose total logged time exceeds their estimate. Cumulative — not
            limited to this week.
          </p>
        </div>
      </div>
      {rows.length > 1 && (
        <div className="tnum border-y border-warning/25 px-5 py-2.5 text-sm">
          <span className="text-muted-foreground">Total over budget : </span>
          <span className="font-semibold">{formatHours(totalOver)}</span>
          <span className="text-muted-foreground"> · </span>
          <span className="font-semibold">{money(totalCost)}</span>
        </div>
      )}
      <div className="divide-y divide-warning/20">
        {rows.map((r) => (
          <OverrunRow key={r.taskId} row={r} />
        ))}
      </div>
    </div>
  );
}

function OverrunRow({ row }: { row: ReturnType<typeof overrunTasks>[number] }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState("");

  const save = () => {
    const hours = Number(value.replace(",", "."));
    if (Number.isFinite(hours) && hours > 0) setTaskEstimate(row.taskId, hours);
    setEditing(false);
    setValue("");
  };

  return (
    <div className="px-5 py-3 text-sm">
      <div className="flex items-center gap-4">
        <div className="min-w-0 flex-1">
          <div className="truncate font-medium">{row.taskName}</div>
          <div className="truncate text-xs text-muted-foreground">
            {row.projectName}
            {row.client ? ` — ${row.client}` : ""}
          </div>
        </div>
        <div className="tnum shrink-0 text-right">
          <div>
            {formatHours(row.logged)} logged vs {formatHours(row.estimate)} estimated{" "}
            <span className="font-semibold text-warning">
              (+{formatHours(row.overHours)}, +{row.overPct}%)
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            Overage cost: {row.overCost != null ? money(row.overCost) : "—"}
          </div>
        </div>
        <div className="shrink-0">
          {editing ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") save();
                  if (e.key === "Escape") setEditing(false);
                }}
                placeholder="Hours"
                aria-label={`New estimate in hours for ${row.taskName}`}
                className={cn(
                  "tnum w-20 rounded-[10px] border border-border bg-surface-2 px-2 py-1 text-sm",
                  "outline-none focus:border-accent",
                )}
              />
              <button className="pill" onClick={save}>
                Save
              </button>
            </div>
          ) : (
            <button className="pill" onClick={() => setEditing(true)}>
              Update estimate
            </button>
          )}
        </div>
      </div>
      <p className="pt-1.5 text-xs text-muted-foreground">
        Consider padding similar estimates next time.
      </p>
    </div>
  );
}

function CapacityCard({ week }: { week: WeekView }) {
  const signal = capacitySignal(week);
  if (!signal || !signal.candidate || !signal.canMove) return null;
  const c = signal.candidate;

  return (
    <div
      className="panel border-info/40"
      style={{
        backgroundColor: "color-mix(in oklab, var(--color-info) 8%, transparent)",
      }}
    >
      <div className="flex items-start gap-3 px-5 py-4">
        <CalendarClock className="size-5 shrink-0 text-info" />
        <div>
          <h2 className="text-base font-semibold">Your week is over capacity</h2>
          <p className="tnum pt-0.5 text-sm text-muted-foreground">
            Capacity {formatHours(signal.capacity)} · committed{" "}
            <span className="font-semibold text-foreground">
              {formatHours(signal.committed)}
            </span>{" "}
            ·{" "}
            <span className="font-semibold text-info">
              +{formatHours(signal.overage)} over
            </span>
          </p>
          {signal.scopeCreepHours > 0 && (
            <p className="tnum pt-1 text-sm text-muted-foreground">
              {formatHours(signal.scopeCreepHours)} of that comes from this week&apos;s
              scope creep on {signal.scopeCreepProjects.join(", ")}.
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4 border-t border-info/25 px-5 py-3 text-sm">
        <div className="min-w-0 flex-1">
          <div className="truncate font-medium">
            Move “{c.taskName}” to next week
          </div>
          <div className="truncate text-xs text-muted-foreground">
            {c.projectName}
            {c.client ? ` — ${c.client}` : ""} · {formatHours(c.hours)} · not started
            yet, no deadline this week
          </div>
        </div>
        <button
          className="pill border-info/50 text-foreground"
          onClick={() => moveTaskToNextWeek(c.taskId, week.from)}
        >
          Move to next week
        </button>
      </div>
      <p className="tnum px-5 pb-4 text-xs text-muted-foreground">
        After the move: this week {formatHours(signal.committed - c.hours)}, next week{" "}
        {formatHours(signal.nextWeekAfterMove)} — both within{" "}
        {formatHours(signal.capacity)}.
      </p>
    </div>
  );
}

export function ImpactTab({ week }: { week: WeekView }) {
  useEstimateOverrides();
  return (
    <>
      <Card>
        <h2 className="pb-6 text-base font-semibold">This week — logged vs planned</h2>
        <LoggedVsPlannedChart week={week} />
        <div className="flex items-center justify-center gap-6 pt-16 text-xs text-muted-foreground">
          <span className="flex items-center gap-2">
            <span className="size-2.5 rounded-[3px] bg-accent" /> Logged
          </span>
          <span className="flex items-center gap-2">
            <span className="size-2.5 rounded-[3px] bg-accent-pink/50" /> Planned
          </span>
        </div>
      </Card>
      <ScopeCreepCard week={week} />
      <OverrunCard />
      <CapacityCard week={week} />
    </>
  );
}


function formatH(h: number) {
  const hours = Math.floor(h);
  const min = Math.round((h - hours) * 60);
  return min ? `${hours}h ${min}m` : `${hours}h`;
}
