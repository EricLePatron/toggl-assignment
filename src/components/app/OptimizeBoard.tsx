import { useState } from "react";
import {
  AlertTriangle,
  ArrowDown,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
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
  WEEKLY_CAPACITY,
  type ProjectColor,
  type WeekView,
} from "@/data/fixtures";

import { Card } from "@/components/app/primitives";
import {
  capacitySignal,
  committedHoursForWeek,
  completedEstimateUpdate,
  isPastEntry,
  moveTaskToNextWeek,
  overrunTasks,
  resolveOverrun,
  resolveScopeCreep,
  scopeCreepTasks,
  setTaskEstimate,
  useEstimateOverrides,
} from "@/lib/week-signals";
import { cn } from "@/lib/utils";


const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

function ScopeCreepCard({ week }: { week: WeekView }) {
  const rows = scopeCreepTasks(week, true);
  if (rows.length === 0) return null;
  const active = rows.filter((r) => !r.resolved);
  const totalHours = active.reduce((s, r) => s + r.hours, 0);
  const totalAmount = active.reduce((s, r) => s + (r.amount ?? 0), 0);

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
        {active.length > 0 ? (
          <span
            className="tnum ml-auto shrink-0 rounded-full border border-destructive/40 px-3 py-1 text-xs font-semibold text-destructive"
            style={{
              backgroundColor:
                "color-mix(in oklab, var(--color-destructive) 10%, transparent)",
            }}
          >
            {active.length} task{active.length > 1 ? "s" : ""} · {formatHours(totalHours)} ·{" "}
            {money(totalAmount)}
          </span>
        ) : (
          <span className="tnum ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-full border border-positive/40 bg-positive/10 px-3 py-1 text-xs font-semibold text-positive">
            <CheckCircle2 className="size-3.5" />
            Resolved
          </span>
        )}
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_9rem_7rem_14rem_7rem] items-center gap-4 border-y border-border bg-surface-2/50 px-5 py-2 text-[11px] font-semibold uppercase tracking-wide text-subtle">
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
  const res = row.resolved;

  const save = () => {
    const hours = Number(value.replace(",", ".").replace(/h/gi, "").trim());
    if (Number.isFinite(hours) && hours > 0) {
      resolveScopeCreep(row.taskId, "estimated", hours);
    }
    setEditing(false);
    setValue("");
  };

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_9rem_7rem_14rem_7rem] items-center gap-4 px-5 py-3 text-sm transition-colors hover:bg-surface-2/40">
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
        {res ? (
          res.action === "estimated" ? (
            <span className="inline-flex items-center gap-1.5 rounded-[10px] border border-positive/40 bg-positive/10 px-2.5 py-1 text-xs font-medium text-positive">
              <CheckCircle2 className="size-3.5 shrink-0" />
              Estimate set to {formatHours(res.to ?? row.hours)}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-[10px] border border-border bg-surface-2/60 px-2.5 py-1 text-xs text-muted-foreground">
              <CheckCircle2 className="size-3.5 shrink-0" />
              Left as is
            </span>
          )
        ) : editing ? (
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
          <div className="flex items-center justify-center gap-1.5">
            <button
              className={cn(
                "border border-dashed pill-dashed rounded-[10px] px-2.5 py-1 text-xs text-muted-foreground",
                "transition-colors hover:border-accent hover:text-foreground",
              )}
              onClick={() => setEditing(true)}
            >
              Set estimate
            </button>
            <button
              className="rounded-[10px] px-2.5 py-1 text-xs text-subtle transition-colors hover:text-foreground"
              onClick={() => resolveScopeCreep(row.taskId, "kept")}
            >
              Leave as is
            </button>
          </div>
        )}
      </div>
      <div className="tnum text-right font-medium">
        {row.amount != null ? money(row.amount) : "—"}
      </div>
    </div>
  );
}


