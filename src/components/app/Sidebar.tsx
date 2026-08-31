import { Link, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  BadgeCheck,
  ChevronDown,
  ChevronsLeft,
  CircleHelp,
  Clock,
  Download,
  FileBarChart,
  Folder,
  GanttChartSquare,
  ListChecks,
  Palmtree,
  Send,
  Settings,
  Star,
  ArrowUpCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { workspace, currentUser } from "@/data/fixtures";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  to: string;
  icon: LucideIcon;
  starred?: boolean;
};

type NavSection = { title: string; items: NavItem[] };

/** Add a screen: drop a route file and add one entry here. */
export const navSections: NavSection[] = [
  { title: "Suivre", items: [{ label: "Minuteur", to: "/", icon: Clock }] },
  { title: "Analyser", items: [{ label: "Rapports", to: "/rapports", icon: FileBarChart }] },
  {
    title: "Plan",
    items: [
      { label: "Projets", to: "/projets", icon: Folder },
      { label: "Tâches", to: "/taches", icon: ListChecks },
      { label: "Chronologie", to: "/chronologie", icon: GanttChartSquare, starred: true },
    ],
  },
  {
    title: "Gérer",
    items: [
      { label: "Membres", to: "/membres", icon: BadgeCheck },
      { label: "Approbations", to: "/approbations", icon: BadgeCheck, starred: true },
      { label: "Congé", to: "/conge", icon: Palmtree, starred: true },
    ],
  },
];

export function Sidebar({ onOpenAsk }: { onOpenAsk: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const isActive = (to: string) =>
    to === "/" ? pathname === "/" : pathname.startsWith(to);

  return (
    <aside className="flex w-[268px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
      {/* Workspace switcher */}
      <div className="flex items-center gap-3 px-4 pb-3 pt-4">
        <div className="relative">
          <div className="grad-accent flex size-8 items-center justify-center rounded-full">
            <Clock className="size-4 text-primary-foreground" />
          </div>
          <span className="grad-accent absolute -bottom-1.5 left-1/2 -translate-x-1/2 rounded-full px-1.5 text-[9px] font-bold text-primary-foreground">
            2.0
          </span>
        </div>
        <button className="flex min-w-0 flex-1 items-center gap-1 rounded-lg px-1 py-1 text-left text-sm font-semibold text-foreground transition-colors hover:bg-sidebar-accent">
          <span className="truncate">{workspace.shortName}</span>
          <ChevronDown className="ml-auto size-4 shrink-0 text-muted-foreground" />
        </button>
      </div>

      {/* Ask Toggl */}
      <div className="px-4 pb-2 pt-1">
        <button
          onClick={onOpenAsk}
          className="flex w-full items-center gap-2 rounded-xl border border-sidebar-border bg-surface-2 px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-accent/50"
        >
          <span className="flex-1 text-left">Demander à Toggl</span>
          <kbd className="rounded border border-border px-1 text-[10px] text-subtle">⏎</kbd>
          <kbd className="rounded border border-border px-1 text-[10px] text-subtle">⌘K</kbd>
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-2">
        {navSections.map((section) => (
          <div key={section.title} className="mb-4">
            <div className="label-caps px-2 py-2">{section.title}</div>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActive(item.to);
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className={cn(
                        "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                        active
                          ? "bg-[#2a1f3a] text-[#d8b4fe]"
                          : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
                      )}
                    >
                      <span
                        className={cn(
                          "flex size-7 shrink-0 items-center justify-center rounded-full",
                          active ? "grad-accent text-primary-foreground" : "bg-transparent",
                        )}
                      >
                        <item.icon className="size-4" />
                      </span>
                      <span className="truncate">{item.label}</span>
                      {item.starred && (
                        <Star
                          className={cn(
                            "ml-auto size-3.5",
                            active ? "text-[#d8b4fe]" : "text-subtle",
                          )}
                        />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Bottom rail */}
      <div className="border-t border-sidebar-border px-4 py-3">
        <div className="flex items-center gap-3 pb-3">
          <div className="flex size-7 items-center justify-center rounded-full bg-surface-2 text-[11px] font-semibold text-foreground">
            {currentUser.initials}
          </div>
          <div className="ml-auto flex items-center gap-2 text-muted-foreground">
            <Bell className="size-4" />
            <Send className="size-4" />
            <CircleHelp className="size-4" />
            <ChevronsLeft className="size-4" />
          </div>
        </div>

        <button className="mb-3 flex w-full items-center gap-2 rounded-xl border border-border bg-surface-2 px-3 py-2 text-left text-sm transition-colors hover:border-accent/50">
          <ArrowUpCircle className="size-4 text-accent-pink" />
          <span className="flex-1 font-medium">Mettre à niveau</span>
          <span className="grad-accent rounded-full px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
            {workspace.trialDaysLeft} JOURS
          </span>
        </button>

        <button className="flex w-full items-center gap-2 px-1 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground">
          <Download className="size-3.5" />
          Télécharger des applications
        </button>
        <button className="flex w-full items-center gap-2 px-1 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground">
          <Settings className="size-3.5" />
          Paramètres administratifs
        </button>
      </div>
    </aside>
  );
}
