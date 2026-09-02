import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight, Filter, Wallet } from "lucide-react";
import {
  weekView,
  WEEK_OFFSET_MAX,
  WEEK_OFFSET_MIN,
  DEFAULT_WEEK_OFFSET,
  WEEKLY_CAPACITY,
  formatHours,
  money,
  type WeekView,
} from "@/data/fixtures";
import {
  capacityResolution,
  capacitySignal,
  committedHoursForWeek,
  overrunTasks,
  scopeCreepTasks,
  useEstimateOverrides,
} from "@/lib/week-signals";
import { OptimizeBoard } from "@/components/app/OptimizeBoard";
import { Stat } from "@/components/app/primitives";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/optimize")({
  validateSearch: (search: Record<string, unknown>) => ({
    week:
      typeof search["week"] === "number" &&
      search["week"] >= WEEK_OFFSET_MIN &&
      search["week"] <= WEEK_OFFSET_MAX
        ? search["week"]
        : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Optimize — Focus Replica" },
      {
        name: "description",
        content:
          "Weekly optimization: scope creep, estimate overruns and capacity signals, with concrete actions to rebalance your week.",
      },
      { property: "og:title", content: "Optimize — Focus Replica" },
      {
        property: "og:description",
        content: "Spot scope creep, overruns and over-capacity weeks — and fix them in one click.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: OptimizeScreen,
});

function OptimizeScreen() {
  const { week: weekParam } = Route.useSearch();
  const [weekOffset, setWeekOffset] = useState(weekParam ?? DEFAULT_WEEK_OFFSET);
  const week = weekView(weekOffset);

  return (
    <div className="pb-12">
      {/* Header — plain title + Reports-style controls, no decoration */}
      <div className="flex items-center gap-3 px-7 pb-3 pt-5">
        <h1 className="text-2xl font-semibold tracking-tight">Optimize</h1>
        <button className="pill ml-auto text-muted-foreground">
          <Wallet className="size-3.5" />
          Displayed in EUR
          <ChevronDown className="size-3.5" />
        </button>
      </div>

      {/* Toolbar — week navigation + filters, mirrors Reports */}
      <div className="flex flex-wrap items-center gap-2 px-7 py-3">
        <div className="flex items-center gap-1">
          <button
            className="pill size-8 justify-center !px-0 disabled:opacity-40"
            onClick={() => setWeekOffset((o) => Math.max(o - 1, WEEK_OFFSET_MIN))}
            disabled={weekOffset <= WEEK_OFFSET_MIN}
            aria-label="Previous week"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button className="pill">
            <CalendarDays className="size-3.5 text-muted-foreground" />
            {week.rangeLabel} • W{week.weekNumber}
          </button>
          <button
            className="pill size-8 justify-center !px-0 disabled:opacity-40"
            onClick={() => setWeekOffset((o) => Math.min(o + 1, WEEK_OFFSET_MAX))}
            disabled={weekOffset >= WEEK_OFFSET_MAX}
            aria-label="Next week"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
        <button className="pill">
          <Filter className="size-3.5 text-muted-foreground" />
          Filters
        </button>
        <button
          className={cn("pill", weekOffset === 0 && "text-accent-pink")}
          onClick={() => setWeekOffset(0)}
        >
          This week
        </button>
      </div>

      <div className="space-y-5 px-7">
        <OptimizeSummary week={week} />
        <OptimizeBoard week={week} />
      </div>
    </div>
  );
}

/**
 * Week-summary header for Optimize — a Reports-style stat row plus a one-line
 * verdict. Purely derived from the same mocked signals the cards below use, via
 * `useEstimateOverrides`, so closing an insight (setting an estimate, moving a
 * task, leaving one as is) live-updates the open count, the amount at stake and
 * the verdict. No new logic — it only aggregates existing signal state.
 */
function OptimizeSummary({ week }: { week: WeekView }) {
  useEstimateOverrides();

  const { logged, planned, total } = committedHoursForWeek(week.from, week.to);
  const over = total - WEEKLY_CAPACITY;

  const scopeCreep = scopeCreepTasks(week); // unresolved only
  const overrun = overrunTasks(week); // unresolved only
  const openScope = scopeCreep.length > 0;
  const openOverrun = overrun.length > 0;
  const openCapacity = capacitySignal(week) != null && capacityResolution(week) == null;

  const openCount = [openScope, openCapacity, openOverrun].filter(Boolean).length;
  const criticalCount = openScope ? 1 : 0; // scope creep is the critical signal

  const unbilled = scopeCreep.reduce((s, r) => s + (r.amount ?? 0), 0);
  const overBudget = overrun.reduce((s, r) => s + (r.overCost ?? 0), 0);
  const atStake = unbilled + overBudget;

  const capacityHint =
    over > 0
      ? `+${formatHours(over)} over`
      : over < 0
        ? `${formatHours(-over)} to spare`
        : "at capacity";

  const insightsHint =
    openCount === 0
      ? "all clear"
      : criticalCount > 0
        ? `${criticalCount} need${criticalCount > 1 ? "" : "s"} action now`
        : "none critical";

  const stakeHint =
    unbilled > 0 && overBudget > 0
      ? "unbilled + over budget"
      : unbilled > 0
        ? "unbilled"
        : overBudget > 0
          ? "over budget"
          : "nothing at risk";

  return (
    <div>
      <div className="panel flex flex-wrap divide-x divide-border">
        <Stat
          label="Committed"
          value={formatHours(total)}
          hint={`${formatHours(logged)} logged · ${formatHours(planned)} planned`}
        />
        <Stat
          label="Capacity"
          value={formatHours(WEEKLY_CAPACITY)}
          hint={capacityHint}
          hintClassName={cn(over > 0 ? "text-info" : over < 0 && "text-positive")}
        />
        <Stat label="Open insights" value={String(openCount)} hint={insightsHint} />
        <Stat
          label="At stake"
          value={money(atStake)}
          hint={stakeHint}
          valueClassName={cn(atStake > 0 && "text-destructive")}
        />
      </div>
      <OptimizeVerdict
        openCount={openCount}
        criticalCount={criticalCount}
        over={over}
        openCapacity={openCapacity}
        unbilled={unbilled}
        overBudget={overBudget}
      />
    </div>
  );
}

function OptimizeVerdict({
  openCount,
  criticalCount,
  over,
  openCapacity,
  unbilled,
  overBudget,
}: {
  openCount: number;
  criticalCount: number;
  over: number;
  openCapacity: boolean;
  unbilled: number;
  overBudget: number;
}) {
  const dotClass =
    openCount === 0
      ? "bg-positive"
      : criticalCount > 0
        ? "bg-destructive"
        : openCapacity
          ? "bg-info"
          : "bg-warning";

  return (
    <div className="mt-3 flex items-center gap-2.5 text-sm text-muted-foreground">
      <span className={cn("size-1.5 shrink-0 rounded-full", dotClass)} />
      {openCount === 0 ? (
        <span>
          Your week is <b className="font-semibold text-foreground">balanced</b> — nothing left to
          optimize.
        </span>
      ) : (
        <span>
          This week is{" "}
          <b className="font-semibold text-foreground">
            {over > 0 ? "over capacity" : "within capacity"}
          </b>{" "}
          with{" "}
          <b className="font-semibold text-foreground">
            {criticalCount > 0 ? `${criticalCount} critical` : `${openCount} open`}
          </b>{" "}
          signal{(criticalCount > 0 ? criticalCount : openCount) > 1 ? "s" : ""}
          {unbilled > 0 ? (
            <>
              {" "}
              — <b className="tnum font-semibold text-foreground">{money(unbilled)}</b> of billable
              work is still unestimated.
            </>
          ) : overBudget > 0 ? (
            <>
              {" "}
              — <b className="tnum font-semibold text-foreground">{money(overBudget)}</b> logged
              over budget.
            </>
          ) : (
            "."
          )}
        </span>
      )}
    </div>
  );
}
