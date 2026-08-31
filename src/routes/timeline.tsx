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
import { currentUser, projectById, projectColorClass, tasks } from "@/data/fixtures";
import { EmptyState, PrimaryButton } from "@/components/app/primitives";
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

const days = [
  { label: "Sun", num: 30 },
  { label: "Mon", num: 31, today: true },
  { label: "Tue", num: 1 },
  { label: "Wed", num: 2 },
  { label: "Thu", num: 3 },
  { label: "Fri", num: 4 },
  { label: "Sat", num: 5 },
];

const allocations = [
  { taskId: "t10", startDay: 1, span: 1, perDay: "3h /day" },
  { taskId: "t11", startDay: 1, span: 1, perDay: "2h /day" },
  { taskId: "t6", startDay: 2, span: 1, perDay: "1h /day" },
  { taskId: "t1", startDay: 2, span: 2, perDay: "3h /day" },
  { taskId: "t2", startDay: 4, span: 2, perDay: "2h /day" },
];

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
            People <span className="text-muted-foreground">1</span>
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

        {/* Unassigned row */}
        <div className="grid grid-cols-[280px_repeat(7,1fr)] border-b border-border">
          <div className="flex items-center gap-3 px-7 py-6 text-sm text-muted-foreground">
            <span className="flex size-6 items-center justify-center rounded-full bg-surface-2 text-[10px]">
              AR
            </span>
            Unassigned
          </div>
          {days.map((d) => (
            <div key={d.num} className="border-l border-border" />
          ))}
        </div>

        {/* Member row */}
        <div className="grid grid-cols-[280px_repeat(7,1fr)]">
          <div className="px-7 py-4">
            <div className="flex items-center gap-2 pb-2">
              <div className="h-1 w-24 overflow-hidden rounded-full bg-surface-2">
                <div className="grad-accent h-full w-1/4" />
              </div>
              <span className="tnum text-xs text-muted-foreground">10h / 40h</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="flex size-6 items-center justify-center rounded-full bg-surface-2 text-[10px]">
                {currentUser.initials}
              </span>
              {currentUser.name}
            </div>
            <div className="pt-2 text-xs text-positive">30h available</div>
          </div>

          <div className="relative col-span-7 grid min-h-[400px] grid-cols-7">
            {days.map((d) => (
              <div key={d.num} className="border-l border-border" />
            ))}


            <div className="absolute inset-x-0 top-1 grid grid-cols-7 text-xs">
              <div />
              <div className="tnum px-2 text-muted-foreground">3h</div>
              <div className="tnum px-2 text-warning">+5h 55m</div>
              <div className="tnum px-2 text-destructive">+7h 55m</div>
              <div />
              <div />
              <div className="tnum px-2 text-muted-foreground">7h</div>
            </div>

            <div className="absolute inset-x-0 top-7 space-y-1.5 px-1">
              {allocations.map((a) => {
                const task = tasks.find((t) => t.id === a.taskId)!;
                const project = projectById(task.projectId)!;
                return (
                  <div
                    key={a.taskId}
                    className={cn(
                      "relative h-12 overflow-hidden rounded-md px-2 py-1 text-[11px] leading-tight text-black/85",
                      projectColorClass[project.color],
                    )}
                    style={{
                      marginLeft: `${(a.startDay / 7) * 100}%`,
                      width: `${(a.span / 7) * 100}%`,
                    }}
                  >
                    <div className="truncate font-semibold">{task.name}</div>
                    <div className="truncate opacity-80">
                      {project.name} • {a.perDay}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <EmptyState
        title="Plan your team's capacity"
        description="See at a glance who is overbooked or under capacity. This space fills up with a lane for each person you invite."
        action={<PrimaryButton>Invite members</PrimaryButton>}
        icon={<Users className="size-10" />}
      />
    </div>
  );
}
