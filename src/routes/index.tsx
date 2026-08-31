import { createFileRoute } from "@tanstack/react-router";
import {
  AtSign,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Folder,
  Hash,
  LayoutGrid,
  List,
  MoreVertical,
  PanelRight,
  Plus,
  Settings,
  Square,
  Columns2,
} from "lucide-react";
import {
  calendarEvents,
  projectColorClass,
  runningTimer,
  weekDays,
  weekSummary,
} from "@/data/fixtures";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Minuteur — Focus Replica" },
      {
        name: "description",
        content:
          "Vue calendrier hebdomadaire du minuteur : temps enregistré, blocs par projet et suivi en cours.",
      },
      { property: "og:title", content: "Minuteur — Focus Replica" },
      {
        property: "og:description",
        content: "Vue calendrier hebdomadaire du minuteur avec données mockées.",
      },
    ],
  }),
  component: TimerScreen,
});

const START_HOUR = 3;
const END_HOUR = 20;
const HOUR_PX = 84;

function TimerScreen() {
  const hours = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);

  return (
    <div className="flex h-full flex-col">
      {/* Top bar */}
      <div className="flex items-center gap-3 border-b border-border px-6 py-3">
        <span className="text-lg font-semibold">Sur quoi travaillez-vous ?</span>
        <div className="ml-auto flex items-center gap-2">
          <button className="pill">
            <AtSign className="size-3.5 text-muted-foreground" />
            {runningTimer.description}
          </button>
          <button className="pill">
            <Folder className="size-3.5 text-positive" />
            {runningTimer.project}
          </button>
          <button className="pill">
            <Hash className="size-3.5 text-muted-foreground" />
            Étiquettes
          </button>
          <button className="text-muted-foreground transition-colors hover:text-foreground">
            <DollarSign className="size-4" />
          </button>
          <span className="tnum px-2 text-xl font-semibold">{runningTimer.elapsed}</span>
          <button
            className="flex size-9 items-center justify-center rounded-full bg-destructive transition-opacity hover:opacity-90"
            aria-label="Arrêter le minuteur"
          >
            <Square className="size-3.5 fill-background text-background" />
          </button>
          <button className="text-muted-foreground transition-colors hover:text-foreground">
            <MoreVertical className="size-4" />
          </button>
        </div>
      </div>

      {/* Week selector row */}
      <div className="flex items-center gap-2 px-6 py-3">
        <button className="pill size-8 justify-center !px-0">
          <ChevronLeft className="size-4" />
        </button>
        <button className="pill">
          <CalendarDays className="size-3.5 text-muted-foreground" />
          {weekSummary.rangeLabel} • S35
        </button>
        <button className="pill size-8 justify-center !px-0">
          <ChevronRight className="size-4" />
        </button>
        <button className="pill">Aujourd'hui</button>

        <div className="ml-auto flex items-center gap-2">
          <button className="pill">
            Semaine
            <ChevronDown className="size-3.5 text-muted-foreground" />
          </button>
          <div className="flex items-center gap-1 rounded-full border border-border bg-surface-2 p-1">
            <span className="grad-accent flex size-7 items-center justify-center rounded-full">
              <CalendarDays className="size-3.5 text-primary-foreground" />
            </span>
            <button className="flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground">
              <Columns2 className="size-3.5" />
            </button>
            <button className="flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground">
              <List className="size-3.5" />
            </button>
            <button className="flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground">
              <LayoutGrid className="size-3.5" />
            </button>
          </div>
          <button className="text-muted-foreground transition-colors hover:text-foreground">
            <Settings className="size-4" />
          </button>
          <button className="text-muted-foreground transition-colors hover:text-foreground">
            <PanelRight className="size-4" />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-4 px-6 pb-3">
        <span className="text-sm text-muted-foreground">Enregistré</span>
        <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-surface-2">
          <div
            className="grad-accent absolute inset-y-0 left-0 rounded-full"
            style={{ width: `${weekSummary.progress * 100}%` }}
          />
          <div
            className="absolute inset-y-0 rounded-full bg-positive/80"
            style={{ left: `${weekSummary.progress * 100}%`, right: 0 }}
          />
        </div>
        <span className="tnum text-sm font-semibold">{weekSummary.tracked}</span>
        <span className="text-sm text-muted-foreground">
          Prévu {weekSummary.planned}
        </span>
        <button className="text-sm text-muted-foreground transition-colors hover:text-foreground">
          Voir les rapports ›
        </button>
      </div>

      {/* Calendar */}
      <div className="flex-1 overflow-auto border-t border-border">
        <div className="min-w-[980px]">
          {/* Day headers */}
          <div className="sticky top-0 z-10 grid grid-cols-[72px_repeat(7,1fr)] border-b border-border bg-background">
            <div className="flex items-center justify-center gap-2 py-3 text-muted-foreground">
              <span className="text-sm">–</span>
              <Plus className="size-3.5" />
            </div>
            {weekDays.map((d) => (
              <div
                key={d.num}
                className="flex items-baseline gap-2 border-l border-border px-3 py-3"
              >
                <span className="tnum text-xl font-semibold">{d.num}</span>
                <div className="leading-tight">
                  <div className="text-sm font-medium">{d.label}</div>
                  <div className="tnum text-xs text-muted-foreground">{d.hours}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="relative grid grid-cols-[72px_repeat(7,1fr)]">
            <div>
              {hours.map((h) => (
                <div
                  key={h}
                  className="relative border-b border-border/40"
                  style={{ height: HOUR_PX }}
                >
                  <span className="absolute -top-2 right-3 text-xs text-subtle">
                    {formatHour(h)}
                  </span>
                </div>
              ))}
            </div>

            {weekDays.map((d, dayIndex) => (
              <div key={d.num} className="relative border-l border-border">
                {hours.map((h) => (
                  <div
                    key={h}
                    className="border-b border-border/40"
                    style={{ height: HOUR_PX }}
                  />
                ))}

                {calendarEvents
                  .filter((e) => e.day === dayIndex)
                  .map((e) => {
                    const hasLane = e.lane !== undefined;
                    return (
                      <div
                        key={e.id}
                        className={cn(
                          "absolute overflow-hidden rounded-lg border border-black/20 px-2 py-1.5 text-[11px] leading-tight text-black/85 shadow-sm",
                          projectColorClass[e.color],
                        )}
                        style={{
                          top: (e.start - START_HOUR) * HOUR_PX,
                          height: Math.max((e.end - e.start) * HOUR_PX - 4, 22),
                          left: hasLane && e.lane === 1 ? "50%" : "4px",
                          right: hasLane && e.lane === 0 ? "50%" : "4px",
                        }}
                      >
                        <div className="font-semibold">{e.title}</div>
                        {e.subtitle && (
                          <div className="truncate opacity-75">{e.subtitle}</div>
                        )}
                        {e.end - e.start >= 0.5 && (
                          <div className="tnum absolute bottom-1 left-2 opacity-80">
                            ⏱ {e.duration}
                          </div>
                        )}
                        {e.billable && (
                          <div className="absolute bottom-1 right-2 opacity-80">$</div>
                        )}
                      </div>
                    );
                  })}

                {dayIndex === 6 && (
                  <div
                    className="pointer-events-none absolute inset-x-0 z-10 border-t border-destructive"
                    style={{ top: (10.5 - START_HOUR) * HOUR_PX }}
                  >
                    <span className="absolute -left-1 -top-1 size-2 rounded-full bg-destructive" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatHour(h: number) {
  const suffix = h < 12 ? "AM" : "PM";
  const base = h % 12 === 0 ? 12 : h % 12;
  return `${base}:00 ${suffix}`;
}
