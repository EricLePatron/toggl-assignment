import { useState } from "react";
import { AlertTriangle, Clock3 } from "lucide-react";
import {
  currentUser,
  formatHours,
  money,
  plannedEntries,
  timeEntries,
  type WeekView,
} from "@/data/fixtures";
import { Card } from "@/components/app/primitives";
import {
  isPastEntry,
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
    <div
      className="panel border-destructive/40"
      style={{
        backgroundColor: "color-mix(in oklab, var(--color-destructive) 8%, transparent)",
      }}
    >
      <div className="flex items-start gap-3 px-5 py-4">
        <AlertTriangle className="size-5 shrink-0 text-destructive" />
        <div>
          <h2 className="text-base font-semibold">Scope creep</h2>
          <p className="pt-0.5 text-sm text-muted-foreground">
            Tasks logged this week that were never estimated.
          </p>
        </div>
      </div>
      {rows.length > 1 && (
        <div className="tnum border-y border-destructive/25 px-5 py-2.5 text-sm">
          <span className="text-muted-foreground">Total off-scope this week : </span>
          <span className="font-semibold">{formatHours(totalHours)}</span>
          <span className="text-muted-foreground"> · </span>
          <span className="font-semibold">{money(totalAmount)}</span>
        </div>
      )}
      <div className="divide-y divide-destructive/20">
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

  const save = () => {
    const hours = Number(value.replace(",", "."));
    if (Number.isFinite(hours) && hours > 0) setTaskEstimate(row.taskId, hours);
    setEditing(false);
    setValue("");
  };

  return (
    <div className="flex items-center gap-4 px-5 py-3 text-sm">
      <div className="min-w-0 flex-1">
        <div className="truncate font-medium">{row.taskName}</div>
        <div className="truncate text-xs text-muted-foreground">
          {row.projectName}
          {row.client ? ` — ${row.client}` : ""}
        </div>
      </div>
      <div className="tnum shrink-0 text-right">
        <div>{formatHours(row.hours)}</div>
        <div className="text-xs text-muted-foreground">
          {row.amount != null ? money(row.amount) : "—"}
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
              aria-label={`Estimate in hours for ${row.taskName}`}
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
            Add an estimate
          </button>
        )}
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
    </>
  );
}

function formatH(h: number) {
  const hours = Math.floor(h);
  const min = Math.round((h - hours) * 60);
  return min ? `${hours}h ${min}m` : `${hours}h`;
}
