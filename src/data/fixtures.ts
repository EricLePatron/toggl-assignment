/**
 * Single source of mock data shared by every screen.
 * No network calls, no persistence — static fixtures only.
 */

export const workspace = {
  name: "Chollet Eric's organisation",
  shortName: "Chollet Eric's organi...",
  trialDaysLeft: 30,
  trialCopy:
    "Vous essayez 10 fonctionnalités Premium sur ce projet — récurrents, estimation, facturation & plus.",
};

export const currentUser = {
  name: "Chollet Eric",
  initials: "CE",
  email: "eric.chollet@example.com",
  role: "Administrateur de l'espace de travail",
};

export type ProjectColor = "green" | "pink" | "violet" | "orange" | "teal" | "red";

export const projectColorClass: Record<ProjectColor, string> = {
  green: "bg-positive",
  pink: "bg-accent-pink",
  violet: "bg-accent",
  orange: "bg-warning",
  teal: "bg-[oklch(0.75_0.13_195)]",
  red: "bg-destructive",
};

export const projectTextClass: Record<ProjectColor, string> = {
  green: "text-positive",
  pink: "text-accent-pink",
  violet: "text-accent",
  orange: "text-warning",
  teal: "text-[oklch(0.75_0.13_195)]",
  red: "text-destructive",
};

export type Project = {
  id: string;
  name: string;
  client: string | null;
  color: ProjectColor;
  tracked: number; // hours
  billable: number; // hours
  entries: number;
  rate: number | null;
  dates: string;
  status: "Actif" | "Archivé";
};

export const projects: Project[] = [
  {
    id: "certification",
    name: "Certification",
    client: null,
    color: "green",
    tracked: 11,
    billable: 0,
    entries: 5,
    rate: null,
    dates: "Jun 1 - Aug 29",
    status: "Actif",
  },
  {
    id: "rituels-agiles",
    name: "Rituels Agiles",
    client: null,
    color: "teal",
    tracked: 10.5,
    billable: 0,
    entries: 25,
    rate: null,
    dates: "Jun 1 - Aug 29",
    status: "Actif",
  },
  {
    id: "medgpt",
    name: "MedGPT",
    client: null,
    color: "red",
    tracked: 5,
    billable: 0,
    entries: 2,
    rate: null,
    dates: "Jun 1 - Aug 29",
    status: "Actif",
  },
  {
    id: "integration-cgm",
    name: "Intégration – CGM",
    client: "CGM",
    color: "pink",
    tracked: 3,
    billable: 3,
    entries: 1,
    rate: 115,
    dates: "Jun 1 - Aug 29",
    status: "Actif",
  },
  {
    id: "integration-juliesolution",
    name: "Intégration – JulieSolution",
    client: "JulieSolution",
    color: "violet",
    tracked: 3,
    billable: 3,
    entries: 1,
    rate: 105,
    dates: "Jun 1 - Aug 29",
    status: "Actif",
  },
  {
    id: "toggl-assignement",
    name: "Toggl assignement",
    client: "Toggl",
    color: "green",
    tracked: 2.5,
    billable: 0,
    entries: 3,
    rate: null,
    dates: "Sep 1 - 3",
    status: "Actif",
  },
];

export const projectById = (id: string) => projects.find((p) => p.id === id);

export const totals = {
  tracked: projects.reduce((s, p) => s + p.tracked, 0), // 35h
  billable: projects.reduce((s, p) => s + p.billable, 0), // 6h
  entries: projects.reduce((s, p) => s + p.entries, 0),
  amount: 660,
  avgPerDay: "2h 3m",
};

export type TaskStatus = "Todo" | "In Progress" | "Blocked" | "Done";
export type Priority = "Low" | "Medium" | "High";

export type Task = {
  id: string;
  name: string;
  projectId: string;
  dates: string;
  estimate: string;
  priority: Priority;
  tag: string | null;
  assignee: string;
  status: TaskStatus;
  billable: boolean;
};