function OverrunCard({ week }: { week: WeekView }) {
  const rows = overrunTasks(week, true);
  if (rows.length === 0) return null;
  const active = rows.filter((r) => !r.resolved);
  const totalOver = active.reduce((s, r) => s + r.overHours, 0);
  const totalCost = active.reduce((s, r) => s + (r.overCost ?? 0), 0);
  const totalEstimate = active.reduce((s, r) => s + r.estimate, 0);
  const totalLogged = active.reduce((s, r) => s + r.logged, 0);

  return (
    <div
      className="panel overflow-hidden border-warning/40"
      style={{
        backgroundColor: "color-mix(in oklab, var(--color-warning) 8%, transparent)",
      }}
    >
      <div className="flex items-center gap-3 px-5 py-4">
        <span
          className="flex size-8 shrink-0 items-center justify-center rounded-[10px] text-warning"
          style={{
            backgroundColor:
              "color-mix(in oklab, var(--color-warning) 16%, transparent)",
          }}
        >
          <Clock3 className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-semibold">Estimate overrun</h2>
          <p className="tnum pt-0.5 text-sm text-muted-foreground">
            {active.length > 0 ? (
              <>
                Estimated {formatHours(totalEstimate)} · logged{" "}
                <span className="font-semibold text-foreground">
                  {formatHours(totalLogged)}
                </span>{" "}
                ·{" "}
                <span className="font-semibold text-warning">
                  +{formatHours(totalOver)} over
                </span>
              </>
            ) : (
              "All overruns handled for this week."
            )}
          </p>
        </div>
        {active.length > 0 ? (
          <span
            className="tnum ml-auto shrink-0 rounded-full border border-warning/40 px-3 py-1 text-xs font-semibold text-warning"
            style={{
              backgroundColor:
                "color-mix(in oklab, var(--color-warning) 10%, transparent)",
            }}
          >
            {active.length} task{active.length > 1 ? "s" : ""} · +{formatHours(totalOver)} ·{" "}
            {money(totalCost)}
          </span>
        ) : (
          <span className="tnum ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-full border border-positive/40 bg-positive/10 px-3 py-1 text-xs font-semibold text-positive">
            <CheckCircle2 className="size-3.5" />
            Resolved
          </span>
        )}
      </div>

      <div className="divide-y divide-border border-t border-warning/25">
        {rows.map((r) => (
          <OverrunRow key={r.taskId} row={r} />
        ))}
      </div>
    </div>
  );
}

