import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, Folder, Plus, Sparkle } from "lucide-react";
import {
  currentUser,
  projectById,
  projectTextClass,
  tasks,
  tasksByStatus,
  workspace,
  type TaskStatus,
} from "@/data/fixtures";
import { Card, EmptyState, Stat, StatusBadge, Tabs } from "@/components/app/primitives";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/projets/$projectId")({
  head: () => ({
    meta: [
      { title: "Détail du projet — Focus Replica" },
      {
        name: "description",
        content:
          "Aperçu d'un projet : tâches, tableau kanban, chronologie, tableau de bord et membres.",
      },
      { property: "og:title", content: "Détail du projet — Focus Replica" },
      {
        property: "og:description",
        content: "Aperçu, tâches et tableau de bord d'un projet.",
      },
    ],
  }),
  component: ProjectDetail,
});

const TABS = ["Aperçu", "Tâches", "Tableau", "Chronologie", "Tableau de bord", "Membres"];
const COLUMNS: TaskStatus[] = ["Todo", "In Progress", "Blocked", "Done"];

function ProjectDetail() {
  const { projectId } = Route.useParams();
  const [tab, setTab] = useState<string>("Aperçu");
  const project = projectById(projectId);

  if (!project) {
    return (
      <EmptyState
        title="Projet introuvable"
        description="Ce projet n'existe pas dans le jeu de données de démonstration."
        action={
          <Link to="/projets" className="pill">
            Retour aux projets
          </Link>
        }
      />
    );
  }

  const projectTasks = tasks.filter((t) => t.projectId === project.id);

  return (
    <div className="pb-12">
      <div className="flex items-center gap-3 px-7 pb-3 pt-5">
        <Link to="/projets" className="text-muted-foreground hover:text-foreground">
          <ChevronLeft className="size-5" />
        </Link>
        <Folder className={cn("size-5", projectTextClass[project.color])} />
        <h1 className="text-2xl font-semibold tracking-tight">{project.name}</h1>
        {project.client && (
          <span className="pill !py-1 text-xs">{project.client}</span>
        )}
        <span className="ml-auto text-sm text-muted-foreground">{project.dates}</span>
      </div>

      <Tabs tabs={TABS} value={tab} onChange={setTab} />

      <div className="space-y-5 px-7 pt-5">
        {tab === "Aperçu" && (
          <>
            <div className="panel flex divide-x divide-border">
              <Stat label="Temps enregistré" value={formatH(project.tracked)} />
              <Stat label="Facturable" value={formatH(project.billable)} />
              <Stat label="Entrées" value={String(project.entries)} />
              <Stat
                label="Taux"
                value={project.rate ? `${project.rate} USD` : "—"}
                hint={project.client ? `Client : ${project.client}` : "Sans client"}
              />
            </div>

            <Card>
              <h2 className="pb-4 text-base font-semibold">Paramètres du projet</h2>
              <div className="grid grid-cols-2 gap-4">
                {["Récurrent", "Estimation", "Facturable", "Frais fixes"].map((label) => (
                  <div
                    key={label}
                    className="flex items-center gap-3 rounded-xl border border-border bg-surface-2/60 px-4 py-3 opacity-60"
                  >
                    <span className="h-5 w-9 rounded-full bg-border p-0.5">
                      <span className="block size-4 rounded-full bg-subtle" />
                    </span>
                    <span className="text-sm">{label}</span>
                    <span className="grad-accent ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                      Premium
                    </span>
                  </div>
                ))}
              </div>
              <p className="pt-4 text-sm text-muted-foreground">{workspace.trialCopy}</p>
            </Card>
          </>
        )}

        {tab === "Tâches" && <TaskTable rows={projectTasks} />}

        {tab === "Tableau" && (
          <div className="grid grid-cols-4 gap-4">
            {COLUMNS.map((col) => (
              <div key={col} className="panel flex flex-col p-3">
                <div className="flex items-center gap-2 pb-3">
                  <StatusBadge status={col} />
                  <span className="tnum ml-auto text-xs text-subtle">
                    {tasksByStatus(col, project.id).length}
                  </span>
                  <button className="text-muted-foreground transition-colors hover:text-accent-pink">
                    <Sparkle className="size-3.5" />
                  </button>
                </div>
                <div className="space-y-2">
                  {tasksByStatus(col, project.id).map((t) => (
                    <div
                      key={t.id}
                      className="rounded-xl border border-border bg-surface-2 p-3 text-sm transition-colors hover:border-accent/40"
                    >
                      <div className="font-medium">{t.name}</div>
                      <div className="flex items-center gap-2 pt-2 text-xs text-muted-foreground">
                        <span>{t.dates}</span>
                        <span className="tnum ml-auto">{t.estimate}</span>
                      </div>
                    </div>
                  ))}
                  <button className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs text-subtle transition-colors hover:text-foreground">
                    <Plus className="size-3.5" />
                    Ajouter une tâche
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "Chronologie" && <ProjectGantt tasks={projectTasks} />}

        {tab === "Tableau de bord" && (
          <div className="panel flex divide-x divide-border">
            <Stat
              label="Revenu"
              value={project.rate ? `${(project.rate * project.billable).toFixed(2)} USD` : "—"}
            />
            <Stat label="Coût" value="—" hint="taux de coût manquant" />
            <Stat label="Profit" value="—" />
            <Stat label="Marge" value="— %" hint="cible 40 %" />
          </div>
        )}

        {tab === "Membres" && (
          <Card className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="label-caps px-5 py-2.5 text-left">Membre</th>
                  <th className="label-caps px-5 py-2.5 text-left">Rôle</th>
                  <th className="label-caps px-5 py-2.5 text-right">Taux</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center gap-2">
                      <span className="flex size-6 items-center justify-center rounded-full bg-surface-2 text-[10px]">
                        {currentUser.initials}
                      </span>
                      {currentUser.name}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">Gestionnaire de projet</td>
                  <td className="tnum px-5 py-3 text-right">
                    {project.rate ? `${project.rate} USD` : "—"}
                  </td>
                </tr>
              </tbody>
            </table>
          </Card>
        )}
      </div>
    </div>
  );
}

function TaskTable({ rows }: { rows: typeof tasks }) {
  return (
    <Card className="p-0">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="label-caps px-5 py-2.5 text-left">Tâche</th>
            <th className="label-caps px-5 py-2.5 text-left">Dates</th>
            <th className="label-caps px-5 py-2.5 text-right">Estimation</th>
            <th className="label-caps px-5 py-2.5 text-left">Priorité</th>
            <th className="label-caps px-5 py-2.5 text-left">Statut</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((t) => (
            <tr key={t.id} className="border-b border-border/60 last:border-0">
              <td className="px-5 py-3">{t.name}</td>
              <td className="px-5 py-3 text-muted-foreground">{t.dates}</td>
              <td className="tnum px-5 py-3 text-right">{t.estimate}</td>
              <td className="px-5 py-3 text-muted-foreground">{t.priority}</td>
              <td className="px-5 py-3">
                <StatusBadge status={t.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

function ProjectGantt({ tasks: rows }: { tasks: typeof tasks }) {
  return (
    <Card className="p-0">
      <div className="grid grid-cols-[240px_1fr] border-b border-border">
        <div className="label-caps px-5 py-2.5">Tâche</div>
        <div className="grid grid-cols-7">
          {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((d) => (
            <div key={d} className="label-caps border-l border-border px-3 py-2.5">
              {d}
            </div>
          ))}
        </div>
      </div>
      {rows.map((t, i) => (
        <div key={t.id} className="grid grid-cols-[240px_1fr] border-b border-border/60">
          <div className="truncate px-5 py-3 text-sm">{t.name}</div>
          <div className="relative grid grid-cols-7">
            {Array.from({ length: 7 }).map((_, c) => (
              <div key={c} className="h-11 border-l border-border/60" />
            ))}
            <div
              className="grad-accent absolute top-2.5 h-6 rounded-md px-2 text-[11px] leading-6 text-primary-foreground"
              style={{
                left: `${((i % 4) / 7) * 100}%`,
                width: `${(2 / 7) * 100}%`,
              }}
            >
              {t.estimate}
            </div>
          </div>
        </div>
      ))}
    </Card>
  );
}

function formatH(h: number) {
  const hours = Math.floor(h);
  const min = Math.round((h - hours) * 60);
  return min ? `${hours}h ${min}m` : `${hours}h`;
}
