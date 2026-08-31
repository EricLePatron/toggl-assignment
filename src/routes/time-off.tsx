import { createFileRoute } from "@tanstack/react-router";
import { Palmtree } from "lucide-react";
import { Card, EmptyState, PrimaryButton } from "@/components/app/primitives";

export const Route = createFileRoute("/time-off")({
  head: () => ({
    meta: [
      { title: "Time off — Focus Replica" },
      {
        name: "description",
        content:
          "Time off management module, not enabled on this trial workspace.",
      },
      { property: "og:title", content: "Time off — Focus Replica" },
      {
        property: "og:description",
        content: "Team time off and absence management.",
      },
    ],
  }),
  component: TimeOffScreen,
});

function TimeOffScreen() {
  return (
    <div className="pb-12">
      <div className="flex items-center gap-3 px-7 pb-3 pt-5">
        <h1 className="text-2xl font-semibold tracking-tight">Time off</h1>
      </div>

      <div className="space-y-5 px-7 pt-2">
        <div className="panel flex items-center gap-4 p-5">
          <span className="grad-accent rounded-full px-2.5 py-1 text-[11px] font-semibold text-primary-foreground">
            Premium
          </span>
          <div className="text-sm">
            <div className="font-semibold">The Time off add-on is not enabled</div>
            <p className="pt-1 text-muted-foreground">
              Track your team's absences, public holidays and time off balances.
            </p>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <span className="tnum text-sm text-muted-foreground">2 €/user/month</span>
            <PrimaryButton>Enable add-on</PrimaryButton>
          </div>
        </div>

        <Card className="p-0">
          <EmptyState
            icon={<Palmtree className="size-10" />}
            title="No time off recorded"
            description="Once the add-on is enabled, each member's requests and balances will appear here."
          />
        </Card>
      </div>
    </div>
  );
}
