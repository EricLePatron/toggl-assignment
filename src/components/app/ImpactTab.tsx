import { useState } from "react";
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Circle,
  Clock3,
  FolderKanban,
  MoveRight,
} from "lucide-react";
import {
  currentUser,
  formatHours,
  money,
  plannedEntries,
  projectById,
  projectColorClass,
  timeEntries,
  type ProjectColor,
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

const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatPlannedDates(dates: string[]) {
  if (dates.length === 0) return "Not scheduled";
  const sorted = [...dates].sort();
  const first = new Date(`${sorted[0]}T00:00:00Z`);
  const last = new Date(`${sorted[sorted.length - 1]}T00:00:00Z`);
  const fmt = (d: Date) => `${DAY_SHORT[d.getUTCDay()]} ${MONTH_SHORT[d.getUTCMonth()]} ${d.getUTCDate()}`;
  if (sorted.length === 1) return fmt(first);
  return `${fmt(first)} – ${fmt(last)}`;
}

function CapacityCard({ week }: { week: WeekView }) {
  const signal = capacitySignal(week);
  if (!signal || !signal.candidate || !signal.canMove) return null;
  const c = signal.candidate;

  const currentBlock = plannedEntries.find(
    (e) => e.taskId === c.taskId && e.date >= week.from && e.date <= week.to,
  );
  const currentSlotTime = currentBlock ? fmtTime(currentBlock.start) : "";

  const moveReasons = [
    { icon: Circle, text: "Status is Todo — not started yet" },
    { icon: CalendarClock, text: "Originally planned for " + formatPlannedDates(c.plannedDates) },
    { icon: CheckCircle2, text: `${c.priority} priority — lower than locked-in cutover work` },
    { icon: CheckCircle2, text: "No deadline this week" },
  ];

  return (
    <div
      className="panel overflow-hidden border-info/40"
      style={{
        backgroundColor: "color-mix(in oklab, var(--color-info) 8%, transparent)",
      }}
    >
      <div className="flex items-center gap-3 px-5 py-4">
        <span
          className="flex size-8 shrink-0 items-center justify-center rounded-[10px] text-info"
          style={{
            backgroundColor:
              "color-mix(in oklab, var(--color-info) 16%, transparent)",
          }}
        >
          <CalendarClock className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
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
        </div>
        <span
          className="tnum ml-auto shrink-0 rounded-full border border-info/40 px-3 py-1 text-xs font-semibold text-info"
          style={{
            backgroundColor:
              "color-mix(in oklab, var(--color-info) 10%, transparent)",
          }}
        >
          {formatHours(signal.logged)} logged + {formatHours(signal.planned)} planned
        </span>
      </div>

      <div className="border-y border-info/25 px-5 py-4">
        <div className="flex items-center gap-2 pb-3">
          <span className="inline-flex h-5 items-center rounded bg-info/15 px-2 text-[11px] font-semibold uppercase tracking-wide text-info">
            Suggested action
          </span>
          <span className="text-xs text-muted-foreground">
            Move this planned work to next week
          </span>
        </div>

        <div className="rounded-[10px] border border-info/30 bg-surface-2/60 p-3">
          <div className="flex items-start gap-3">
            <Circle className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-foreground">
                {c.taskName}
              </div>
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2 py-1 text-xs">
                  <FolderKanban
                    className={cn("size-3.5", projectColorClass[c.projectColor])}
                  />
                  <span className="truncate max-w-[10rem]">{c.projectName}</span>
                </span>
                {c.client && (
                  <span className="inline-flex items-center rounded-lg border border-border bg-surface px-2 py-1 text-xs text-muted-foreground">
                    {c.client}
                  </span>
                )}
                <span className="tnum inline-flex items-center rounded-lg border border-info/30 bg-info/10 px-2 py-1 text-xs font-medium text-info">
                  {formatHours(c.hours)} total
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2 py-1 text-xs">
                  <span className="size-1.5 rounded-full bg-current" />
                  {c.status}
                </span>
                {c.estimate != null && (
                  <span className="tnum inline-flex items-center rounded-lg border border-border bg-surface px-2 py-1 text-xs text-muted-foreground">
                    Est. {formatHours(c.estimate)}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-3 grid gap-1.5 rounded-lg border border-info/20 bg-info/5 px-3 py-2.5">
            {moveReasons.map((r, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                <r.icon className="size-3.5 shrink-0 text-info" />
                <span>{r.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Mini calendar: this week → proposed slot next week */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 pt-3">
          <MiniWeek
            label="This week"
            dates={week.days.map((d) => d.date)}
            activeDates={c.plannedDates}
            chipName={c.taskName}
            chipColor={c.projectColor}
            chipTime={currentSlotTime}
          />
          <MoveRight className="size-5 shrink-0 text-info" />
          <MiniWeek
            label="Next week"
            dates={Array.from({ length: 7 }, (_, i) => addDaysIso(week.from, 7 + i))}
            activeDates={[c.proposedDate]}
            chipName={c.taskName}
            chipColor={c.projectColor}
            chipTime={fmtTime(c.proposedStart)}
            highlight
          />
        </div>

        <div className="flex items-center justify-between gap-4 pt-3">
          <p className="tnum text-xs text-muted-foreground">
            After moving: this week{" "}
            <span className="font-medium text-foreground">
              {formatHours(signal.committed - c.hours)}
            </span>{" "}
            · next week{" "}
            <span className="font-medium text-foreground">
              {formatHours(signal.nextWeekAfterMove)}
            </span>{" "}
            — both within {formatHours(signal.capacity)}.
          </p>
          <button
            className="pill shrink-0 border-info/50 text-foreground"
            onClick={() =>
              moveTaskToNextWeek(c.taskId, c.proposedDate, c.proposedStart)
            }
          >
            Move to {slotLabel(c.proposedDate, c.proposedStart)}
          </button>
        </div>
      </div>
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
      <CapacityCard week={week} />
      <OverrunCard />
    </>
  );
}


function formatH(h: number) {
  const hours = Math.floor(h);
  const min = Math.round((h - hours) * 60);
  return min ? `${hours}h ${min}m` : `${hours}h`;
}

const addDaysIso = (iso: string, days: number) => {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};

function fmtTime(h: number) {
  const suffix = h < 12 ? "AM" : "PM";
  const base = h % 12 === 0 ? 12 : h % 12;
  return `${base}:00 ${suffix}`;
}

function slotLabel(dateIso: string, start: number) {
  const d = new Date(`${dateIso}T00:00:00Z`);
  return `${DAY_SHORT[d.getUTCDay()]} ${MONTH_SHORT[d.getUTCMonth()]} ${d.getUTCDate()} · ${fmtTime(start)}`;
}

function MiniWeek({
  label,
  dates,
  activeDates,
  chipName,
  chipColor,
  chipTime,
  highlight,
}: {
  label: string;
  dates: string[];
  activeDates: string[];
  chipName: string;
  chipColor: ProjectColor;
  chipTime: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-[10px] border p-2",
        highlight ? "border-info/40 bg-info/5" : "border-border bg-surface-2/40",
      )}
    >
      <div className="pb-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {dates.map((date, i) => {
          const active = activeDates.includes(date);
          return (
            <div
              key={date}
              className={cn(
                "flex min-h-16 flex-col items-center gap-0.5 rounded-md border px-0.5 py-1",
                active ? "border-info/50 bg-info/10" : "border-border/50",
              )}
            >
              <span className="text-[9px] uppercase text-subtle">
                {DAY_LABELS[i]}
              </span>
              <span className="tnum text-[11px] font-medium text-muted-foreground">
                {Number(date.slice(8, 10))}
              </span>
              {active && (
                <div
                  className={cn(
                    "mt-0.5 w-full rounded px-1 py-0.5 text-center",
                    projectColorClass[chipColor],
                  )}
                >
                  <div className="truncate text-[9px] font-semibold text-black/85">
                    {chipName}
                  </div>
                  <div className="tnum text-[9px] text-black/70">{chipTime}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
