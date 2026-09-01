import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import {
  weekView,
  WEEK_OFFSET_MAX,
  WEEK_OFFSET_MIN,
  DEFAULT_WEEK_OFFSET,
} from "@/data/fixtures";
import { OptimizeBoard } from "@/components/app/OptimizeBoard";
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
        content:
          "Spot scope creep, overruns and over-capacity weeks — and fix them in one click.",
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
      {/* Header */}
      <div className="flex items-start gap-4 px-7 pb-1 pt-5">
        <span className="grad-accent flex size-10 shrink-0 items-center justify-center rounded-xl text-primary-foreground">
          <Sparkles className="size-5" />
        </span>
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight">Optimize</h1>
          <p className="max-w-2xl pt-1 text-sm text-muted-foreground">
            Your week, fine-tuned. Optimize reviews what you logged against what
            you planned, flags scope creep, estimate overruns and over-capacity
            weeks — and lets you fix each one in place.
          </p>
        </div>
      </div>

      {/* Week navigation — the only control on this page */}
      <div className="flex items-center gap-2 px-7 py-3">
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
        <button
          className={cn("pill", weekOffset === 0 && "text-accent-pink")}
          onClick={() => setWeekOffset(0)}
        >
          This week
        </button>
      </div>

      <div className="space-y-5 px-7">
        <OptimizeBoard week={week} />
      </div>
    </div>
  );
}
