import { createFileRoute } from "@tanstack/react-router";
import { Palmtree } from "lucide-react";
import { Card, EmptyState, PrimaryButton } from "@/components/app/primitives";

export const Route = createFileRoute("/time-off")({
  head: () => ({
    meta: [
      { title: "Congé — Focus Replica" },
      {
        name: "description",
        content:
          "Module de gestion des congés, non activé sur cet espace de travail en période d'essai.",
      },
      { property: "og:title", content: "Congé — Focus Replica" },
      {
        property: "og:description",
        content: "Gestion des congés et absences de l'équipe.",
      },
    ],
  }),
  component: TimeOffScreen,
});

function TimeOffScreen() {
  return (
    <div className="pb-12">
      <div className="flex items-center gap-3 px-7 pb-3 pt-5">
        <h1 className="text-2xl font-semibold tracking-tight">Congé</h1>
      </div>

      <div className="space-y-5 px-7 pt-2">
        <div className="panel flex items-center gap-4 p-5">
          <span className="grad-accent rounded-full px-2.5 py-1 text-[11px] font-semibold text-primary-foreground">
            Premium
          </span>
          <div className="text-sm">
            <div className="font-semibold">Le module Congé n'est pas activé</div>
            <p className="pt-1 text-muted-foreground">
              Suivez les absences, les jours fériés et les soldes de congés de votre équipe.
            </p>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <span className="tnum text-sm text-muted-foreground">
              $2/utilisateur/mois
            </span>
            <PrimaryButton>Activer le module</PrimaryButton>
          </div>
        </div>

        <Card className="p-0">
          <EmptyState
            icon={<Palmtree className="size-10" />}
            title="Aucun congé enregistré"
            description="Une fois le module activé, les demandes et soldes de congés de chaque membre apparaîtront ici."
          />
        </Card>
      </div>
    </div>
  );
}