export const tasks: Task[] = [
  {
    id: "t1",
    name: "Dossier technique — mise à jour §4",
    projectId: "certification",
    dates: "Aug 25 - 31",
    estimate: "6h",
    priority: "High",
    tag: "Certification",
    assignee: "CE",
    status: "In Progress",
    billable: false,
  },
  {
    id: "t2",
    name: "Analyse de risques ISO 14971",
    projectId: "certification",
    dates: "Aug 26 - Sep 2",
    estimate: "4h",
    priority: "High",
    tag: "Certification",
    assignee: "CE",
    status: "Todo",
    billable: false,
  },
  {
    id: "t3",
    name: "Notice d'utilisation — relecture",
    projectId: "certification",
    dates: "Sep 1 - 4",
    estimate: "2h",
    priority: "Medium",
    tag: "Doc",
    assignee: "CE",
    status: "Todo",
    billable: false,
  },
  {
    id: "t4",
    name: "Plan de validation clinique",
    projectId: "medgpt",
    dates: "Aug 24 - 29",
    estimate: "3h",
    priority: "Medium",
    tag: "MedGPT",
    assignee: "CE",
    status: "Blocked",
    billable: false,
  },
  {
    id: "t5",
    name: "Jeu de tests de non-régression",
    projectId: "medgpt",
    dates: "Aug 20 - 27",
    estimate: "2h",
    priority: "Low",
    tag: "MedGPT",
    assignee: "CE",
    status: "Done",
    billable: false,
  },
  {
    id: "t6",
    name: "Daily Meeting",
    projectId: "rituels-agiles",
    dates: "Aug 31",
    estimate: "1h",
    priority: "Medium",
    tag: "Meeting",
    assignee: "CE",
    status: "Todo",
    billable: false,
  },
  {
    id: "t7",
    name: "Rétrospective de sprint",
    projectId: "rituels-agiles",
    dates: "Aug 28",
    estimate: "1h",
    priority: "Low",
    tag: "Meeting",
    assignee: "CE",
    status: "Done",
    billable: false,
  },
  {
    id: "t8",
    name: "Audit qualité interne",
    projectId: "integration-cgm",
    dates: "Aug 26 - 27",
    estimate: "3h",
    priority: "High",
    tag: "Audit",
    assignee: "CE",
    status: "In Progress",
    billable: true,
  },
  {
    id: "t9",
    name: "Kickoff intégration JulieSolution",
    projectId: "integration-juliesolution",
    dates: "Aug 25",
    estimate: "3h",
    priority: "Medium",
    tag: "Kickoff",
    assignee: "CE",
    status: "Done",
    billable: true,
  },
  {
    id: "t10",
    name: "Learn Toggl Focus",
    projectId: "toggl-assignement",
    dates: "Aug 29 - 31",
    estimate: "2h",
    priority: "Medium",
    tag: null,
    assignee: "CE",
    status: "In Progress",
    billable: false,
  },
  {
    id: "t11",
    name: "Work with Claude to set up environment",
    projectId: "toggl-assignement",
    dates: "Aug 29 - 31",
    estimate: "1h 30m",
    priority: "Low",
    tag: "Discovery",
    assignee: "CE",
    status: "In Progress",
    billable: false,
  },
];

export const tasksByStatus = (status: TaskStatus, projectId?: string) =>
  tasks.filter((t) => t.status === status && (!projectId || t.projectId === projectId));

/* ---------- Calendrier (semaine courante) ---------- */

export const weekDays = [
  { label: "Mon", num: 25, hours: "3h 15m" },
  { label: "Tue", num: 26, hours: "2h 15m" },
  { label: "Wed", num: 27, hours: "2h 15m" },
  { label: "Thu", num: 28, hours: "15m" },
  { label: "Fri", num: 29, hours: "2h 15m" },
  { label: "Sat", num: 30, hours: "–" },
  { label: "Sun", num: 31, hours: "–" },
];

export type CalendarEvent = {
  id: string;
  day: number; // 0 = Mon
  start: number; // hours from midnight, e.g. 8.5
  end: number;
  title: string;
  subtitle?: string;
  duration: string;
  color: ProjectColor;
  billable?: boolean;
  lane?: 0 | 1; // side-by-side blocks
};

export const calendarEvents: CalendarEvent[] = [
  {
    id: "c1",
    day: 0,
    start: 8,
    end: 11,
    title: "Kickoff intégration JulieSolution",
    subtitle: "Intégration – JulieSolution",
    duration: "3h",
    color: "green",
    billable: true,
  },
  {
    id: "c2",
    day: 1,
    start: 8,
    end: 10,
    title: "Audit qualité interne",
    subtitle: "Certification",
    duration: "2h",
    color: "green",
  },
  {
    id: "c3",
    day: 1,
    start: 14,
    end: 14.25,
    title: "Notice d'utilisation",
    subtitle: "Certification",
    duration: "15m",
    color: "pink",
  },
  {
    id: "c4",
    day: 2,
    start: 8,
    end: 10,
    title: "Audit qualité interne",
    subtitle: "Certification",
    duration: "2h",
    color: "green",
  },
  {
    id: "c5",
    day: 2,
    start: 13,
    end: 13.25,
    title: "Daily Meeting",
    subtitle: "Rituels Agiles",
    duration: "15m",
    color: "teal",
  },
  {
    id: "c6",
    day: 3,
    start: 8,
    end: 8.25,
    title: "Daily Meeting",
    subtitle: "Rituels Agiles",
    duration: "15m",
    color: "teal",
  },
  {
    id: "c7",
    day: 4,
    start: 8,
    end: 9,
    title: "Démo de sprint",
    subtitle: "Rituels Agiles",
    duration: "1h",
    color: "teal",
    lane: 0,
  },
  {
    id: "c8",
    day: 4,
    start: 8,
    end: 9,
    title: "Rétrospective",
    subtitle: "Rituels Agiles",
    duration: "1h",
    color: "green",
    lane: 1,
  },
  {
    id: "c9",
    day: 4,
    start: 10,
    end: 11.25,
    title: "Dossier technique §4",
    subtitle: "Certification",
    duration: "1h 15m",
    color: "pink",
  },
];

