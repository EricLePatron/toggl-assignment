/**
 * Single source of mock data shared by every screen.
 * No network calls, no persistence — static fixtures only.
 */

export const workspace = {
  name: "Chollet Eric's organisation",
  shortName: "Chollet Eric's organi...",
  trialDaysLeft: 29,
  trialCopy:
    "You are trying 10 Premium features on this project — recurring, estimates, billing & more.",
};

export const currentUser = {
  name: "Chollet Eric",
  initials: "CE",
  email: "eric.chollet@example.com",
  role: "Workspace administrator",
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
  status: "Active" | "Archived";
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
    status: "Active",
  },
  {
    id: "agile-rituals",
    name: "Agile Rituals",
    client: null,
    color: "teal",
    tracked: 10.5,
    billable: 0,
    entries: 25,
    rate: null,
    dates: "Jun 1 - Aug 29",
    status: "Active",
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
    status: "Active",
  },
  {
    id: "onboarding-cgm",
    name: "Onboarding – CGM",
    client: "CGM",
    color: "pink",
    tracked: 3,
    billable: 3,
    entries: 1,
    rate: 115,
    dates: "Jun 1 - Aug 29",
    status: "Active",
  },
  {
    id: "onboarding-juliesolution",
    name: "Onboarding – JulieSolution",
    client: "JulieSolution",
    color: "violet",
    tracked: 3,
    billable: 3,
    entries: 1,
    rate: 105,
    dates: "Jun 1 - Aug 29",
    status: "Active",
  },
  {
    id: "toggl-assignment",
    name: "Toggl assignment",
    client: "Toggl",
    color: "green",
    tracked: 2.5,
    billable: 0,
    entries: 3,
    rate: null,
    dates: "Aug 31 - Sep 6",
    status: "Active",
  },
];

export const projectById = (id: string) => projects.find((p) => p.id === id);

export const totals = {
  tracked: projects.reduce((s, p) => s + p.tracked, 0),
  billable: projects.reduce((s, p) => s + p.billable, 0),
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
    name: "Technical file — update §4",
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
    name: "ISO 14971 risk analysis",
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
    name: "Instructions for use — review",
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
    name: "Clinical validation plan",
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
    name: "Regression test suite",
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
    name: "Meeting with tech lead",
    projectId: "agile-rituals",
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
    name: "Sprint retrospective",
    projectId: "agile-rituals",
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
    name: "Internal quality audit",
    projectId: "onboarding-cgm",
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
    name: "JulieSolution onboarding kickoff",
    projectId: "onboarding-juliesolution",
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
    projectId: "toggl-assignment",
    dates: "Aug 31 - Sep 2",
    estimate: "2h",
    priority: "Medium",
    tag: null,
    assignee: "CE",
    status: "In Progress",
    billable: false,
  },
  {
    id: "t11",
    name: "Work with Claude",
    projectId: "toggl-assignment",
    dates: "Aug 31 - Sep 2",
    estimate: "1h 30m",
    priority: "Low",
    tag: "Discovery",
    assignee: "CE",
    status: "In Progress",
    billable: false,
  },
  {
    id: "t12",
    name: "Prototype for assignment",
    projectId: "toggl-assignment",
    dates: "Sep 1",
    estimate: "3h",
    priority: "High",
    tag: null,
    assignee: "CE",
    status: "In Progress",
    billable: false,
  },
];

export const tasksByStatus = (status: TaskStatus, projectId?: string) =>
  tasks.filter((t) => t.status === status && (!projectId || t.projectId === projectId));

/* ---------- Calendar (current week) ---------- */

