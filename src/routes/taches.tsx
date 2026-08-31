import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowUpDown,
  CalendarDays,
  ChevronDown,
  Filter,
  Group,
  Kanban,
  List,
  Plus,
  Search,
  Settings,
  Sparkle,
} from "lucide-react";
import { projectById, projectColorClass, tasks } from "@/data/fixtures";
import { PrimaryButton, StatusBadge } from "@/components/app/primitives";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/taches")({
  head: () => ({
    meta: [
      { title: "Tâches — Focus Replica" },
      {
        name: "description",
        content:
          "Liste des tâches par projet avec dates, estimation, priorité, étiquette, assigné et statut.",
      },
      { property: "og:title", content: "Tâches — Focus Replica" },
      {
        property: "og:description",
        content: "Toutes les tâches du workspace avec priorité et statut.",
      },
    ],
  }),
  component: TasksScreen,
});

function TasksScreen() {
  return (
    <div className="pb-12">
      <div className="flex items-center gap-3 px-7 pb-3 pt-5">
        <h1 className="text-2xl font-semibold tracking-tight">
          Tâches <span className="text-muted-foreground">· Liste</span>
        </h1>
        <PrimaryButton className="ml-auto">
          <Plus className="size-4" />
          Ajouter une tâche
        </PrimaryButton>
      </div>

      <div className="flex flex-wrap items-center gap-2 px-7 py-3">
        <button className="pill">
          <CalendarDays className="size-3.5 text-muted-foreground" />
          Aujourd'hui
          <ChevronDown className="size-3.5 text-muted-foreground" />
        </button>
        <button className="pill">
          <Filter className="size-3.5 text-muted-foreground" />
          Filtres
          <span className="grad-accent rounded-full px-1.5 text-[10px] font-semibold text-primary-foreground">
            2
          </span>
        </button>
        <button className="pill">
          <Group className="size-3.5 text-muted-foreground" />
          Grouper par : <span className="text-accent-pink">Projet</span>
        </button>
        <button className="pill">
          <ArrowUpDown className="size-3.5 text-muted-foreground" />
          Trier par : <span className="text-accent-pink">Priorité</span>
        </button>
        <button className="pill">Réinitialiser</button>
        <div className="ml-auto flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-full border border-border bg-surface-2 p-1">
            <span className="grad-accent flex size-7 items-center justify-center rounded-full">
              <List className="size-3.5 text-primary-foreground" />
            </span>
            <button className="flex size-7 items-center justify-center rounded-full text-muted-foreground hover:text-foreground">
              <Kanban className="size-3.5" />
            </button>
          </div>
          <Search className="size-4 text-muted-foreground" />
          <Sparkle className="size-4 text-accent-pink" />
          <Settings className="size-4 text-muted-foreground" />
        </div>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-y border-border">
            <th className="label-caps px-7 py-2.5 text-left">Tâche</th>
            <th className="label-caps px-5 py-2.5 text-left">Projet</th>
            <th className="label-caps px-5 py-2.5 text-left">Dates</th>
            <th className="label-caps px-5 py-2.5 text-right">Estimation</th>
            <th className="label-caps px-5 py-2.5 text-left">Priorité</th>
            <th className="label-caps px-5 py-2.5 text-left">Étiquette</th>
            <th className="label-caps px-5 py-2.5 text-left">Assigné</th>
            <th className="label-caps px-5 py-2.5 text-left">Statut</th>
            <th className="label-caps px-5 py-2.5 text-center">Billable</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((t) => {
            const project = projectById(t.projectId);
            return (
              <tr key={t.id} className="border-b border-border/60 hover:bg-surface/60">
                <td className="px-7 py-3.5">
                  <span className="inline-flex items-center gap-3">
                    <span className="size-4 rounded-full border border-border" />
                    {t.name}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  {project && (
                    <span className="inline-flex items-center gap-2 text-muted-foreground">
                      <span
                        className={cn(
                          "size-2.5 rounded-[3px]",
                          projectColorClass[project.color],
                        )}
                      />
                      {project.name}
                    </span>
                  )}
                </td>
                <td className="px-5 py-3.5 text-muted-foreground">{t.dates}</td>
                <td className="tnum px-5 py-3.5 text-right">{t.estimate}</td>
                <td className="px-5 py-3.5">
                  <span
                    className={cn(
                      "text-sm",
                      t.priority === "High"
                        ? "text-destructive"
                        : t.priority === "Medium"
                          ? "text-warning"
                          : "text-muted-foreground",
                    )}
                  >
                    {t.priority}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  {t.tag ? (
                    <span className="rounded-full border border-border bg-surface-2 px-2.5 py-1 text-xs text-muted-foreground">
                      {t.tag}
                    </span>
                  ) : (
                    <span className="text-subtle">—</span>
                  )}
                </td>
                <td className="px-5 py-3.5">
                  <span className="flex size-6 items-center justify-center rounded-full bg-surface-2 text-[10px]">
                    {t.assignee}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <StatusBadge status={t.status} />
                </td>
                <td className="px-5 py-3.5 text-center">
                  {t.billable ? (
                    <span className="text-positive">$</span>
                  ) : (
                    <span className="text-subtle">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <button className="label-caps flex items-center gap-2 px-7 py-4 transition-colors hover:text-foreground">
        <Plus className="size-3.5" />
        Ajouter une tâche
      </button>
    </div>
  );
}
