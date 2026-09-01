import { Link } from "@tanstack/react-router";
import { AlertTriangle, CheckCircle2, Clock3, Info } from "lucide-react";
import { scopeCreepTasks, isPastEntry, useEstimateOverrides } from "@/lib/week-signals";
import {
  formatHours,
  plannedEntries,
  projectById,
  tasks,
  timeEntries,
  projectColorClass,
  type ProjectColor,
  type WeekView,
} from "@/data/fixtures";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Signal computation — derived from the fixtures data layer           */
/* ------------------------------------------------------------------ */

type Signal =
  | {
      kind: "scope-creep";
      projectName: string;
      client: string | null;
      hours: number;
      amount: number | null;
    }
  | {
      kind: "overrun";
      projectName: string;
      client: string | null;
      taskName: string;
      logged: number;
      estimate: number;
    }
  | { kind: "uncovered"; hours: number; projectName: string };

type Severity = "critical" | "warning" | "info" | "healthy";

type WeekStatus = {
  severity: Severity;
  primary: string;
  secondary: string | null;
};

const isPast = isPastEntry;

function computeSignals(week: WeekView): Signal[] {
  const logged = timeEntries.filter(
    (e) => e.date >= week.from && e.date <= week.to && isPast(e),
  );

  /* 1. Scope creep — shared logic (see @/lib/week-signals) */
  const scopeHoursByProject = new Map<string, number>();
  for (const row of scopeCreepTasks(week)) {
    scopeHoursByProject.set(
      row.projectId,
      (scopeHoursByProject.get(row.projectId) ?? 0) + row.hours,
    );
  }
  const scopeCreep: Signal[] = [...scopeHoursByProject.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([projectId, hours]) => {
      const project = projectById(projectId)!;
      return {
        kind: "scope-creep" as const,
        projectName: project.name,
        client: project.client,
        hours,
        amount: project.rate != null ? Math.round((hours * project.rate) / 10) * 10 : null,
      };
    });

  /* 2. Overrun: had an estimate, past logged time exceeds it, active this week */
  const overrun: Signal[] = tasks
    .filter(
      (t) =>
        t.estimateHours != null &&
        t.tracked > t.estimateHours &&
        logged.some((e) => e.taskId === t.id),
    )
    .sort((a, b) => (b.delta ?? 0) - (a.delta ?? 0))
    .map((t) => {
      const project = projectById(t.projectId)!;
      return {
        kind: "overrun" as const,
        projectName: project.name,
        client: project.client,
        taskName: t.name,
        logged: t.tracked,
        estimate: t.estimateHours!,
      };
    });

  /* 3. Secondary: billable time logged without an active rate */
  const uncoveredHours = logged
    .filter((e) => e.billable && e.revenue === 0)
    .reduce((s, e) => s + e.duration, 0);
  const secondary: Signal[] =
    uncoveredHours > 0
      ? [
          {
            kind: "uncovered" as const,
            hours: uncoveredHours,
            projectName:
              projectById(
                logged.find((e) => e.billable && e.revenue === 0)!.projectId!,
              )?.name ?? "—",
          },
        ]
      : [];

  return [...scopeCreep, ...overrun, ...secondary];
}

function computeWeekStatus(week: WeekView): WeekStatus {
  const signals = computeSignals(week);
  if (signals.length === 0) {
    return {
      severity: "healthy",
      primary: "✓ Everything's on track this week.",
      secondary: null,
    };
  }

  const main = signals[0]!;
  const extra = signals.length - 1;
  const moreSuffix =
    extra > 0 ? ` · +${extra} more signal${extra > 1 ? "s" : ""}` : "";

  if (main.kind === "scope-creep") {
    return {
      severity: "critical",
      primary: `Scope creep on ${main.projectName}${main.client ? ` — ${main.client}` : ""}`,
      secondary:
        `${formatHours(main.hours)} off-scope` +
        (main.amount != null ? ` (~€${main.amount.toLocaleString("en-US")})` : "") +
        moreSuffix,
    };
  }
  if (main.kind === "overrun") {
    return {
      severity: "warning",
      primary: `A task ran over estimate on ${main.projectName}${main.client ? ` — ${main.client}` : ""}`,
      secondary: `${main.taskName}: ${formatHours(main.logged)} logged vs ${formatHours(main.estimate)} estimated${moreSuffix}`,
    };
  }
  return {
    severity: "info",
    primary: `${formatHours(main.hours)} billable time has no active rate on ${main.projectName}.`,
    secondary: `Add a rate so this time counts toward revenue${moreSuffix}`,
  };
}

