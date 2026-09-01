/**
 * Single source of mock data shared by every screen — Eric Chollet (freelance PM) dataset.
 *
 * Hand-authored, static. Every figure displayed anywhere in the app derives from
 * `timeEntries` (logged) and `plannedEntries` (future, planned only), so no two
 * screens can contradict each other.
 *
 * In-app "today" = Wednesday September 2 2026, ~14:00.
 * Visible window: Mon Aug 31 2026 → Sun Sep 13 2026 (current week + next week).
 * A handful of entries logged before Aug 31 exist only so that tasks started in
 * earlier weeks roll up correctly; week navigation is clamped to the two weeks.
 */

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const d = (y: number, m: number, day: number) => new Date(Date.UTC(y, m - 1, day));
const iso = (date: Date) => date.toISOString().slice(0, 10);
const addDays = (date: Date, n: number) =>
  new Date(date.getTime() + n * 24 * 3600 * 1000);
const mondayOf = (date: Date) => {
  const day = date.getUTCDay(); // 0 = Sun
  return addDays(date, day === 0 ? -6 : 1 - day);
};
const MONTH_ABBR = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const shortDate = (date: Date) =>
  `${MONTH_ABBR[date.getUTCMonth()]} ${date.getUTCDate()}`;

export const CURRENCY = "EUR";
export const money = (v: number) =>
  `${v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;

export function formatHours(h: number) {
  const total = Math.round(h * 60);
  const hours = Math.floor(total / 60);
  const min = total % 60;
  if (!hours) return `${min}m`;
  return min ? `${hours}h ${min}m` : `${hours}h`;
}

const q = (h: number) => Math.round(h * 4) / 4;

export const TODAY = d(2026, 9, 2); // Wednesday
export const NOW_HOUR = 14; // in-app "now" on Wednesday
export const CURRENT_WEEK_START = mondayOf(TODAY); // Mon Aug 31 2026
export const NEXT_WEEK_START = addDays(CURRENT_WEEK_START, 7); // Mon Sep 7 2026
export const WINDOW_START = CURRENT_WEEK_START;
export const WINDOW_END = addDays(CURRENT_WEEK_START, 13); // Sun Sep 13 2026

/* ------------------------------------------------------------------ */
/* Workspace, members                                                  */
/* ------------------------------------------------------------------ */

export const workspace = {
  name: "Eric Chollet",
  shortName: "Eric Chollet",
  trialDaysLeft: 29,
  trialCopy:
    "You are trying 10 Premium features on this project — recurring, estimates, billing & more.",
};

/** Weekly capacity for the solo workspace owner (Eric Chollet), in hours. */
export const WEEKLY_CAPACITY = 40;


export type Member = {
  id: string;
  name: string;
  initials: string;
  email: string;
  role: string;
  costRate: number; // € / h
  capacity: number; // weekly target hours
  status: "Active";
  groups: string;
};

export const teamMembers: Member[] = [
  {
    id: "ec",
    name: "Eric Chollet",
    initials: "EC",
    email: "eric.chollet@ericchollet.com",
    role: "Independent Project Manager",
    costRate: 55,
    capacity: 35,
    status: "Active",
    groups: "Owner",
  },
];

export const memberById = (id: string) =>
  teamMembers.find((m) => m.id === id) ?? teamMembers[0]!;
export const currentUser = {
  ...teamMembers[0]!,
  roleLabel: "Workspace administrator",
};

/* ------------------------------------------------------------------ */
/* Projects                                                            */
/* ------------------------------------------------------------------ */

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

type ProjectSeed = {
  id: string;
  name: string;
  client: string | null;
  color: ProjectColor;
  billableProject: boolean;
  rate: number | null;
  /** Rate effective-from = actual project start in this dataset (no billing gaps). */
  rateEffectiveFrom: Date | null;
  start: Date;
  end: Date;
  status: "Active" | "Archived";
};

const projectSeeds: ProjectSeed[] = [
  {
    id: "retail-migration",
    name: "Retail Platform Migration",
    client: "Meridian Retail",
    color: "violet",
    billableProject: true,
    rate: 85,
    rateEffectiveFrom: d(2026, 7, 27),
    start: d(2026, 7, 27), // 5 weeks before today
    end: d(2026, 9, 13),
    status: "Active",
  },
  {
    id: "internal-tools",
    name: "Internal Tools Rollout",
    client: "Bramwell Logistics",
    color: "green",
    billableProject: true,
    rate: 80,
    rateEffectiveFrom: d(2026, 8, 10),
    start: d(2026, 8, 10), // 3 weeks before today
    end: d(2026, 9, 13),
    status: "Active",
  },
  {
    id: "vendor-selection",
    name: "Vendor Selection Program",
    client: "Solène Cosmetics",
    color: "teal",
    billableProject: true,
    rate: 75,
    rateEffectiveFrom: d(2026, 8, 31),
    start: d(2026, 8, 31), // started this week
    end: d(2026, 9, 13),
    status: "Active",
  },
];

const seedById = (id: string) => projectSeeds.find((p) => p.id === id)!;

/* ------------------------------------------------------------------ */
/* Tasks                                                               */
/* ------------------------------------------------------------------ */

export type TaskStatus = "Todo" | "In Progress" | "Blocked" | "Done";
export type Priority = "Low" | "Medium" | "High";
export type TaskKind = "integration" | "feature" | "design" | "pm" | "ongoing";

type TaskSeed = {
  id: string;
  name: string;
  description: string;
  projectId: string;
  assignee: string;
  /** null = genuinely no estimate (out-of-scope work added mid-project). */
  estimate: number | null;
  /** Date the task was created / added to the project scope. */
  createdAt: Date;
  start: Date;
  end: Date;
  priority: Priority;
  tag: string | null;
  status: TaskStatus;
  kind: TaskKind;
};

const taskSeeds: TaskSeed[] = [
  /* --- Retail Platform Migration (Meridian Retail) ------------------ */
  {
    id: "rm-roadmap",
    name: "Define migration roadmap",
    description: "Phasing, dependencies and cutover plan for the platform migration.",
    projectId: "retail-migration",
    assignee: "ec",
    estimate: 6,
    createdAt: d(2026, 7, 27),
    start: d(2026, 7, 28),
    end: d(2026, 7, 29),
    priority: "High",
    tag: "Planning",
    status: "Done",
    kind: "pm",
  },
  {
    id: "rm-workshops",
    name: "Stakeholder alignment workshops",
    description: "Alignment sessions with retail ops, IT and the migration vendor.",
    projectId: "retail-migration",
    assignee: "ec",
    estimate: 10,
    createdAt: d(2026, 7, 27),
    start: d(2026, 8, 4),
    end: d(2026, 8, 12),
    priority: "Medium",
    tag: "Workshop",
    status: "Done",
    kind: "pm",
  },
  {
    id: "rm-vendor-onboarding",
    name: "Vendor onboarding coordination",
    description: "Coordinating vendor onboarding, access and delivery checkpoints.",
    projectId: "retail-migration",
    assignee: "ec",
    estimate: 5,
    createdAt: d(2026, 7, 27),
    start: d(2026, 8, 19),
    end: d(2026, 9, 4),
    priority: "High",
    tag: "Coordination",
    status: "In Progress",
    kind: "pm",
  },
  {
    id: "rm-shipment-comms",
    name: "Emergency shipment delay comms plan",
    description: "Unplanned communication plan after the vendor shipment delay.",
    projectId: "retail-migration",
    assignee: "ec",
    estimate: null, // out of scope — added mid-project, no estimate
    createdAt: d(2026, 9, 1),
    start: d(2026, 9, 1),
    end: d(2026, 9, 4),
    priority: "High",
    tag: "Out of scope",
    status: "In Progress",
    kind: "pm",
  },
  {
    id: "rm-escalation-call",
    name: "Additional client escalation call",
    description: "Extra escalation call requested by Meridian Retail leadership.",
    projectId: "retail-migration",
    assignee: "ec",
    estimate: null, // out of scope — added mid-project, no estimate
    createdAt: d(2026, 9, 2),
    start: d(2026, 9, 2),
    end: d(2026, 9, 2),
    priority: "High",
    tag: "Out of scope",
    status: "Done",
    kind: "pm",
  },
  {
    id: "rm-vendor-wrapup",
    name: "Vendor onboarding coordination — phase 2",
    description: "Second onboarding wave with the vendor: access, checkpoints, handover.",
    projectId: "retail-migration",
    assignee: "ec",
    estimate: 5,
    createdAt: d(2026, 7, 27),
    start: d(2026, 9, 10),
    end: d(2026, 9, 10),
    priority: "Medium",
    tag: "Coordination",
    status: "Todo",
    kind: "pm",
  },

  /* --- Internal Tools Rollout (Bramwell Logistics) ------------------ */
  {
    id: "it-requirements",
    name: "Requirements gathering workshops",
    description: "Requirement sessions with warehouse, dispatch and finance teams.",
    projectId: "internal-tools",
    assignee: "ec",
    estimate: 8,
    createdAt: d(2026, 8, 10),
    start: d(2026, 8, 10),
    end: d(2026, 8, 11),
    priority: "Medium",
    tag: "Workshop",
    status: "Done",
    kind: "pm",
  },
  {
    id: "it-change-mgmt",
    name: "Change management plan",
    description: "Adoption plan, comms and training path for the internal rollout.",
    projectId: "internal-tools",
    assignee: "ec",
    estimate: 6,
    createdAt: d(2026, 8, 10),
    start: d(2026, 8, 31),
    end: d(2026, 9, 4),
    priority: "Medium",
    tag: "Planning",
    status: "In Progress",
    kind: "pm",
  },
  {
    id: "it-governance",
    name: "Status reporting & governance",
    description: "Weekly status pack and steering committee governance.",
    projectId: "internal-tools",
    assignee: "ec",
    estimate: 4,
    createdAt: d(2026, 8, 10),
    start: d(2026, 9, 2),
    end: d(2026, 9, 2),
    priority: "Low",
    tag: "Governance",
    status: "Done",
    kind: "pm",
  },
  {
    id: "it-uat",
    name: "UAT coordination",
    description: "Coordinating user acceptance testing across the pilot teams.",
    projectId: "internal-tools",
    assignee: "ec",
    estimate: 6,
    createdAt: d(2026, 8, 10),
    start: d(2026, 9, 7),
    end: d(2026, 9, 9),
    priority: "High",
    tag: "Coordination",
    status: "Todo",
    kind: "pm",
  },
  {
    id: "it-training",
    name: "Training session planning",
    description: "Planning the rollout training sessions and materials.",
    projectId: "internal-tools",
    assignee: "ec",
    estimate: 4,
    createdAt: d(2026, 8, 10),
    start: d(2026, 9, 10),
    end: d(2026, 9, 10),
    priority: "Medium",
    tag: "Planning",
    status: "Todo",
    kind: "pm",
  },

  /* --- Vendor Selection Program (Solène Cosmetics) ------------------ */
  {
    id: "vs-kickoff",
    name: "Kickoff workshop & scope alignment",
    description: "Kickoff with Solène Cosmetics: scope, criteria and timeline.",
    projectId: "vendor-selection",
    assignee: "ec",
    estimate: 4,
    createdAt: d(2026, 8, 31),
    start: d(2026, 8, 31),
    end: d(2026, 8, 31),
    priority: "High",
    tag: "Workshop",
    status: "Done",
    kind: "pm",
  },
  {
    id: "vs-rfp",
    name: "RFP review coordination",
    description: "Reviewing vendor RFP responses with the client team.",
    projectId: "vendor-selection",
    assignee: "ec",
    estimate: 6,
    createdAt: d(2026, 8, 31),
    start: d(2026, 9, 7),
    end: d(2026, 9, 8),
    priority: "Medium",
    tag: "Coordination",
    status: "Todo",
    kind: "pm",
  },
  {
    id: "vs-shortlist",
    name: "Vendor shortlist review meeting",
    description: "Shortlist review and decision meeting with the steering group.",
    projectId: "vendor-selection",
    assignee: "ec",
    estimate: 3,
    createdAt: d(2026, 8, 31),
    start: d(2026, 9, 9),
    end: d(2026, 9, 9),
    priority: "Medium",
    tag: "Workshop",
    status: "Todo",
    kind: "pm",
  },

  /* --- Current-week planned work (Thu–Fri) -------------------------- */
  {
    id: "rm-cutover-rehearsal",
    name: "Cutover rehearsal & vendor sign-off prep",
    description:
      "Dry-run of the migration cutover and sign-off pack. Locked to the vendor cutover date of Fri Sep 4 — cannot move.",
    projectId: "retail-migration",
    assignee: "ec",
    estimate: 18,
    createdAt: d(2026, 8, 20),
    start: d(2026, 9, 3),
    end: d(2026, 9, 4),
    priority: "High",
    tag: "Cutover",
    status: "Todo",
    kind: "pm",
  },
  {
    id: "it-doc-cleanup",
    name: "Process documentation cleanup",
    description:
      "Tidying up the rollout process documentation. No deadline this week.",
    projectId: "internal-tools",
    assignee: "ec",
    estimate: 5,
    createdAt: d(2026, 8, 20),
    start: d(2026, 9, 4),
    end: d(2026, 9, 4),
    priority: "Low",
    tag: "Documentation",
    status: "Todo",
    kind: "pm",
  },
];


const taskSeedById = (id: string) => taskSeeds.find((t) => t.id === id)!;

/* ------------------------------------------------------------------ */
/* Time entries — logged (past only) and planned (future only)         */
/* ------------------------------------------------------------------ */

export type TimeEntry = {
  id: string;
  date: string; // YYYY-MM-DD
  start: number; // hours from midnight
  end: number;
  duration: number; // hours
  description: string;
  memberId: string;
  taskId: string | null;
  projectId: string | null;
  tag: string | null;
  billable: boolean;
  /** true = planned block (future), false = logged time. */
  planned: boolean;
  revenue: number;
};

type EntrySeed = [taskId: string, date: Date, start: number, duration: number, description: string];

/** Logged entries — every one ends strictly before Wed Sep 2 2026, 14:00. */
const loggedSeeds: EntrySeed[] = [
  // Weeks before the visible window (roll-up history for already-started tasks)
  ["rm-roadmap", d(2026, 7, 28), 9, 3, "Migration roadmap — drafting phases"],
  ["rm-roadmap", d(2026, 7, 29), 9.5, 3, "Migration roadmap — review with client"],
  ["rm-workshops", d(2026, 8, 4), 9, 4, "Stakeholder workshop — retail ops"],
  ["rm-workshops", d(2026, 8, 5), 14, 3, "Stakeholder workshop — IT & vendor"],
  ["rm-workshops", d(2026, 8, 12), 10, 3, "Stakeholder workshop — follow-ups"],
  ["rm-vendor-onboarding", d(2026, 8, 19), 9.5, 2.5, "Vendor onboarding — access & setup"],
  ["rm-vendor-onboarding", d(2026, 8, 20), 14, 2.5, "Vendor onboarding — checkpoint call"],
  ["it-requirements", d(2026, 8, 10), 9, 4, "Requirements workshop — warehouse & dispatch"],
  ["it-requirements", d(2026, 8, 11), 9.5, 4, "Requirements workshop — finance"],

  // Current week — Monday Aug 31 (fully logged)
  ["vs-kickoff", d(2026, 8, 31), 9, 4, "Kickoff workshop — scope alignment"],
  ["it-change-mgmt", d(2026, 8, 31), 14, 3, "Change management plan — adoption path"],
  ["rm-vendor-onboarding", d(2026, 8, 31), 17, 1.5, "Vendor onboarding — delivery checkpoint"],

  // Current week — Tuesday Sep 1 (fully logged)
  ["rm-vendor-onboarding", d(2026, 9, 1), 9, 1.5, "Vendor onboarding — escalation follow-up"],
  ["rm-shipment-comms", d(2026, 9, 1), 10.5, 3, "Shipment delay — comms plan & client update"],
  ["it-change-mgmt", d(2026, 9, 1), 14, 2.5, "Change management plan — training path"],

  // Current week — Wednesday Sep 2, morning only (before "now")
  ["it-governance", d(2026, 9, 2), 8, 2, "Status pack — weekly reporting"],
  ["rm-escalation-call", d(2026, 9, 2), 10, 1.5, "Client escalation call — Meridian leadership"],
  ["it-governance", d(2026, 9, 2), 12, 2, "Governance — steering committee prep"],
];

/** Planned blocks — future only (Thu Sep 3 onwards). Never counted as tracked time. */
const plannedSeeds: EntrySeed[] = [
  // Current week — Thursday & Friday
  ["rm-cutover-rehearsal", d(2026, 9, 3), 9, 9, "Cutover rehearsal — dry run"],
  ["rm-cutover-rehearsal", d(2026, 9, 4), 8, 9, "Cutover rehearsal — vendor sign-off prep"],
  ["it-doc-cleanup", d(2026, 9, 4), 17, 5, "Process documentation cleanup"],
  // Next week — Retail Platform Migration

  ["rm-vendor-wrapup", d(2026, 9, 10), 14, 5, "Vendor onboarding coordination — phase 2"],
  // Next week — Internal Tools Rollout
  ["it-uat", d(2026, 9, 7), 14, 2, "UAT coordination — test plan"],
  ["it-uat", d(2026, 9, 8), 14, 2, "UAT coordination — pilot teams"],
  ["it-uat", d(2026, 9, 9), 9, 2, "UAT coordination — defect triage"],
  ["it-training", d(2026, 9, 10), 9, 4, "Training session planning"],
  // Next week — Vendor Selection Program
  ["vs-rfp", d(2026, 9, 7), 12, 3, "RFP review coordination — responses"],
  ["vs-rfp", d(2026, 9, 8), 11, 3, "RFP review coordination — scoring"],
  ["vs-shortlist", d(2026, 9, 9), 14, 3, "Vendor shortlist review meeting"],
];

let entrySeq = 0;
function buildEntry(seed: EntrySeed, planned: boolean): TimeEntry {
  const [taskId, date, start, duration, description] = seed;
  const task = taskSeedById(taskId);
  const project = seedById(task.projectId);
  const billable = project.billableProject;
  const covered =
    billable &&
    project.rate != null &&
    project.rateEffectiveFrom != null &&
    date >= project.rateEffectiveFrom;
  return {
    id: `${planned ? "p" : "e"}${++entrySeq}`,
    date: iso(date),
    start,
    end: start + duration,
    duration,
    description,
    memberId: "ec",
    taskId,
    projectId: project.id,
    tag: task.tag,
    billable,
    planned,
    revenue: !planned && covered ? duration * (project.rate as number) : 0,
  };
}

const byDate = (a: TimeEntry, b: TimeEntry) =>
  a.date < b.date ? -1 : a.date > b.date ? 1 : a.start - b.start;

const timeEntries: TimeEntry[] = loggedSeeds
  .map((s) => buildEntry(s, false))
  .sort(byDate);

export const plannedEntries: TimeEntry[] = plannedSeeds
  .map((s) => buildEntry(s, true))
  .sort(byDate);

export { timeEntries };

/* ------------------------------------------------------------------ */
/* Derived: tasks                                                      */
/* ------------------------------------------------------------------ */

const trackedByTask = new Map<string, number>();
const plannedByTask = new Map<string, number>();
for (const e of timeEntries) {
  if (!e.taskId) continue;
  trackedByTask.set(e.taskId, (trackedByTask.get(e.taskId) ?? 0) + e.duration);
}
for (const e of plannedEntries) {
  if (!e.taskId) continue;
  plannedByTask.set(e.taskId, (plannedByTask.get(e.taskId) ?? 0) + e.duration);
}

export type Task = {
  id: string;
  name: string;
  description: string;
  projectId: string;
  assignee: string; // initials, as displayed
  assigneeId: string;
  dates: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  /** null = no estimate at all (not zero). */
  estimateHours: number | null;
  estimate: string;
  tracked: number;
  plannedHours: number;
  /** tracked - estimate, in hours (positive = over estimate); null without estimate. */
  delta: number | null;
  /** tracked / estimate (1 = on target); null without estimate. */
  ratio: number | null;
  priority: Priority;
  tag: string | null;
  status: TaskStatus;
  billable: boolean;
  kind: TaskKind;
};

export const tasks: Task[] = taskSeeds.map((t) => {
  const tracked = q(trackedByTask.get(t.id) ?? 0);
  const plannedHours = q(plannedByTask.get(t.id) ?? 0);
  const seed = seedById(t.projectId);
  const estimateHours = t.estimate;
  return {
    id: t.id,
    name: t.name,
    description: t.description,
    projectId: t.projectId,
    assignee: memberById(t.assignee).initials,
    assigneeId: t.assignee,
    dates:
      shortDate(t.start) === shortDate(t.end)
        ? shortDate(t.start)
        : `${shortDate(t.start)} - ${shortDate(t.end)}`,
    startDate: iso(t.start),
    endDate: iso(t.end),
    createdAt: iso(t.createdAt),
    estimateHours,
    estimate: estimateHours == null ? "—" : formatHours(estimateHours),
    tracked,
    plannedHours,
    delta: estimateHours == null ? null : q(tracked - estimateHours),
    ratio: estimateHours == null ? null : tracked / estimateHours,
    priority: t.priority,
    tag: t.tag,
    status: t.status,
    billable: seed.billableProject,
    kind: t.kind,
  };
});

export const taskById = (id: string) => tasks.find((t) => t.id === id);
export const tasksByStatus = (status: TaskStatus, projectId?: string) =>
  tasks.filter((t) => t.status === status && (!projectId || t.projectId === projectId));

/* ------------------------------------------------------------------ */
/* Derived: projects                                                   */
/* ------------------------------------------------------------------ */

export type Project = {
  id: string;
  name: string;
  client: string | null;
  color: ProjectColor;
  tracked: number;
  billable: number;
  plannedHours: number;
  /** Billable hours that no active rate covered when they were logged. */
  uncoveredHours: number;
  revenue: number;
  cost: number;
  entries: number;
  rate: number | null;
  rateEffectiveFrom: string | null;
  startDate: string;
  endDate: string;
  dates: string;
  status: "Active" | "Archived";
  billableProject: boolean;
};

export const projects: Project[] = projectSeeds.map((p) => {
  const rows = timeEntries.filter((e) => e.projectId === p.id);
  const tracked = rows.reduce((s, e) => s + e.duration, 0);
  const billable = rows.filter((e) => e.billable).reduce((s, e) => s + e.duration, 0);
  const uncovered = rows
    .filter((e) => e.billable && e.revenue === 0)
    .reduce((s, e) => s + e.duration, 0);
  const revenue = rows.reduce((s, e) => s + e.revenue, 0);
  const cost = rows.reduce((s, e) => s + e.duration * memberById(e.memberId).costRate, 0);
  return {
    id: p.id,
    name: p.name,
    client: p.client,
    color: p.color,
    tracked: q(tracked),
    billable: q(billable),
    plannedHours: q(
      plannedEntries.filter((e) => e.projectId === p.id).reduce((s, e) => s + e.duration, 0),
    ),
    uncoveredHours: q(uncovered),
    revenue,
    cost,
    entries: rows.length,
    rate: p.rate,
    rateEffectiveFrom: p.rateEffectiveFrom ? iso(p.rateEffectiveFrom) : null,
    startDate: iso(p.start),
    endDate: iso(p.end),
    dates: `${shortDate(p.start)} - ${shortDate(p.end)}`,
    status: p.status,
    billableProject: p.billableProject,
  };
});

export const projectById = (id: string) => projects.find((p) => p.id === id);

export const clients = ["Meridian Retail", "Bramwell Logistics", "Solène Cosmetics"];

/* ------------------------------------------------------------------ */
/* Derived: totals, month trend, per-member stats                      */
/* ------------------------------------------------------------------ */

const totalTracked = timeEntries.reduce((s, e) => s + e.duration, 0);
const totalBillable = timeEntries
  .filter((e) => e.billable)
  .reduce((s, e) => s + e.duration, 0);
const totalRevenue = timeEntries.reduce((s, e) => s + e.revenue, 0);
const totalCost = timeEntries.reduce(
  (s, e) => s + e.duration * memberById(e.memberId).costRate,
  0,
);
const workingDays = new Set(timeEntries.map((e) => e.date)).size;

export const totals = {
  tracked: q(totalTracked),
  billable: q(totalBillable),
  entries: timeEntries.length,
  revenue: totalRevenue,
  cost: totalCost,
  profit: totalRevenue - totalCost,
  margin: totalRevenue ? ((totalRevenue - totalCost) / totalRevenue) * 100 : 0,
  amount: money(totalRevenue),
  avgPerDay: formatHours(totalTracked / Math.max(workingDays, 1)),
};

export type MonthStat = {
  key: string;
  label: string;
  tracked: number;
  billable: number;
  revenue: number;
  cost: number;
  margin: number; // contribution margin in €
  marginPct: number;
};

const monthKeys = ["2026-07", "2026-08", "2026-09"];
const monthLabel = (key: string) => `${MONTH_ABBR[Number(key.slice(5)) - 1] ?? ""} 2026`;

export const monthlyStats: MonthStat[] = monthKeys.map((key) => {
  const rows = timeEntries.filter((e) => e.date.startsWith(key));
  const revenue = rows.reduce((s, e) => s + e.revenue, 0);
  const cost = rows.reduce((s, e) => s + e.duration * memberById(e.memberId).costRate, 0);
  return {
    key,
    label: monthLabel(key),
    tracked: q(rows.reduce((s, e) => s + e.duration, 0)),
    billable: q(rows.filter((e) => e.billable).reduce((s, e) => s + e.duration, 0)),
    revenue,
    cost,
    margin: revenue - cost,
    marginPct: revenue ? ((revenue - cost) / revenue) * 100 : 0,
  };
});

export const monthlyStatsByProject = projects.map((p) => ({
  projectId: p.id,
  months: monthKeys.map((key) => {
    const rows = timeEntries.filter(
      (e) => e.projectId === p.id && e.date.startsWith(key),
    );
    const revenue = rows.reduce((s, e) => s + e.revenue, 0);
    const cost = rows.reduce(
      (s, e) => s + e.duration * memberById(e.memberId).costRate,
      0,
    );
    return {
      key,
      label: monthLabel(key),
      tracked: q(rows.reduce((s, e) => s + e.duration, 0)),
      revenue,
      cost,
      margin: revenue - cost,
    };
  }),
}));

const weeks: Date[] = [CURRENT_WEEK_START, NEXT_WEEK_START];

export type MemberWeek = {
  memberId: string;
  weekStart: string;
  tracked: number;
  billable: number;
  planned: number;
  capacity: number;
  ratio: number;
};

export const memberWeeks: MemberWeek[] = weeks.flatMap((w) => {
  const from = iso(w);
  const to = iso(addDays(w, 6));
  return teamMembers.map((m) => {
    const rows = timeEntries.filter(
      (e) => e.memberId === m.id && e.date >= from && e.date <= to,
    );
    const tracked = rows.reduce((s, e) => s + e.duration, 0);
    return {
      memberId: m.id,
      weekStart: from,
      tracked: q(tracked),
      billable: q(rows.filter((e) => e.billable).reduce((s, e) => s + e.duration, 0)),
      planned: q(
        plannedEntries
          .filter((e) => e.memberId === m.id && e.date >= from && e.date <= to)
          .reduce((s, e) => s + e.duration, 0),
      ),
      capacity: m.capacity,
      ratio: tracked / m.capacity,
    };
  });
});

export const memberMonths = teamMembers.flatMap((m) =>
  monthKeys.map((key) => {
    const rows = timeEntries.filter(
      (e) => e.memberId === m.id && e.date.startsWith(key),
    );
    const tracked = rows.reduce((s, e) => s + e.duration, 0);
    const weeksInMonth = Math.max(
      1,
      new Set(rows.map((e) => iso(mondayOf(new Date(`${e.date}T00:00:00Z`))))).size,
    );
    const capacity = m.capacity * weeksInMonth;
    return {
      memberId: m.id,
      key,
      label: monthLabel(key),
      tracked: q(tracked),
      billable: q(rows.filter((e) => e.billable).reduce((s, e) => s + e.duration, 0)),
      capacity,
      ratio: tracked / capacity,
    };
  }),
);

export const memberStats = teamMembers.map((m) => {
  const rows = timeEntries.filter((e) => e.memberId === m.id);
  const tracked = rows.reduce((s, e) => s + e.duration, 0);
  const billable = rows.filter((e) => e.billable).reduce((s, e) => s + e.duration, 0);
  return {
    ...m,
    tracked: q(tracked),
    billable: q(billable),
    utilization: tracked ? (billable / tracked) * 100 : 0,
    cost: tracked * m.costRate,
    revenue: rows.reduce((s, e) => s + e.revenue, 0),
  };
});

/** Members table rows. */
export const members = memberStats.map((m) => ({
  name: m.name,
  initials: m.initials,
  email: m.email,
  role: "Administrator",
  jobTitle: m.role,
  groups: m.groups,
  status: m.status,
  rate: `${m.costRate} €/h`,
}));

/* ------------------------------------------------------------------ */
/* Derived: current week (calendar screen)                             */
/* ------------------------------------------------------------------ */

const weekFrom = iso(CURRENT_WEEK_START);
const weekTo = iso(addDays(CURRENT_WEEK_START, 6));

export const weekDays = Array.from({ length: 7 }, (_, i) => {
  const date = addDays(CURRENT_WEEK_START, i);
  const hours = timeEntries
    .filter((e) => e.memberId === currentUser.id && e.date === iso(date))
    .reduce((s, e) => s + e.duration, 0);
  return {
    label: (["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const)[i]!,
    num: date.getUTCDate(),
    date: iso(date),
    hours: hours ? formatHours(hours) : "–",
  };
});

export type CalendarEvent = {
  id: string;
  day: number;
  start: number;
  end: number;
  title: string;
  subtitle?: string;
  duration: string;
  color: ProjectColor;
  billable?: boolean;
  planned?: boolean;
  lane?: 0 | 1;
};

function toEvents(rows: TimeEntry[], start: Date): CalendarEvent[] {
  return rows.map((e) => {
    const project = e.projectId ? projectById(e.projectId) : null;
    const day = Math.round((Date.parse(e.date) - start.getTime()) / (24 * 3600 * 1000));
    return {
      id: e.id,
      day,
      start: e.start,
      end: e.end,
      // Use the task name so calendar events match the Impact board naming.
      title: e.taskId ? taskSeedById(e.taskId).name : e.description,
      ...(project ? { subtitle: project.name } : {}),
      duration: formatHours(e.duration),
      color: project?.color ?? "pink",
      billable: e.billable,
      planned: e.planned,
    };
  });
}

export const calendarEvents: CalendarEvent[] = toEvents(
  [
    ...timeEntries.filter(
      (e) => e.memberId === currentUser.id && e.date >= weekFrom && e.date <= weekTo,
    ),
    ...plannedEntries.filter(
      (e) => e.memberId === currentUser.id && e.date >= weekFrom && e.date <= weekTo,
    ),
  ],
  CURRENT_WEEK_START,
);

const currentWeekEntries = timeEntries.filter(
  (e) => e.memberId === currentUser.id && e.date >= weekFrom && e.date <= weekTo,
);
const currentWeekTracked = currentWeekEntries.reduce((s, e) => s + e.duration, 0);
const currentWeekBillable = currentWeekEntries
  .filter((e) => e.billable)
  .reduce((s, e) => s + e.duration, 0);
const currentWeekRevenue = currentWeekEntries.reduce((s, e) => s + e.revenue, 0);

const CURRENT_CAPACITY = currentUser.capacity ?? 35;

export const weekSummary = {
  tracked: formatHours(currentWeekTracked),
  trackedHours: q(currentWeekTracked),
  planned: formatHours(CURRENT_CAPACITY),
  progress: Math.min(currentWeekTracked / CURRENT_CAPACITY, 1),
  billableHours: q(currentWeekBillable),
  billableShare: `${formatHours(currentWeekBillable)} (${Math.round(
    (currentWeekBillable / Math.max(currentWeekTracked, 0.01)) * 100,
  )} %)`,
  amount: money(currentWeekRevenue),
  weekLabel: "This week • W36",
  rangeLabel: `${shortDate(CURRENT_WEEK_START)} - ${shortDate(addDays(CURRENT_WEEK_START, 6))} 2026`,
};

/* ------------------------------------------------------------------ */
/* Derived: reports                                                    */
/* ------------------------------------------------------------------ */

export const workloadTarget = 7; // daily target for a 35h week

export const workloadDays = Array.from({ length: 5 }, (_, i) => {
  const date = addDays(CURRENT_WEEK_START, i);
  const tracked = timeEntries
    .filter((e) => e.memberId === currentUser.id && e.date === iso(date))
    .reduce((s, e) => s + e.duration, 0);
  return {
    label: (["Mon", "Tue", "Wed", "Thu", "Fri"] as const)[i]!,
    date: `${date.getUTCMonth() + 1}/${date.getUTCDate()}`,
    tracked: q(tracked),
  };
});

const uncoveredEntries = timeEntries.filter((e) => e.billable && e.revenue === 0);
const uncoveredHours = q(uncoveredEntries.reduce((s, e) => s + e.duration, 0));

export const profitability = {
  revenue: money(totalRevenue),
  cost: money(totalCost),
  profit: money(totalRevenue - totalCost),
  margin: `${totals.margin.toFixed(1)} %`,
  uncoveredHours,
  uncoveredLabel: `${formatHours(uncoveredHours)} logged as billable before any rate was active`,
  uncoveredProjects: [
    ...new Set(uncoveredEntries.map((e) => projectById(e.projectId!)?.name ?? "—")),
  ],
  nonBillableProjects: projects.filter((p) => !p.billableProject).map((p) => p.name),
  months: monthlyStats,
};

export const utilization = {
  billableShare: totalTracked ? Math.round((totalBillable / totalTracked) * 100) : 0,
  target: 60,
  rows: memberStats.map((m) => ({
    member: m.name,
    tracked: formatHours(m.tracked),
    billable: formatHours(m.billable),
    util: `${Math.round(m.utilization)} %`,
  })),
};

/** Most recent time entries, newest first — feeds the Time logs report. */
export const timeLogs = [...timeEntries]
  .reverse()
  .slice(0, 25)
  .map((e) => ({
    date: shortDate(new Date(`${e.date}T00:00:00Z`)),
    description: e.description,
    project: e.projectId ? projectById(e.projectId)!.name : "— No project",
    member: memberById(e.memberId).name,
    duration: formatHours(e.duration),
    billable: e.billable,
  }));

/* ------------------------------------------------------------------ */
/* Ask Toggl overlay (static conversation, values from the dataset)    */
/* ------------------------------------------------------------------ */

const thisWeekByProject = projects.map((p) => {
  const rows = currentWeekEntries.filter((e) => e.projectId === p.id);
  return {
    project: p,
    tracked: q(rows.reduce((s, e) => s + e.duration, 0)),
    revenue: rows.reduce((s, e) => s + e.revenue, 0),
  };
});

export const askConversation = [
  {
    role: "user" as const,
    text: "How is my week going across the three client engagements?",
  },
  {
    role: "assistant" as const,
    text: `So far this week you tracked ${formatHours(currentWeekTracked)} across three billable engagements, for ${money(
      currentWeekRevenue,
    )} of invoiceable time.`,
    table: {
      head: ["Project", "Client", "Tracked", "Amount"],
      rows: thisWeekByProject.map((r) => [
        r.project.name,
        r.project.client ?? "—",
        formatHours(r.tracked),
        money(r.revenue),
      ]),
    },
    takeaways: [
      `Billable share is ${utilization.billableShare} % of tracked time, against a ${utilization.target} % target.`,
      `Next week is planned only: ${formatHours(
        plannedEntries.reduce((s, e) => s + e.duration, 0),
      )} of scheduled work, nothing logged yet.`,
    ],
    actions: [
      "Review Retail Platform Migration tasks",
      "Check next week's planned load",
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Week navigation: everything a week-scoped screen needs              */
/* ------------------------------------------------------------------ */

export function isoWeekNumber(date: Date) {
  const t = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = (t.getUTCDay() + 6) % 7;
  t.setUTCDate(t.getUTCDate() - day + 3);
  const firstThursday = new Date(Date.UTC(t.getUTCFullYear(), 0, 4));
  const fday = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - fday + 3);
  return 1 + Math.round((t.getTime() - firstThursday.getTime()) / (7 * 24 * 3600 * 1000));
}

/** Everything the Timer and Reports screens need for one week (offset in weeks from today's week). */
export function weekView(offset = 0) {
  const start = addDays(CURRENT_WEEK_START, offset * 7);
  const from = iso(start);
  const to = iso(addDays(start, 6));
  const all = timeEntries.filter((e) => e.date >= from && e.date <= to);
  const mine = all.filter((e) => e.memberId === currentUser.id);
  const minePlanned = plannedEntries.filter(
    (e) => e.memberId === currentUser.id && e.date >= from && e.date <= to,
  );

  const days = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(start, i);
    const hours = mine
      .filter((e) => e.date === iso(date))
      .reduce((s, e) => s + e.duration, 0);
    return {
      label: (["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const)[i]!,
      num: date.getUTCDate(),
      date: iso(date),
      hours: hours ? formatHours(hours) : "–",
    };
  });

  const events = toEvents([...mine, ...minePlanned], start);

  const tracked = mine.reduce((s, e) => s + e.duration, 0);
  const billable = mine.filter((e) => e.billable).reduce((s, e) => s + e.duration, 0);
  const revenue = mine.reduce((s, e) => s + e.revenue, 0);
  const plannedHours = minePlanned.reduce((s, e) => s + e.duration, 0);
  const capacity = currentUser.capacity ?? 35;

  const teamRevenue = all.reduce((s, e) => s + e.revenue, 0);
  const teamCost = all.reduce(
    (s, e) => s + e.duration * memberById(e.memberId).costRate,
    0,
  );
  const activeDays = new Set(all.map((e) => e.date)).size;
  const uncovered = all.filter((e) => e.billable && e.revenue === 0);

  return {
    offset,
    start,
    from,
    to,
    isCurrent: offset === 0,
    weekNumber: isoWeekNumber(start),
    rangeLabel: `${shortDate(start)} - ${shortDate(addDays(start, 6))} ${start.getUTCFullYear()}`,
    weekLabel: `${offset === 0 ? "This week" : offset === 1 ? "Next week" : shortDate(start)} • W${isoWeekNumber(start)}`,
    days,
    events,
    summary: {
      tracked: formatHours(tracked),
      trackedHours: q(tracked),
      planned: formatHours(plannedHours || capacity),
      plannedHours: q(plannedHours),
      progress: Math.min(tracked / capacity, 1),
      billableHours: q(billable),
      billableShare: `${formatHours(billable)} (${Math.round((billable / Math.max(tracked, 0.01)) * 100)} %)`,
      amount: money(revenue),
    },
    workloadDays: Array.from({ length: 5 }, (_, i) => {
      const date = addDays(start, i);
      return {
        label: (["Mon", "Tue", "Wed", "Thu", "Fri"] as const)[i]!,
        date: `${date.getUTCMonth() + 1}/${date.getUTCDate()}`,
        tracked: q(mine.filter((e) => e.date === iso(date)).reduce((s, e) => s + e.duration, 0)),
      };
    }),
    team: {
      tracked: q(tracked),
      billable: q(billable),
      revenue: teamRevenue,
      cost: teamCost,
      profit: teamRevenue - teamCost,
      margin: teamRevenue ? ((teamRevenue - teamCost) / teamRevenue) * 100 : 0,
      amount: money(teamRevenue),
      avgPerDay: formatHours(tracked / Math.max(activeDays, 1)),
      billableShare: tracked ? Math.round((billable / tracked) * 100) : 0,
      uncoveredHours: q(uncovered.reduce((s, e) => s + e.duration, 0)),
      uncoveredProjects: [
        ...new Set(uncovered.map((e) => projectById(e.projectId!)?.name ?? "—")),
      ],
    },
    projectRows: projects.map((p) => {
      const rows = all.filter((e) => e.projectId === p.id);
      return {
        project: p,
        tracked: q(rows.reduce((s, e) => s + e.duration, 0)),
        billable: q(rows.filter((e) => e.billable).reduce((s, e) => s + e.duration, 0)),
        entries: rows.length,
        revenue: rows.reduce((s, e) => s + e.revenue, 0),
      };
    }),
    memberRows: teamMembers.map((m) => {
      const rows = all.filter((e) => e.memberId === m.id);
      const t = rows.reduce((s, e) => s + e.duration, 0);
      const b = rows.filter((e) => e.billable).reduce((s, e) => s + e.duration, 0);
      return {
        member: m.name,
        capacity: m.capacity,
        tracked: formatHours(t),
        trackedHours: q(t),
        billable: formatHours(b),
        util: `${t ? Math.round((b / t) * 100) : 0} %`,
      };
    }),
    logs: [...all]
      .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.start - a.start))
      .slice(0, 25)
      .map((e) => ({
        date: shortDate(new Date(`${e.date}T00:00:00Z`)),
        description: e.description,
        project: e.projectId ? projectById(e.projectId)!.name : "— No project",
        member: memberById(e.memberId).name,
        duration: formatHours(e.duration),
        billable: e.billable,
      })),
  };
}

export type WeekView = ReturnType<typeof weekView>;

/** Navigation is clamped to the two-week window: current week and next week. */
export const WEEK_OFFSET_MIN = 0;
export const WEEK_OFFSET_MAX = 1;

/** Default landing week: W36 (Aug 31 – Sep 6 2026) — the current week. */
export const DEFAULT_WEEK_OFFSET = 0;
