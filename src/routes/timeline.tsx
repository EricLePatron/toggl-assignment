import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowUpDown,
  CalendarRange,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  Minus,
  PanelRight,
  Plus,
  Settings,
  Users,
} from "lucide-react";
import {
  CURRENT_WEEK_START,
  formatHours,
  memberWeeks,
  projectById,
  projectColorClass,
  teamMembers,
  tasks,
} from "@/data/fixtures";
import { PrimaryButton } from "@/components/app/primitives";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/timeline")({
  head: () => ({
    meta: [
      { title: "Timeline — Focus Replica" },
      {
        name: "description",
        content:
          "Capacity view per person: daily allocations, available capacity and over-allocation.",
      },
      { property: "og:title", content: "Timeline — Focus Replica" },
      {
        property: "og:description",
        content: "Weekly capacity planning per person.",
      },
    ],
  }),
  component: TimelineScreen,
});

const WEEK_START = new Date(CURRENT_WEEK_START.getTime() - 24 * 3600 * 1000); // Sunday
const dayDate = (i: number) => new Date(WEEK_START.getTime() + i * 24 * 3600 * 1000);
const days = Array.from({ length: 7 }, (_, i) => {
  const date = dayDate(i);
  return {
    label: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][i]!,
    num: date.getUTCDate(),
    today: date.getTime() === CURRENT_WEEK_START.getTime(),
    iso: date.toISOString().slice(0, 10),
  };
});

const weekKey = CURRENT_WEEK_START.toISOString().slice(0, 10);

/** Open tasks overlapping the displayed week, laid out per member. */
function allocationsFor(memberId: string) {
  return tasks
    .filter(
      (t) =>
        t.assigneeId === memberId &&
        t.status !== "Done" &&
        t.kind !== "ongoing" &&
        t.endDate >= days[0]!.iso &&
        t.startDate <= days[6]!.iso,
    )
    .map((t) => {
      const startDay = Math.max(
        0,
        days.findIndex((d) => d.iso >= t.startDate),
      );
      const endDay = (() => {
        const idx = days.findIndex((d) => d.iso >= t.endDate);
        return idx === -1 ? 6 : idx;
      })();
      const span = Math.max(1, endDay - startDay + 1);
      const remaining = Math.max(0.5, (t.estimateHours ?? t.tracked) - t.tracked);
      return {
        task: t,
        startDay,
        span,
        perDay: `${formatHours(Math.max(0.5, remaining / span))} /day`,
      };
    });
}

function TimelineScreen() {
  return (
    <div className="pb-12">
      <div className="flex items-center gap-3 px-7 pb-3 pt-5">
        <h1 className="text-2xl font-semibold tracking-tight">Timeline</h1>
        <PrimaryButton className="ml-auto">
          <Plus className="size-4" />
          Add member
        </PrimaryButton>
      </div>

      <div className="flex flex-wrap items-center gap-2 px-7 py-3">
        <button className="pill">
          <Users className="size-3.5 text-muted-foreground" />
          People
          <ChevronDown className="size-3.5 text-muted-foreground" />
        </button>
        <button className="pill">
          <Filter className="size-3.5 text-muted-foreground" />
          Filters
        </button>
        <button className="pill">
          <ArrowUpDown className="size-3.5 text-muted-foreground" />
          Sort by: <span className="text-accent-pink">Name</span>
        </button>
        <button className="pill">
          <CalendarRange className="size-3.5 text-muted-foreground" />
          Capacity: <span className="text-accent-pink">This week</span>
        </button>
        <div className="ml-auto flex items-center gap-2">
          <button className="pill size-8 justify-center !px-0">
            <ChevronLeft className="size-4" />
          </button>
          <button className="pill size-8 justify-center !px-0">
            <ChevronRight className="size-4" />
          </button>
          <button className="pill">Weeks</button>
          <button className="pill size-8 justify-center !px-0">
            <Minus className="size-4" />
          </button>
          <button className="pill size-8 justify-center !px-0">
            <Plus className="size-4" />
          </button>
          <Settings className="size-4 text-muted-foreground" />
          <PanelRight className="size-4 text-muted-foreground" />
        </div>
      </div>

      <div className="border-y border-border">
        <div className="grid grid-cols-[280px_repeat(7,1fr)] border-b border-border">
          <div className="px-7 py-3 text-sm font-semibold">
            People <span className="text-muted-foreground">{teamMembers.length}</span>
          </div>
          {days.map((d) => (
            <div
              key={d.num}
              className={cn(
                "border-l border-border px-3 py-3 text-sm",
                d.today && "text-accent-pink",
              )}
            >
              <span className="text-muted-foreground">{d.label}</span>{" "}
              <span className={cn("tnum", d.today && "font-semibold")}>{d.num}</span>
            </div>
          ))}
        </div>

        {teamMembers.map((member) => {
          const week = memberWeeks.find(
            (w) => w.memberId === member.id && w.weekStart === weekKey,
          );
          const tracked = week?.tracked ?? 0;
          const capacity = member.capacity;
          const over = tracked > capacity;
          const allocations = allocationsFor(member.id);
          return (
            <div
              key={member.id}
              className="grid grid-cols-[280px_repeat(7,1fr)] border-b border-border last:border-0"
            >
              <div className="px-7 py-4">
                <div className="flex items-center gap-2 pb-2">
                  <div className="h-1 w-24 overflow-hidden rounded-full bg-surface-2">
                    <div
                      className={cn("h-full", over ? "bg-destructive" : "grad-accent")}
                      style={{ width: `${Math.min((tracked / capacity) * 100, 100)}%` }}
                    />
                  </div>
                  <span className="tnum text-xs text-muted-foreground">
                    {formatHours(tracked)} / {capacity}h
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="flex size-6 items-center justify-center rounded-full bg-surface-2 text-[10px]">
                    {member.initials}
                  </span>
                  {member.name}
                </div>
                <div
                  className={cn(
                    "pt-2 text-xs",
                    over ? "text-destructive" : "text-positive",
                  )}
                >
                  {over
                    ? `${formatHours(tracked - capacity)} over capacity`
                    : `${formatHours(capacity - tracked)} available`}
                </div>
              </div>

              <div className="relative col-span-7 grid min-h-[160px] grid-cols-7">
                {days.map((d) => (
                  <div key={d.num} className="border-l border-border" />
                ))}

                <div className="absolute inset-x-0 top-2 space-y-1.5 px-1">
                  {allocations.map((a) => {
                    const project = projectById(a.task.projectId)!;
                    return (
                      <div
                        key={a.task.id}
                        className={cn(
                          "relative h-12 overflow-hidden rounded-md px-2 py-1 text-[11px] leading-tight text-black/85",
                          projectColorClass[project.color],
                        )}
                        style={{
                          marginLeft: `${(a.startDay / 7) * 100}%`,
                          width: `${(a.span / 7) * 100}%`,
                        }}
                      >
                        <div className="truncate font-semibold">{a.task.name}</div>
                        <div className="truncate opacity-80">
                          {project.name} • {a.perDay}
                        </div>
                      </div>
                    );
                  })}
                  {!allocations.length && (
                    <div className="px-3 py-4 text-xs text-subtle">
                      No planned work this week
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