/* ------------------------------------------------------------------ */
/* Presentation                                                        */
/* ------------------------------------------------------------------ */

const severityStyle: Record<
  Severity,
  { icon: typeof CheckCircle2; iconClass: string; tint: string | null }
> = {
  critical: {
    icon: AlertTriangle,
    iconClass: "text-destructive",
    tint: "color-mix(in oklab, var(--color-destructive) 10%, transparent)",
  },
  warning: {
    icon: Clock3,
    iconClass: "text-warning",
    tint: "color-mix(in oklab, var(--color-warning) 8%, transparent)",
  },
  info: {
    icon: Info,
    iconClass: "text-muted-foreground",
    tint: "color-mix(in oklab, var(--color-surface-2) 60%, transparent)",
  },
  healthy: {
    icon: CheckCircle2,
    iconClass: "text-positive",
    tint: null,
  },
};

function SegmentedBar({
  label,
  total,
  segments,
  dashed,
}: {
  label: string;
  total: string;
  segments: { color: ProjectColor; hours: number }[];
  dashed?: boolean;
}) {
  const sum = segments.reduce((s, x) => s + x.hours, 0);
  return (
    <div className="w-36">
      <div className="flex items-baseline justify-between text-[11px]">
        <span className="text-subtle">{label}</span>
        <span className="tnum text-muted-foreground">{total}</span>
      </div>
      <div
        className={cn(
          "mt-1 flex h-1.5 overflow-hidden rounded-full bg-surface-2",
          dashed && "border border-dashed border-border bg-transparent",
        )}
      >
        {segments.map((s, i) => (
          <div
            key={i}
            className={cn(projectColorClass[s.color], dashed && "opacity-50")}
            style={{ width: `${sum ? (s.hours / sum) * 100 : 0}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export function WeekStatusBar({ week }: { week: WeekView }) {
  useEstimateOverrides();
  const status = computeWeekStatus(week);
  const style = severityStyle[status.severity];
  const Icon = style.icon;

  const loggedByProject = new Map<string, number>();
  for (const e of timeEntries) {
    if (e.date < week.from || e.date > week.to || !e.projectId || !isPast(e)) continue;
    loggedByProject.set(e.projectId, (loggedByProject.get(e.projectId) ?? 0) + e.duration);
  }
  const plannedByProject = new Map<string, number>();
  for (const e of plannedEntries) {
    if (e.date < week.from || e.date > week.to || !e.projectId) continue;
    plannedByProject.set(e.projectId, (plannedByProject.get(e.projectId) ?? 0) + e.duration);
  }
  const toSegments = (m: Map<string, number>) =>
    [...m.entries()].map(([pid, hours]) => ({
      color: projectById(pid)?.color ?? ("pink" as const),
      hours,
    }));

  return (
    <div className="px-6 pb-3">
      <Link
        to="/reports"
        search={{ view: "Impact" }}
        className={cn(
          "flex cursor-pointer items-center gap-4 rounded-xl border border-border px-4 py-2.5 transition-colors hover:border-muted-foreground/40",
          status.severity === "critical" && "border-destructive/40",
          status.severity === "warning" && "border-warning/40",
        )}
        style={style.tint ? { backgroundColor: style.tint } : undefined}
      >
        {/* Message zone — the row's primary element */}
        <div className="flex min-w-0 items-center gap-3">
          <Icon className={cn("size-5 shrink-0", style.iconClass)} />
          <div className="min-w-0 leading-tight">
            <div
              className={cn(
                "truncate text-sm",
                status.severity === "healthy"
                  ? "text-muted-foreground"
                  : "font-semibold text-foreground",
              )}
            >
              {status.primary}
            </div>
            {status.secondary && (
              <div className="truncate text-xs text-muted-foreground">
                {status.secondary}
              </div>
            )}
          </div>
        </div>

        {/* Compact Logged/Planned block + reports link */}
        <div className="ml-auto flex shrink-0 items-center gap-5">
          <SegmentedBar
            label="Logged"
            total={week.summary.tracked}
            segments={toSegments(loggedByProject)}
          />
          <SegmentedBar
            label="Planned"
            total={week.summary.planned}
            segments={toSegments(plannedByProject)}
            dashed
          />
          <span className="text-xs text-muted-foreground">View reports ›</span>
        </div>
      </Link>
    </div>
  );
}
