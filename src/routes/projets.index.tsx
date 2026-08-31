import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowUpDown,
  ChevronDown,
  Filter,
  Folder,
  Group,
  Plus,
  Search,
  Settings,
} from "lucide-react";
import { projects, projectTextClass } from "@/data/fixtures";
import { PrimaryButton } from "@/components/app/primitives";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/projets/")({
  head: () => ({
    meta: [
      { title: "Projets — Focus Replica" },
      {
        name: "description",
        content:
          "Liste des projets actifs avec client, taux, dates et état du temps enregistré.",
      },
      { property: "og:title", content: "Projets — Focus Replica" },
      {
        property: "og:description",
        content: "Liste des projets actifs et de leur état de temps.",
      },
    ],
  }),
  component: ProjectsScreen,
});

function ProjectsScreen() {
  return (
    <div className="pb-12">
      <div className="flex items-center gap-3 px-7 pb-3 pt-5">
        <h1 className="text-2xl font-semibold tracking-tight">Projets</h1>
        <PrimaryButton className="ml-auto">
          <Plus className="size-4" />
          Nouveau projet
        </PrimaryButton>
      </div>

      <div className="flex flex-wrap items-center gap-2 px-7 py-3">
        <button className="pill">
          Actif
          <ChevronDown className="size-3.5 text-muted-foreground" />
        </button>
        <button className="pill">
          <Filter className="size-3.5 text-muted-foreground" />
          Filtres
        </button>
        <button className="pill">
          <Group className="size-3.5 text-muted-foreground" />
          Grouper par
        </button>
        <button className="pill">
          <ArrowUpDown className="size-3.5 text-muted-foreground" />
          Trier par
        </button>
        <button className="pill">
          <Plus className="size-3.5" />
          Filtrer
        </button>
        <div className="ml-auto flex items-center gap-3 text-muted-foreground">
          <Search className="size-4" />
          <Settings className="size-4" />
        </div>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-y border-border">
            <th className="label-caps px-7 py-2.5 text-left">Projet</th>
            <th className="label-caps px-5 py-2.5 text-left">Client</th>
            <th className="label-caps px-5 py-2.5 text-center">Facturable</th>
            <th className="label-caps px-5 py-2.5 text-right">Taux</th>
            <th className="label-caps px-5 py-2.5 text-left">Dates</th>
            <th className="label-caps px-5 py-2.5 text-left">État du temps</th>
            <th className="label-caps px-5 py-2.5 text-right">Entrées</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((p) => (
            <tr key={p.id} className="border-b border-border/60 hover:bg-surface/60">
              <td className="px-7 py-3.5">
                <Link
                  to="/projets/$projectId"
                  params={{ projectId: p.id }}
                  className="inline-flex items-center gap-2 font-medium hover:underline"
                >
                  <Folder className={cn("size-4", projectTextClass[p.color])} />
                  {p.name}
                </Link>
              </td>
              <td className="px-5 py-3.5 text-muted-foreground">{p.client ?? ""}</td>
              <td className="px-5 py-3.5 text-center">
                {p.billable > 0 ? (
                  <span className="inline-flex size-6 items-center justify-center rounded-md bg-accent/20 text-xs text-accent-pink">
                    $
                  </span>
                ) : (
                  <span className="text-subtle">—</span>
                )}
              </td>
              <td className="tnum px-5 py-3.5 text-right">
                {p.rate ? `${p.rate} USD` : <span className="text-subtle">Aucun</span>}
              </td>
              <td className="px-5 py-3.5 text-muted-foreground">{p.dates}</td>
              <td className="px-5 py-3.5">
                <div className="tnum pb-1.5 text-sm">{formatH(p.tracked)}</div>
                <div className="h-1 w-40 overflow-hidden rounded-full bg-surface-2">
                  <div
                    className="grad-accent h-full rounded-full"
                    style={{ width: `${Math.min((p.tracked / 12) * 100, 100)}%` }}
                  />
                </div>
              </td>
              <td className="tnum px-5 py-3.5 text-right text-muted-foreground">
                {p.entries}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button className="label-caps flex items-center gap-2 px-7 py-4 transition-colors hover:text-foreground">
        <Plus className="size-3.5" />
        Ajouter un projet
      </button>
    </div>
  );
}

function formatH(h: number) {
  const hours = Math.floor(h);
  const min = Math.round((h - hours) * 60);
  return min ? `${hours}h ${min}m` : `${hours}h`;
}