export const runningTimer = {
  description: "Learn Toggl Focus",
  project: "Toggl assignement",
  elapsed: "0:18:30",
};

export const weekSummary = {
  tracked: "10h 15m",
  planned: "14h",
  progress: 0.73,
  billableShare: "3h (29,27 %)",
  amount: "60,00 USD",
  weekLabel: "Cette semaine · S35",
  rangeLabel: "Aug 25 - 31 2026",
};

/* ---------- Rapports ---------- */

export const workloadDays = [
  { label: "lun.", date: "8/25", tracked: 3.25 },
  { label: "mar.", date: "8/26", tracked: 2.25 },
  { label: "mer.", date: "8/27", tracked: 2.25 },
  { label: "jeu.", date: "8/28", tracked: 0.25 },
  { label: "ven.", date: "8/29", tracked: 2.25 },
];

export const workloadTarget = 8;

export const profitability = {
  revenue: "660,00 USD",
  cost: "—",
  profit: "—",
  margin: "— %",
  missingCostRates: ["Chollet Eric"],
  missingProjectRates: ["Certification", "Rituels Agiles", "MedGPT"],
};

export const utilization = {
  billableShare: 17,
  target: 60,
  rows: [
    { member: "Chollet Eric", tracked: "35h 00m", billable: "6h 00m", util: "17 %" },
  ],
};

export const timeLogs = [
  {
    date: "Aug 29",
    description: "Dossier technique §4",
    project: "Certification",
    duration: "1h 15m",
    billable: false,
  },
  {
    date: "Aug 29",
    description: "Démo de sprint",
    project: "Rituels Agiles",
    duration: "1h 00m",
    billable: false,
  },
  {
    date: "Aug 28",
    description: "Daily Meeting",
    project: "Rituels Agiles",
    duration: "15m",
    billable: false,
  },
  {
    date: "Aug 27",
    description: "Audit qualité interne",
    project: "Intégration – CGM",
    duration: "2h 00m",
    billable: true,
  },
  {
    date: "Aug 26",
    description: "Audit qualité interne",
    project: "Certification",
    duration: "2h 00m",
    billable: false,
  },
  {
    date: "Aug 25",
    description: "Kickoff intégration JulieSolution",
    project: "Intégration – JulieSolution",
    duration: "3h 00m",
    billable: true,
  },
];

export const members = [
  {
    name: "Chollet Eric",
    initials: "CE",
    email: "eric.chollet@example.com",
    role: "Administrateur",
    groups: "—",
    status: "Actif",
    rate: "—",
  },
];

/* ---------- Chat overlay (statique) ---------- */

export const askConversation = [
  {
    role: "user" as const,
    text: "Combien de temps ai-je suivi cette semaine, et sur quels projets ?",
  },
  {
    role: "assistant" as const,
    text: "Cette semaine (S35, du 25 au 31 août) tu as enregistré 10h 15m, réparties sur 4 projets.",
    table: {
      head: ["Projet", "Temps suivi", "Facturable"],
      rows: [
        ["Certification", "5h 15m", "0h"],
        ["Rituels Agiles", "2h 15m", "0h"],
        ["Intégration – CGM", "2h 00m", "2h 00m"],
        ["Intégration – JulieSolution", "45m", "45m"],
      ],
    },
    takeaways: [
      "29,27 % du temps de la semaine est facturable, contre une cible de 60 %.",
      "Jeudi ne compte que 15m enregistrées — probablement du temps non suivi.",
    ],
    actions: [
      "Vérifier les entrées manquantes du jeudi 28",
      "Ajouter un taux de coût aux membres pour activer la rentabilité",
    ],
  },
];
