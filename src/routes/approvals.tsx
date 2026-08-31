import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, CheckCircle2, ChevronDown, Filter } from "lucide-react";
import { Card, EmptyState, PrimaryButton } from "@/components/app/primitives";
import { weekSummary } from "@/data/fixtures";

export const Route = createFileRoute("/approvals")({
  head: () => ({
    meta: [
      { title: "Approbations — Focus Replica" },
      {
        name: "description",
        content:
          "Workflow de validation des feuilles de temps : aucune demande en attente sur la période.",
      },
      { property: "og:title", content: "Approbations — Focus Replica" },
      {
        property: "og:description",
        content: "Validation des feuilles de temps de l'espace de travail.",
      },
    ],
  }),
  component: ApprovalsScreen,
});

function ApprovalsScreen() {
  return (
    <div className="pb-12">
      <div className="flex items-center gap-3 px-7 pb-3 pt-5">
        <h1 className="text-2xl font-semibold tracking-tight">Approbations</h1>
        <PrimaryButton className="ml-auto">Demander une approbation</PrimaryButton>
      </div>

      <div className="flex flex-wrap items-center gap-2 px-7 py-3">
        <button className="pill">
          En attente
          <ChevronDown className="size-3.5 text-muted-foreground" />
        </button>
        <button className="pill">
          <CalendarDays className="size-3.5 text-muted-foreground" />
          {weekSummary.rangeLabel}
        </button>
        <button className="pill">
          <Filter className="size-3.5 text-muted-foreground" />
          Filtres
        </button>
      </div>

      <div className="px-7">
        <Card className="p-0">
          <EmptyState
            icon={<CheckCircle2 className="size-10" />}
            title="Aucune feuille de temps en attente"
            description="Les feuilles de temps soumises par les membres apparaîtront ici pour validation. Rien à approuver sur la période sélectionnée."
          />
        </Card>
      </div>
    </div>
  );
}