function OverrunRow({ row }: { row: ReturnType<typeof overrunTasks>[number] }) {
  const [editing, setEditing] = useState(false);
  const [editingRepeat, setEditingRepeat] = useState(false);
  const [value, setValue] = useState("");

  const repeat = row.repeat;
  /** Stored outside the component so a re-render/remount cannot recalculate it. */
  const done = repeat ? completedEstimateUpdate(repeat.taskId) : null;
  const saved = done?.to ?? null;
  const liveSuggested = repeat?.suggestedEstimate ?? Math.ceil(row.logged * 2) / 2;
  const suggested = done?.to ?? liveSuggested;
  const previousEstimate = done ? done.from : (repeat?.estimate ?? null);
  const res = row.resolved;

  const apply = (hours: number, taskId: string) => {
    if (!Number.isFinite(hours) || hours <= 0) return;
    setTaskEstimate(taskId, hours, {
      syncPlannedDuration: true,
      freezeConfirmation: true,
    });
    setEditing(false);
    setEditingRepeat(false);
    setValue("");
  };

  const applyInitial = (hours: number) => {
    if (!Number.isFinite(hours) || hours <= 0) return;
    resolveOverrun(row.taskId, "updated", hours);
    setEditing(false);
    setValue("");
  };

  const pct = Math.min(100, Math.round((row.estimate / row.logged) * 100));

  return (
    <div className="px-5 py-4">
      {/* --- Overrunning task, compact single block --------------------- */}
      <div className="flex items-start gap-3">
        <Clock3 className="mt-0.5 size-5 shrink-0 text-warning" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-medium">{row.taskName}</span>
            <span className="tnum shrink-0 rounded-lg border border-warning/40 px-2 py-0.5 text-xs font-semibold text-warning">
              +{formatHours(row.overHours)} · +{row.overPct}%
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2 py-1 text-xs">
              <FolderKanban
                className={cn("size-3.5", projectColorClass[row.projectColor])}
              />
              <span className="max-w-[12rem] truncate">{row.projectName}</span>
            </span>
            {row.client && (
              <span className="inline-flex items-center rounded-lg border border-border bg-surface px-2 py-1 text-xs text-muted-foreground">
                {row.client}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2 py-1 text-xs">
              <span className="size-1.5 rounded-full bg-current" />
              {row.status}
            </span>
            {row.tag && (
              <span className="inline-flex items-center rounded-lg border border-border bg-surface px-2 py-1 text-xs text-muted-foreground">
                {row.tag}
              </span>
            )}
            {row.rate != null && (
              <span className="tnum inline-flex items-center rounded-lg border border-border bg-surface px-2 py-1 text-xs text-muted-foreground">
                {money(row.rate)}/h
              </span>
            )}
          </div>

          {/* estimate vs logged bar */}
          <div className="pt-3">
            <div className="relative h-2 overflow-hidden rounded-full bg-surface-2">
              <div className="h-full rounded-full bg-warning" style={{ width: `${pct}%` }} />
            </div>
            <div className="tnum flex items-center justify-between pt-1.5 text-xs text-muted-foreground">
              <span>
                Estimated{" "}
                <span className="font-semibold text-foreground">
                  {formatHours(row.estimate)}
                </span>
              </span>
              <span>
                Logged{" "}
                <span className="font-semibold text-warning">
                  {formatHours(row.logged)}
                </span>
                {row.overCost != null && ` · ${money(row.overCost)} over budget`}
              </span>
            </div>
          </div>

          {/* --- Resolve the initial estimate --------------------------- */}
          <div className="flex flex-wrap items-center gap-2 pt-3">
            {res ? (
              res.action === "updated" ? (
                <span className="inline-flex items-center gap-2 rounded-[10px] border border-positive/40 bg-positive/10 px-3 py-2 text-sm text-positive">
                  <CheckCircle2 className="size-4 shrink-0" />
                  Initial estimate updated to {formatHours(res.to ?? row.logged)}
                  {res.from != null && (
                    <span className="tnum text-xs text-positive/70">
                      (was {formatHours(res.from)})
                    </span>
                  )}
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 rounded-[10px] border border-border bg-surface-2/60 px-3 py-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="size-4 shrink-0" />
                  Left as is — estimate stays {formatHours(row.estimate)}
                </span>
              )
            ) : editing ? (
              <>
                <div className="flex items-center rounded-[10px] border border-accent bg-surface-2 px-2 py-1.5 ring-2 ring-accent/25">
                  <input
                    autoFocus
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter")
                        applyInitial(Number(value.replace(",", ".")));
                      if (e.key === "Escape") setEditing(false);
                    }}
                    placeholder={String(row.logged)}
                    aria-label={`New initial estimate in hours for ${row.taskName}`}
                    className="tnum w-14 bg-transparent text-right text-sm outline-none"
                  />
                  <span className="pl-0.5 text-sm text-muted-foreground">h</span>
                </div>
                <button
                  className="grad-accent rounded-[10px] px-3 py-2 text-sm font-semibold text-primary-foreground"
                  onClick={() => applyInitial(Number(value.replace(",", ".")))}
                >
                  Save
                </button>
                <button className="pill" onClick={() => setEditing(false)}>
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  className="grad-accent inline-flex items-center gap-2 rounded-[10px] px-3.5 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                  onClick={() => applyInitial(row.logged)}
                >
                  <CheckCircle2 className="size-4" />
                  Update initial estimate to {formatHours(row.logged)}
                </button>
                <button className="pill" onClick={() => setEditing(true)}>
                  Custom value…
                </button>
                <button
                  className="pill text-muted-foreground"
                  onClick={() => resolveOverrun(row.taskId, "kept")}
                >
                  Leave as is
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* --- The same task happens again next week ---------------------- */}
      {repeat && (
        <div className="mt-3 rounded-[10px] border border-warning/40 p-3">
          <div className="flex items-center gap-2 pb-3">
            <span className="inline-flex h-5 items-center rounded border border-warning/40 px-2 text-[11px] font-semibold uppercase tracking-wide text-warning">
              Suggested action
            </span>
            <span className="text-xs text-muted-foreground">
              The same work is planned again — re-estimate it before it repeats
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="min-w-[16rem] flex-1 rounded-[10px] border border-border bg-surface-2/70 p-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <CalendarDays className="size-3.5 text-warning" />
                {slotLabel(repeat.date, repeat.start)} – {fmtTime(repeat.end)}
              </div>
              <div className="truncate pt-1.5 text-sm font-medium">
                {repeat.taskName}
              </div>
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2 py-1 text-xs">
                  <FolderKanban
                    className={cn("size-3.5", projectColorClass[row.projectColor])}
                  />
                  <span className="max-w-[12rem] truncate">{row.projectName}</span>
                </span>
                <span className="tnum inline-flex items-center rounded-lg border border-border bg-surface px-2 py-1 text-xs text-muted-foreground">
                  {formatHours(repeat.plannedHours)} planned
                </span>
                <span
                  className={cn(
                    "tnum inline-flex items-center rounded-lg border px-2 py-1 text-xs font-medium",
                    saved != null
                      ? "border-positive/40 bg-positive/10 text-positive"
                      : "border-warning/40 text-warning",
                  )}
                >
                  Est.{" "}
                  {saved != null
                    ? formatHours(saved)
                    : previousEstimate != null
                      ? formatHours(previousEstimate)
                      : "—"}
                </span>
              </div>
            </div>

            <MoveRight className="size-5 shrink-0 text-warning" />

            <div className="min-w-[14rem] flex-1">
              {saved != null ? (
                <div className="flex items-center gap-2 rounded-[10px] border border-positive/40 bg-positive/10 px-3 py-3 text-sm text-positive">
                  <CheckCircle2 className="size-4 shrink-0" />
                  Estimate updated to {formatHours(saved)}
                </div>
              ) : editingRepeat ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center rounded-[10px] border border-accent bg-surface-2 px-2 py-1.5 ring-2 ring-accent/25">
                    <input
                      autoFocus
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter")
                          apply(Number(value.replace(",", ".")), repeat.taskId);
                        if (e.key === "Escape") setEditingRepeat(false);
                      }}
                      placeholder={String(suggested)}
                      aria-label={`New estimate in hours for ${repeat.taskName}`}
                      className="tnum w-14 bg-transparent text-right text-sm outline-none"
                    />
                    <span className="pl-0.5 text-sm text-muted-foreground">h</span>
                  </div>
                  <button
                    className="grad-accent rounded-[10px] px-3 py-2 text-sm font-semibold text-primary-foreground"
                    onClick={() => apply(Number(value.replace(",", ".")), repeat.taskId)}
                  >
                    Save
                  </button>
                  <button className="pill" onClick={() => setEditingRepeat(false)}>
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    className="grad-accent inline-flex items-center gap-2 rounded-[10px] px-3.5 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                    onClick={() => apply(suggested, repeat.taskId)}
                  >
                    <CheckCircle2 className="size-4" />
                    Update estimate to {formatHours(suggested)}
                  </button>
                  <button className="pill" onClick={() => setEditingRepeat(true)}>
                    Set another value…
                  </button>
                </div>
              )}
              <p className="tnum pt-2 text-xs text-muted-foreground">
                {done ? (
                  <>
                    Estimate changed from{" "}
                    {done.from != null ? formatHours(done.from) : "—"} to{" "}
                    {formatHours(done.to)}. Mocked — reloading the page resets it.
                  </>
                ) : (
                  <>
                    Based on the {row.overPct}% overrun observed on the same work
                    {previousEstimate != null &&
                      ` (${formatHours(previousEstimate)} → ${formatHours(suggested)})`}
                    .
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      )}
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
  const [customSlot, setCustomSlot] = useState<{ date: string; start: number } | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const signal = capacitySignal(week);
  if (!signal || !signal.candidate || !signal.canMove) return null;
  const c = signal.candidate;

  const targetDate = customSlot?.date ?? c.proposedDate;
  const targetStart = customSlot?.start ?? c.proposedStart;

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

        <div className="grid grid-cols-2 items-stretch gap-4">
          {/* Left: task details, constrained to half width */}
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

          {/* Right: this week → next week, stacked vertically */}
          <div className="flex min-w-0 flex-col gap-2">
            <MiniWeek
              label="This week"
              dates={week.days.map((d) => d.date)}
              activeDates={c.plannedDates}
              chipName={c.taskName}
              chipColor={c.projectColor}
              chipTime={currentSlotTime}
              className="flex-1"
            />
            <ArrowDown className="size-5 shrink-0 self-center text-info" />
            <MiniWeek
              label="Next week"
              dates={Array.from({ length: 7 }, (_, i) => addDaysIso(week.from, 7 + i))}
              activeDates={[targetDate]}
              chipName={c.taskName}
              chipColor={c.projectColor}
              chipTime={fmtTime(targetStart)}
              highlight
              className="flex-1"
            />
          </div>
        </div>

        {pickerOpen && (
          <MoveDatePicker
            initialDate={targetDate}
            initialStart={targetStart}
            onCancel={() => setPickerOpen(false)}
            onSave={(date, start) => {
              moveTaskToNextWeek(c.taskId, date, start);
              setPickerOpen(false);
              setCustomSlot(null);
            }}
          />
        )}

        <div className="flex items-center justify-between gap-4 pt-3">
          <p className="tnum text-xs text-muted-foreground">
            After moving: this week{" "}
            <span className="font-medium text-foreground">
              {formatHours(signal.committed - c.hours)}
            </span>{" "}
            · next week{" "}
            <span className="font-medium text-foreground">
              {formatHours(signal.nextWeekTotal + c.hours)}
            </span>{" "}
            — both within {formatHours(signal.capacity)}.
          </p>
          <div className="flex shrink-0 items-center gap-2">
            <button
              className={cn("pill text-muted-foreground", pickerOpen && "border-info/50 text-foreground")}
              onClick={() => setPickerOpen((v) => !v)}
            >
              <CalendarDays className="size-3.5" />
              Pick another date…
            </button>
            <button
              className="pill border-info/50 text-foreground"
              onClick={() => moveTaskToNextWeek(c.taskId, targetDate, targetStart)}
            >
              Move to {slotLabel(targetDate, targetStart)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function OptimizeEmptyState({ week }: { week: WeekView }) {
  const { logged, planned, total } = committedHoursForWeek(week.from, week.to);
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface-2/30 px-6 py-16 text-center">
      <div className="grad-accent flex size-16 items-center justify-center rounded-2xl text-primary-foreground shadow-lg shadow-accent/20">
        <CheckCircle2 className="size-8" />
      </div>
      <h2 className="mt-6 text-xl font-semibold">Nothing to optimize this week</h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Your week looks healthy. No scope creep, estimate overruns, or capacity
        issues were detected.
      </p>

      <div className="mt-8 grid grid-cols-4 gap-4 rounded-xl border border-border bg-surface px-5 py-4">
        <div className="text-center">
          <div className="tnum text-lg font-semibold">{formatHours(logged)}</div>
          <div className="text-xs text-muted-foreground">Logged</div>
        </div>
        <div className="text-center">
          <div className="tnum text-lg font-semibold">{formatHours(planned)}</div>
          <div className="text-xs text-muted-foreground">Planned</div>
        </div>
        <div className="text-center">
          <div className="tnum text-lg font-semibold">{formatHours(total)}</div>
          <div className="text-xs text-muted-foreground">Committed</div>
        </div>
        <div className="text-center">
          <div className="tnum text-lg font-semibold">{formatHours(WEEKLY_CAPACITY)}</div>
          <div className="text-xs text-muted-foreground">Capacity</div>
        </div>
      </div>
    </div>
  );
}

export function OptimizeBoard({ week }: { week: WeekView }) {
  useEstimateOverrides();
  const hasScopeCreep = scopeCreepTasks(week, true).length > 0;
  const hasOverrun = overrunTasks(week).length > 0;
  const hasCapacity = capacitySignal(week) != null;
  const hasSignals = hasScopeCreep || hasOverrun || hasCapacity;

  if (!hasSignals) {
    return <OptimizeEmptyState week={week} />;
  }

  return (
    <>
      <ScopeCreepCard week={week} />
      <CapacityCard week={week} />
      <OverrunCard week={week} />
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
  const base = Math.floor(h) % 12 === 0 ? 12 : Math.floor(h) % 12;
  const min = Math.round((h - Math.floor(h)) * 60);
  return `${base}:${String(min).padStart(2, "0")} ${suffix}`;
}

function slotLabel(dateIso: string, start: number) {
  const d = new Date(`${dateIso}T00:00:00Z`);
  return `${DAY_SHORT[d.getUTCDay()]} ${MONTH_SHORT[d.getUTCMonth()]} ${d.getUTCDate()} · ${fmtTime(start)}`;
}

const MONTH_FULL = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const CAL_DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * Toggl-style reschedule picker: month calendar + start time + Save.
 * Mirrors the production date picker (dark panel, gradient-selected day).
 */
function MoveDatePicker({
  initialDate,
  initialStart,
  onSave,
  onCancel,
}: {
  initialDate: string;
  initialStart: number;
  onSave: (date: string, start: number) => void;
  onCancel: () => void;
}) {
  const init = new Date(`${initialDate}T00:00:00Z`);
  const [month, setMonth] = useState(
    () => new Date(Date.UTC(init.getUTCFullYear(), init.getUTCMonth(), 1)),
  );
  const [selected, setSelected] = useState(initialDate);
  const [hour, setHour] = useState(initialStart % 12 === 0 ? 12 : initialStart % 12);
  const [minute, setMinute] = useState(0);
  const [ampm, setAmpm] = useState<"AM" | "PM">(initialStart < 12 ? "AM" : "PM");

  const year = month.getUTCFullYear();
  const monthIdx = month.getUTCMonth();
  const firstDow = new Date(Date.UTC(year, monthIdx, 1)).getUTCDay(); // 0 = Sun
  const daysInMonth = new Date(Date.UTC(year, monthIdx + 1, 0)).getUTCDate();
  const daysInPrev = new Date(Date.UTC(year, monthIdx, 0)).getUTCDate();

  const cells: { iso: string; day: number; inMonth: boolean }[] = [];
  for (let i = 0; i < firstDow; i++) {
    const day = daysInPrev - firstDow + 1 + i;
    const d = new Date(Date.UTC(year, monthIdx - 1, day));
    cells.push({ iso: d.toISOString().slice(0, 10), day, inMonth: false });
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(Date.UTC(year, monthIdx, day));
    cells.push({ iso: d.toISOString().slice(0, 10), day, inMonth: true });
  }
  const trailing = (7 - (cells.length % 7)) % 7;
  for (let i = 1; i <= trailing; i++) {
    const d = new Date(Date.UTC(year, monthIdx + 1, i));
    cells.push({ iso: d.toISOString().slice(0, 10), day: i, inMonth: false });
  }

  const start24 = ampm === "PM" ? (hour % 12) + 12 : hour % 12;
  const startDecimal = start24 + minute / 60;
  const selDate = new Date(`${selected}T00:00:00Z`);
  const datePill = `${DAY_SHORT[selDate.getUTCDay()]}, ${MONTH_SHORT[selDate.getUTCMonth()]} ${selDate.getUTCDate()}`;

  return (
    <div className="mt-3 w-72 rounded-xl border border-border bg-popover p-4 shadow-xl shadow-black/40">
      {/* Month header */}
      <div className="flex items-center justify-between pb-3">
        <button
          aria-label="Previous month"
          className="flex size-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
          onClick={() => setMonth(new Date(Date.UTC(year, monthIdx - 1, 1)))}
        >
          <ChevronLeft className="size-4" />
        </button>
        <span className="text-sm font-semibold">
          {MONTH_FULL[monthIdx]} {year}
        </span>
        <button
          aria-label="Next month"
          className="flex size-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
          onClick={() => setMonth(new Date(Date.UTC(year, monthIdx + 1, 1)))}
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      {/* Day-of-week labels */}
      <div className="grid grid-cols-7 pb-1">
        {CAL_DOW.map((d) => (
          <div key={d} className="py-1 text-center text-xs font-medium text-muted-foreground">
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((cell) => (
          <button
            key={cell.iso}
            onClick={() => setSelected(cell.iso)}
            className={cn(
              "tnum mx-auto flex size-9 items-center justify-center rounded-lg text-sm transition-colors",
              cell.iso === selected
                ? "bg-accent font-semibold text-accent-foreground"
                : cell.inMonth
                  ? "text-foreground hover:bg-surface-2"
                  : "text-subtle hover:bg-surface-2",
            )}
          >
            {cell.day}
          </button>
        ))}
      </div>

      {/* Selected date + time */}
      <div className="flex items-center gap-2 pt-4">
        <span className="tnum rounded-lg border border-border bg-surface-2 px-2.5 py-1.5 text-xs font-medium">
          {datePill}
        </span>
        <div className="flex items-center rounded-lg border border-border bg-surface-2 px-2 py-1">
          <input
            value={hour}
            onChange={(e) => {
              const v = Math.max(1, Math.min(12, Number(e.target.value.replace(/\D/g, "")) || 1));
              setHour(v);
            }}
            aria-label="Start hour"
            className="tnum w-6 bg-transparent text-right text-xs outline-none"
          />
          <span className="px-0.5 text-xs text-muted-foreground">:</span>
          <input
            value={String(minute).padStart(2, "0")}
            onChange={(e) => {
              const v = Math.max(0, Math.min(59, Number(e.target.value.replace(/\D/g, "")) || 0));
              setMinute(v);
            }}
            aria-label="Start minute"
            className="tnum w-6 bg-transparent text-xs outline-none"
          />
          <button
            onClick={() => setAmpm((v) => (v === "AM" ? "PM" : "AM"))}
            className="ml-1 rounded px-1.5 py-0.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
          >
            {ampm}
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 pt-4">
        <button className="pill text-muted-foreground" onClick={onCancel}>
          Cancel
        </button>
        <button
          className="grad-accent inline-flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          onClick={() => onSave(selected, startDecimal)}
        >
          Save
        </button>
      </div>
    </div>
  );
}

function MiniWeek({
  label,
  dates,
  activeDates,
  chipName,
  chipColor,
  chipTime,
  highlight,
  className,
}: {
  label: string;
  dates: string[];
  activeDates: string[];
  chipName: string;
  chipColor: ProjectColor;
  chipTime: string;
  highlight?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[10px] border p-2",
        highlight ? "border-info/40 bg-info/5" : "border-border bg-surface-2/40",
        className,
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