export const weekDays = [
  { label: "Mon", num: 31, hours: "21m" },
  { label: "Tue", num: 1, hours: "–" },
  { label: "Wed", num: 2, hours: "–" },
  { label: "Thu", num: 3, hours: "–" },
  { label: "Fri", num: 4, hours: "–" },
  { label: "Sat", num: 5, hours: "–" },
  { label: "Sun", num: 6, hours: "–" },
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
    end: 9,
    title: "Learn Toggl Focus",
    subtitle: "Toggl assignment",
    duration: "1h",
    color: "green",
  },
  {
    id: "c2",
    day: 0,
    start: 9,
    end: 10,
    title: "Work with Claude",
    subtitle: "Toggl assignment",
    duration: "1h",
    color: "green",
  },
  {
    id: "c3",
    day: 0,
    start: 10,
    end: 11,
    title: "Meeting with tech lead",
    subtitle: "Agile Rituals",
    duration: "1h",
    color: "orange",
  },
  {
    id: "c4",
    day: 0,
    start: 11,
    end: 11.75,
    title: "Prepare before",
    subtitle: "Agile Rituals",
    duration: "45m",
    color: "orange",
  },
  {
    id: "c5",
    day: 1,
    start: 8,
    end: 11,
    title: "Prototype for assignment",
    subtitle: "Toggl assignment",
    duration: "3h",
    color: "green",
  },
];

export const weekSummary = {
  tracked: "21m",
  planned: "5h 50m",
  progress: 0.06,
  billableShare: "0m (0 %)",
  amount: "0.00 USD",
  weekLabel: "This week • W36",
  rangeLabel: "Aug 31 - Sep 6 2026",
};

/* ---------- Reports ---------- */

export const workloadDays = [
  { label: "Mon", date: "8/31", tracked: 0.35 },
  { label: "Tue", date: "9/1", tracked: 0 },
  { label: "Wed", date: "9/2", tracked: 0 },
  { label: "Thu", date: "9/3", tracked: 0 },
  { label: "Fri", date: "9/4", tracked: 0 },
];

export const workloadTarget = 8;

export const profitability = {
  revenue: "660.00 USD",
  cost: "—",
  profit: "—",
  margin: "— %",
  missingCostRates: ["Chollet Eric"],
  missingProjectRates: ["Certification", "Agile Rituals", "MedGPT"],
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
    date: "Aug 31",
    description: "Learn Toggl Focus",
    project: "Toggl assignment",
    duration: "12m",
    billable: false,
  },
  {
    date: "Aug 31",
    description: "Work with Claude",
    project: "Toggl assignment",
    duration: "9m",
    billable: false,
  },
  {
    date: "Aug 29",
    description: "Technical file §4",
    project: "Certification",
    duration: "1h 15m",
    billable: false,
  },
  {
    date: "Aug 28",
    description: "Meeting with tech lead",
    project: "Agile Rituals",
    duration: "15m",
    billable: false,
  },
  {
    date: "Aug 27",
    description: "Internal quality audit",
    project: "Onboarding – CGM",
    duration: "2h 00m",
    billable: true,
  },
  {
    date: "Aug 25",
    description: "JulieSolution onboarding kickoff",
    project: "Onboarding – JulieSolution",
    duration: "3h 00m",
    billable: true,
  },
];

export const members = [
  {
    name: "Chollet Eric",
    initials: "CE",
    email: "eric.chollet@example.com",
    role: "Administrator",
    groups: "—",
    status: "Active",
    rate: "—",
  },
];

/* ---------- Chat overlay (static) ---------- */

export const askConversation = [
  {
    role: "user" as const,
    text: "How much time did I track this week, and on which projects?",
  },
  {
    role: "assistant" as const,
    text: "This week (W36, Aug 31 - Sep 6) you logged 21m across the Toggl assignment project.",
    table: {
      head: ["Project", "Tracked time", "Billable"],
      rows: [
        ["Toggl assignment", "21m", "0h"],
        ["Certification", "0h", "0h"],
        ["Agile Rituals", "0h", "0h"],
        ["Onboarding – CGM", "0h", "0h"],
      ],
    },
    takeaways: [
      "0 % of this week's time is billable, against a 60 % target.",
      "5h 50m are planned but not yet tracked.",
    ],
    actions: [
      "Check missing entries for Tuesday, Sep 1",
      "Add a cost rate to members to unlock profitability",
    ],
  },
];
