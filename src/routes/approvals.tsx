import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, CheckCircle2, ChevronDown, Filter } from "lucide-react";
import { Card, EmptyState, PrimaryButton } from "@/components/app/primitives";
import { weekSummary } from "@/data/fixtures";

export const Route = createFileRoute("/approvals")({
  head: () => ({
    meta: [
      { title: "Approvals — Focus Replica" },
      {
        name: "description",
        content:
          "Timesheet approval workflow: no pending requests for the selected period.",
      },
      { property: "og:title", content: "Approvals — Focus Replica" },
      {
        property: "og:description",
        content: "Workspace timesheet approvals.",
      },
    ],
  }),
  component: ApprovalsScreen,
});

function ApprovalsScreen() {
  return (
    <div className="pb-12">
      <div className="flex items-center gap-3 px-7 pb-3 pt-5">
        <h1 className="text-2xl font-semibold tracking-tight">Approvals</h1>
        <PrimaryButton className="ml-auto">Request approval</PrimaryButton>
      </div>

      <div className="flex flex-wrap items-center gap-2 px-7 py-3">
        <button className="pill">
          Pending
          <ChevronDown className="size-3.5 text-muted-foreground" />
        </button>
        <button className="pill">
          <CalendarDays className="size-3.5 text-muted-foreground" />
          {weekSummary.rangeLabel}
        </button>
        <button className="pill">
          <Filter className="size-3.5 text-muted-foreground" />
          Filters
        </button>
      </div>

      <div className="px-7">
        <Card className="p-0">
          <EmptyState
            icon={<CheckCircle2 className="size-10" />}
            title="No pending timesheets"
            description="Timesheets submitted by members will show up here for approval. Nothing to approve in the selected period."
          />
        </Card>
      </div>
    </div>
  );
}
