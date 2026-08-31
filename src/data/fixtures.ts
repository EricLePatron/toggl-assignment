/**
 * Single source of mock data shared by every screen — Studio North dataset.
 *
 * Everything below is generated deterministically from a small set of
 * declarative inputs (members, projects, tasks) into a flat list of time
 * entries. Every figure displayed in the app derives from `timeEntries`,
 * so no two screens can contradict each other.
 *
 * Window: March 1 2026 → August 31 2026 ("today" = Monday August 31 2026).
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
const monthKey = (date: Date) =>
  `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;

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

/** Deterministic PRNG so the dataset never changes between renders. */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20260831);
const jitter = (base: number, pct: number) => base * (1 + (rand() * 2 - 1) * pct);
const q = (h: number) => Math.round(h * 4) / 4;

export const TODAY = d(2026, 8, 31);
export const WINDOW_START = d(2026, 3, 1);
export const WINDOW_END = d(2026, 8, 31);
export const CURRENT_WEEK_START = mondayOf(TODAY); // Mon Aug 31 2026

/* ------------------------------------------------------------------ */
/* Workspace, members                                                  */
/* ------------------------------------------------------------------ */

export const workspace = {
  name: "Studio North",
  shortName: "Studio North",
  trialDaysLeft: 29,
  trialCopy:
    "You are trying 10 Premium features on this project — recurring, estimates, billing & more.",
};

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
    id: "ce",
    name: "Chollet Eric",
    initials: "CE",
    email: "eric.chollet@studionorth.com",
    role: "Product Manager",
    costRate: 70,
    capacity: 35,
    status: "Active",
    groups: "Leadership",
  },
  {
    id: "tn",
    name: "Théo Novak",
    initials: "TN",
    email: "theo.novak@studionorth.com",
    role: "Product Designer",
    costRate: 65,
    capacity: 38,
    status: "Active",
    groups: "Design",
  },
  {
    id: "ao",
    name: "Amara Okafor",
    initials: "AO",
    email: "amara.okafor@studionorth.com",
    role: "Full-stack Developer",
    costRate: 75,
    capacity: 38,
    status: "Active",
    groups: "Engineering",
  },
];

export const memberById = (id: string) => teamMembers.find((m) => m.id === id)!;
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
  /** Date the rate became effective in Toggl — NOT necessarily the project start. */
  rateEffectiveFrom: Date | null;
  start: Date;
  end: Date;
  status: "Active" | "Archived";
};

const projectSeeds: ProjectSeed[] = [
  {
    id: "verdant-redesign",
    name: "Verdant Health — Product Redesign",
    client: "Verdant Health",
    color: "green",
    billableProject: true,
    rate: 95,
    rateEffectiveFrom: d(2026, 3, 2),
    start: d(2026, 3, 2),
    end: d(2026, 8, 31),
    status: "Active",
  },
  {
    id: "halyard-onboarding",
    name: "Halyard Finance — Onboarding Flow",
    client: "Halyard Finance",
    color: "violet",
    billableProject: true,
    rate: 110,
    // Rate only configured in June, two months after the project actually started.
    rateEffectiveFrom: d(2026, 6, 1),
    start: d(2026, 4, 6),
    end: d(2026, 8, 31),
    status: "Active",
  },
  {
    id: "halyard-compliance",
    name: "Halyard Finance — Compliance Audit Trail",
    client: "Halyard Finance",
    color: "teal",
    billableProject: true,
    rate: 110,
    rateEffectiveFrom: d(2026, 6, 29),
    start: d(2026, 7, 1),
    end: d(2026, 9, 30),
    status: "Active",
  },
  {
    id: "studio-internal",
    name: "Studio North — Internal & Ops",
    client: null,
    color: "orange",
    billableProject: false,
    rate: null,
    rateEffectiveFrom: null,
    start: d(2026, 3, 2),
    end: d(2026, 8, 31),
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
  assignee: string; // member id
  estimate: number; // hours
  /** actual / estimate — drives the generated time entries. */
  factor: number;
  start: Date;
  end: Date;
  priority: Priority;
  tag: string | null;
  status: TaskStatus;
  kind: TaskKind;
  /** Ongoing buckets absorb whatever capacity is left in a week. */
  flex?: boolean;
};

const INTEGRATION_TAG = "Integration & third-party";

const taskSeeds: TaskSeed[] = [
  /* ---- Amara: integration & third-party coordination (systematic overrun) ---- */
  {
    id: "t-int-1",
    name: "Third-party auth integration",
    description:
      "Wire Verdant's SSO provider into the new app shell, including the client's legacy session bridge.",
    projectId: "verdant-redesign",
    assignee: "ao",
    estimate: 10,
    factor: 1.5,
    start: d(2026, 3, 16),
    end: d(2026, 3, 27),
    priority: "High",
    tag: INTEGRATION_TAG,
    status: "Done",
    kind: "integration",
  },
  {
    id: "t-int-2",
    name: "Sync data with client's CRM",
    description:
      "Two-way sync between Verdant's HubSpot instance and the patient records service.",
    projectId: "verdant-redesign",
    assignee: "ao",
    estimate: 14,
    factor: 1.55,
    start: d(2026, 4, 27),
    end: d(2026, 5, 8),
    priority: "High",
    tag: INTEGRATION_TAG,
    status: "Done",
    kind: "integration",
  },
  {
    id: "t-int-3",
    name: "Connect payment provider API",
    description:
      "Stripe Connect onboarding for Halyard, incl. sandbox credentials chased from the provider.",
    projectId: "halyard-onboarding",
    assignee: "ao",
    estimate: 16,
    factor: 1.68,
    start: d(2026, 6, 8),
    end: d(2026, 6, 19),
    priority: "High",
    tag: INTEGRATION_TAG,
    status: "Done",
    kind: "integration",
  },
  {
    id: "t-int-4",
    name: "Coordinate handoff with client's internal dev team",
    description:
      "Working sessions with Halyard's in-house engineers to hand over the onboarding services.",
    projectId: "halyard-onboarding",
    assignee: "ao",
    estimate: 8,
    factor: 1.5,
    start: d(2026, 6, 15),
    end: d(2026, 6, 26),
    priority: "Medium",
    tag: INTEGRATION_TAG,
    status: "Done",
    kind: "integration",
  },
  {
    id: "t-int-5",
    name: "Wearables data integration (partner SDK)",
    description:
      "Ingest step and sleep data from Verdant's wearable partner SDK, incl. partner support loop.",
    projectId: "verdant-redesign",
    assignee: "ao",
    estimate: 12,
    factor: 1.62,
    start: d(2026, 7, 13),
    end: d(2026, 7, 24),
    priority: "High",
    tag: INTEGRATION_TAG,
    status: "Done",
    kind: "integration",
  },
  {
    id: "t-int-6",
    name: "Audit log export integration",
    description:
      "Push signed audit events to Halyard's SIEM vendor; format negotiated with the vendor.",
    projectId: "halyard-compliance",
    assignee: "ao",
    estimate: 10,
    factor: 1.56,
    start: d(2026, 8, 3),
    end: d(2026, 8, 14),
    priority: "Medium",
    tag: INTEGRATION_TAG,
    status: "Done",
    kind: "integration",
  },
  {
    id: "t-int-7",
    name: "KYC provider integration & handoff",
    description:
      "Identity verification provider integration for the audit trail, plus handoff to Halyard's team.",
    projectId: "halyard-compliance",
    assignee: "ao",
    estimate: 10,
    factor: 1.45,
    start: d(2026, 8, 24),
    end: d(2026, 9, 3), // due in 3 days, already over estimate
    priority: "High",
    tag: INTEGRATION_TAG,
    status: "In Progress",
    kind: "integration",
  },

  /* ---- Amara: plain feature implementation (on target) ---- */
  {
    id: "t-feat-1",
    name: "Build patient profile page",
    description: "New patient profile screen with vitals timeline and care team panel.",
    projectId: "verdant-redesign",
    assignee: "ao",
    estimate: 12,
    factor: 1.02,
    start: d(2026, 3, 30),
    end: d(2026, 4, 10),
    priority: "Medium",
    tag: "Feature",
    status: "Done",
    kind: "feature",
  },
  {
    id: "t-feat-2",
    name: "Build settings page",
    description: "Account, notification and privacy settings for the Verdant app.",
    projectId: "verdant-redesign",
    assignee: "ao",
    estimate: 12,
    factor: 1.05,
    start: d(2026, 5, 25),
    end: d(2026, 6, 5),
    priority: "Medium",
    tag: "Feature",
    status: "Done",
    kind: "feature",
  },
  {
    id: "t-feat-3",
    name: "Build onboarding form",
    description: "Multi-step onboarding form with inline validation for Halyard.",
    projectId: "halyard-onboarding",
    assignee: "ao",
    estimate: 14,
    factor: 1.07,
    start: d(2026, 6, 1),
    end: d(2026, 6, 12),
    priority: "High",
    tag: "Feature",
    status: "Done",
    kind: "feature",
  },
  {
    id: "t-feat-4",
    name: "Implement dashboard charts",
    description: "Adherence and engagement charts on the Verdant dashboard.",
    projectId: "verdant-redesign",
    assignee: "ao",
    estimate: 16,
    factor: 0.96,
    start: d(2026, 6, 29),
    end: d(2026, 7, 10),
    priority: "Medium",
    tag: "Feature",
    status: "Done",
    kind: "feature",
  },
  {
    id: "t-feat-5",
    name: "Implement audit trail table view",
    description: "Filterable, paginated audit event table with CSV export.",
    projectId: "halyard-compliance",
    assignee: "ao",
    estimate: 10,
    factor: 0.98,
    start: d(2026, 7, 13),
    end: d(2026, 7, 24),
    priority: "Medium",
    tag: "Feature",
    status: "Done",
    kind: "feature",
  },
  {
    id: "t-feat-6",
    name: "Refactor shared API client",
    description: "Unify request handling and error mapping across both client apps.",
    projectId: "verdant-redesign",
    assignee: "ao",
    estimate: 8,
    factor: 1.06,
    start: d(2026, 8, 17),
    end: d(2026, 8, 26),
    priority: "Low",
    tag: "Feature",
    status: "Done",
    kind: "feature",
  },
  {
    id: "t-feat-7",
    name: "Notification preferences API",
    description: "Backend endpoints for per-channel notification preferences.",
    projectId: "verdant-redesign",
    assignee: "ao",
    estimate: 6,
    factor: 1.0,
    start: d(2026, 8, 24),
    end: d(2026, 9, 4),
    priority: "Low",
    tag: "Feature",
    status: "Todo",
    kind: "feature",
  },

  /* ---- Théo: design ---- */
  {
    id: "t-des-1",
    name: "Discovery workshops & user interviews",
    description: "Five interviews with Verdant care coordinators, synthesis in FigJam.",
    projectId: "verdant-redesign",
    assignee: "tn",
    estimate: 14,
    factor: 1.08,
    start: d(2026, 3, 2),
    end: d(2026, 3, 13),
    priority: "High",
    tag: "Discovery",
    status: "Done",
    kind: "design",
  },
  {
    id: "t-des-2",
    name: "Design system foundations",
    description: "Type scale, color tokens and core components for the Verdant redesign.",
    projectId: "verdant-redesign",
    assignee: "tn",
    estimate: 20,
    factor: 1.12,
    start: d(2026, 3, 16),
    end: d(2026, 4, 3),
    priority: "High",
    tag: "Design system",
    status: "Done",
    kind: "design",
  },
  {
    id: "t-des-3",
    name: "Patient dashboard high-fidelity",
    description: "High-fidelity screens for the redesigned patient dashboard.",
    projectId: "verdant-redesign",
    assignee: "tn",
    estimate: 18,
    factor: 0.98,
    start: d(2026, 4, 13),
    end: d(2026, 4, 30),
    priority: "High",
    tag: "UI",
    status: "Done",
    kind: "design",
  },
  {
    id: "t-des-4",
    name: "Onboarding flow wireframes",
    description: "End-to-end wireframes for Halyard's account opening flow.",
    projectId: "halyard-onboarding",
    assignee: "tn",
    estimate: 16,
    factor: 1.06,
    start: d(2026, 4, 20),
    end: d(2026, 5, 8),
    priority: "High",
    tag: "UX",
    status: "Done",
    kind: "design",
  },
  {
    id: "t-des-5",
    name: "Onboarding UI high-fidelity",
    description: "Visual design for the onboarding steps, incl. KYC and funding screens.",
    projectId: "halyard-onboarding",
    assignee: "tn",
    estimate: 22,
    factor: 1.1,
    start: d(2026, 5, 18),
    end: d(2026, 6, 12),
    priority: "High",
    tag: "UI",
    status: "Done",
    kind: "design",
  },
  {
    id: "t-des-6",
    name: "Usability test round 2",
    description: "Moderated tests of the onboarding prototype with six Halyard users.",
    projectId: "halyard-onboarding",
    assignee: "tn",
    estimate: 10,
    factor: 1.05,
    start: d(2026, 6, 22),
    end: d(2026, 7, 3),
    priority: "Medium",
    tag: "Research",
    status: "Done",
    kind: "design",
  },
  {
    id: "t-des-7",
    name: "Compliance screens design",
    description: "Audit trail, evidence export and reviewer screens.",
    projectId: "halyard-compliance",
    assignee: "tn",
    estimate: 12,
    factor: 1.09,
    start: d(2026, 7, 6),
    end: d(2026, 7, 17),
    priority: "Medium",
    tag: "UI",
    status: "Done",
    kind: "design",
  },
  {
    id: "t-des-8",
    name: "Mobile adaptation — Verdant app",
    description: "Responsive adaptation of the redesigned screens for small viewports.",
    projectId: "verdant-redesign",
    assignee: "tn",
    estimate: 18,
    factor: 1.11,
    start: d(2026, 8, 3),
    end: d(2026, 8, 21),
    priority: "High",
    tag: "UI",
    status: "Done",
    kind: "design",
  },
  {
    id: "t-des-9",
    name: "Accessibility pass — contrast & focus states",
    description: "WCAG AA audit of the new component library and remediation specs.",
    projectId: "verdant-redesign",
    assignee: "tn",
    estimate: 8,
    factor: 1.15,
    start: d(2026, 8, 24),
    end: d(2026, 9, 2),
    priority: "Medium",
    tag: "Design system",
    status: "In Progress",
    kind: "design",
  },
  {
    id: "t-des-10",
    name: "Marketing site refresh concepts",
    description: "Blocked: waiting on Verdant's new brand guidelines.",
    projectId: "verdant-redesign",
    assignee: "tn",
    estimate: 10,
    factor: 0.25,
    start: d(2026, 8, 10),
    end: d(2026, 9, 11),
    priority: "Low",
    tag: "Brand",
    status: "Blocked",
    kind: "design",
  },

  /* ---- Eric: PM / client work ---- */
  {
    id: "t-pm-1",
    name: "Verdant engagement scoping",
    description: "Scope, milestones and retainer terms for the redesign engagement.",
    projectId: "verdant-redesign",
    assignee: "ce",
    estimate: 12,
    factor: 1.05,
    start: d(2026, 3, 2),
    end: d(2026, 3, 13),
    priority: "High",
    tag: "Scoping",
    status: "Done",
    kind: "pm",
  },
  {
    id: "t-pm-2",
    name: "Halyard kickoff & scoping",
    description: "Kickoff workshop, scope note and delivery plan for the onboarding flow.",
    projectId: "halyard-onboarding",
    assignee: "ce",
    estimate: 14,
    factor: 1.1,
    start: d(2026, 4, 6),
    end: d(2026, 4, 24),
    priority: "High",
    tag: "Scoping",
    status: "Done",
    kind: "pm",
  },
  {
    id: "t-pm-3",
    name: "Weekly client reviews — Verdant",
    description: "Recurring review with Verdant's product lead, notes and follow-ups.",
    projectId: "verdant-redesign",
    assignee: "ce",
    estimate: 24,
    factor: 0.98,
    start: d(2026, 3, 16),
    end: d(2026, 8, 28),
    priority: "Medium",
    tag: "Client",
    status: "In Progress",
    kind: "pm",
  },
  {
    id: "t-pm-4",
    name: "Compliance audit scope note",
    description: "Fixed-scope definition and rate setup for the audit trail sub-project.",
    projectId: "halyard-compliance",
    assignee: "ce",
    estimate: 8,
    factor: 1.02,
    start: d(2026, 7, 1),
    end: d(2026, 7, 10),
    priority: "High",
    tag: "Scoping",
    status: "Done",
    kind: "pm",
  },
  {
    id: "t-pm-5",
    name: "Backlog grooming & delivery follow-up",
    description: "Keep both client backlogs current; unblock the team week to week.",
    projectId: "halyard-onboarding",
    assignee: "ce",
    estimate: 16,
    factor: 1.0,
    start: d(2026, 5, 4),
    end: d(2026, 8, 28),
    priority: "Medium",
    tag: "Delivery",
    status: "In Progress",
    kind: "pm",
  },
  {
    id: "t-pm-6",
    name: "Q3 renewal proposal — Verdant",
    description: "Prepare the retainer renewal proposal for September onwards.",
    projectId: "verdant-redesign",
    assignee: "ce",
    estimate: 6,
    factor: 0.6,
    start: d(2026, 8, 24),
    end: d(2026, 9, 4),
    priority: "High",
    tag: "Client",
    status: "Todo",
    kind: "pm",
  },

  /* ---- Ongoing buckets (absorb remaining weekly capacity) ---- */
  {
    id: "t-flex-tn-verdant",
    name: "Design QA & iterations — Verdant",
    description: "Ongoing design QA, spec updates and iteration on shipped screens.",
    projectId: "verdant-redesign",
    assignee: "tn",
    estimate: 0,
    factor: 1,
    start: d(2026, 3, 2),
    end: d(2026, 8, 31),
    priority: "Medium",
    tag: "Design QA",
    status: "In Progress",
    kind: "ongoing",
    flex: true,
  },
  {
    id: "t-flex-tn-halyard",
    name: "Design QA & iterations — Halyard",
    description: "Ongoing polish and handoff support on the onboarding flow.",
    projectId: "halyard-onboarding",
    assignee: "tn",
    estimate: 0,
    factor: 1,
    start: d(2026, 6, 1),
    end: d(2026, 8, 31),
    priority: "Medium",
    tag: "Design QA",
    status: "In Progress",
    kind: "ongoing",
    flex: true,
  },
  {
    id: "t-flex-ao-verdant",
    name: "Implementation & bugfixes — Verdant",
    description: "Ongoing implementation, code review and bugfixing on the redesign.",
    projectId: "verdant-redesign",
    assignee: "ao",
    estimate: 0,
    factor: 1,
    start: d(2026, 3, 2),
    end: d(2026, 8, 31),
    priority: "Medium",
    tag: "Engineering",
    status: "In Progress",
    kind: "ongoing",
    flex: true,
  },
  {
    id: "t-flex-ao-halyard",
    name: "Implementation & bugfixes — Halyard",
    description: "Ongoing implementation and bugfixing on the onboarding flow.",
    projectId: "halyard-onboarding",
    assignee: "ao",
    estimate: 0,
    factor: 1,
    start: d(2026, 6, 1),
    end: d(2026, 8, 31),
    priority: "Medium",
    tag: "Engineering",
    status: "In Progress",
    kind: "ongoing",
    flex: true,
  },
  {
    id: "t-flex-ce-verdant",
    name: "Client relationship & reporting — Verdant",
    description: "Ongoing account management, status reporting and invoicing prep.",
    projectId: "verdant-redesign",
    assignee: "ce",
    estimate: 0,
    factor: 1,
    start: d(2026, 3, 2),
    end: d(2026, 8, 31),
    priority: "Medium",
    tag: "Client",
    status: "In Progress",
    kind: "ongoing",
    flex: true,
  },
  {
    id: "t-flex-ce-halyard",
    name: "Client relationship & reporting — Halyard",
    description: "Ongoing account management and reporting on both Halyard projects.",
    projectId: "halyard-onboarding",
    assignee: "ce",
    estimate: 0,
    factor: 1,
    start: d(2026, 6, 1),
    end: d(2026, 8, 31),
    priority: "Medium",
    tag: "Client",
    status: "In Progress",
    kind: "ongoing",
    flex: true,
  },
  {
    id: "t-internal-ce",
    name: "Studio ops, sales calls & admin",
    description: "Business development, prospect calls, invoicing, tooling and hiring.",
    projectId: "studio-internal",
    assignee: "ce",
    estimate: 0,
    factor: 1,
    start: d(2026, 3, 2),
    end: d(2026, 8, 31),
    priority: "Medium",
    tag: "Internal",
    status: "In Progress",
    kind: "ongoing",
    flex: true,
  },
  {
    id: "t-internal-tn",
    name: "Studio brand & internal design",
    description: "Studio website, proposals and internal design chores.",
    projectId: "studio-internal",
    assignee: "tn",
    estimate: 0,
    factor: 1,
    start: d(2026, 3, 2),
    end: d(2026, 8, 31),
    priority: "Low",
    tag: "Internal",
    status: "In Progress",
    kind: "ongoing",
    flex: true,
  },
  {
    id: "t-internal-ao",
    name: "Studio tooling & tech radar",
    description: "Internal tooling, CI upkeep and technical pre-sales support.",
    projectId: "studio-internal",
    assignee: "ao",
    estimate: 0,
    factor: 1,
    start: d(2026, 3, 2),
    end: d(2026, 8, 31),
    priority: "Low",
    tag: "Internal",
    status: "In Progress",
    kind: "ongoing",
    flex: true,
  },
];

/* ------------------------------------------------------------------ */
/* Time entry generation                                               */
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
  /** Revenue actually invoiceable given the project rate's effective-from date. */
  revenue: number;
};

const weeks: Date[] = (() => {
  const out: Date[] = [];
  let w = mondayOf(WINDOW_START); // Mon Feb 23 -> start at Mar 2
  if (w < WINDOW_START) w = addDays(w, 7);
  while (w <= WINDOW_END) {
    out.push(w);
    w = addDays(w, 7);
  }
  return out;
})();

const CURRENT_WEEK_KEY = iso(CURRENT_WEEK_START);
const LAST_FULL_WEEK_KEY = iso(addDays(CURRENT_WEEK_START, -7)); // Aug 24

/** Working days available in a given week (Mon..Fri offsets). */
function weekdaysOf(weekStart: Date): number[] {
  const key = iso(weekStart);
  if (key === CURRENT_WEEK_KEY) return [0]; // only Monday Aug 31 logged so far
  if (key === LAST_FULL_WEEK_KEY) return [0, 1, 2, 3]; // partial week Aug 24-27
  return [0, 1, 2, 3, 4];
}

/** Weekly capacity ratio per member per month — the workload story. */
const ratioByMonth: Record<string, Record<string, number>> = {
  ce: {
    "2026-03": 1.13,
    "2026-04": 0.88,
    "2026-05": 0.97,
    "2026-06": 0.9,
    "2026-07": 0.65,
    "2026-08": 0.95,
  },
  tn: {
    "2026-03": 1.26,
    "2026-04": 1.13,
    "2026-05": 1.2,
    "2026-06": 1.33,
    "2026-07": 1.1,
    "2026-08": 1.48,
  },
  ao: {
    "2026-03": 1.16,
    "2026-04": 1.0,
    "2026-05": 1.04,
    "2026-06": 1.15,
    "2026-07": 1.02,
    "2026-08": 1.2,
  },
};

/** Internal (non-billable) load multiplier per month — drives the margin trend. */
const internalBumpByMonth: Record<string, number> = {
  "2026-03": 0.55,
  "2026-04": 0.6,
  "2026-05": 1.9,
  "2026-06": 1.35,
  "2026-07": 1.65,
  "2026-08": 1.75,
};

/** Non-billable, untagged "general / misc" time — small but real and growing. */
const miscByMonth: Record<string, number> = {
  "2026-03": 0.5,
  "2026-04": 0.6,
  "2026-05": 0.75,
  "2026-06": 0.85,
  "2026-07": 1.0,
  "2026-08": 1.15,
};

const miscDescriptions = [
  "General — inbox and misc admin",
  "Misc — unsorted",
  "General — reading & research",
  "Misc — team sync",
];

const descriptionsFor = (task: TaskSeed) => {
  switch (task.kind) {
    case "integration":
      return [
        `${task.name} — provider docs & setup`,
        `${task.name} — debugging sandbox`,
        `${task.name} — call with third-party support`,
        `${task.name} — retry & error handling`,
        `${task.name} — sync with client's team`,
      ];
    case "feature":
      return [
        `${task.name} — implementation`,
        `${task.name} — states & edge cases`,
        `${task.name} — tests`,
        `${task.name} — review fixes`,
      ];
    case "design":
      return [
        `${task.name} — exploration`,
        `${task.name} — iteration`,
        `${task.name} — spec & handoff`,
        `${task.name} — review with client`,
      ];
    case "pm":
      return [
        `${task.name} — client call`,
        `${task.name} — notes & follow-ups`,
        `${task.name} — preparation`,
      ];
    default:
      return [task.name];
  }
};

/** hours planned per (task, week) for the non-flex tasks. */
const plannedTaskWeek = new Map<string, number>();
const plannedActual = new Map<string, number>();

for (const task of taskSeeds) {
  if (task.flex) continue;
  const actual = task.estimate * task.factor;
  // Weekdays of the task range that fall inside the data window.
  const perWeek = new Map<string, number>();
  let cursor = task.start;
  let totalDays = 0;
  while (cursor <= task.end) {
    const day = cursor.getUTCDay();
    const inWindow = cursor >= WINDOW_START && cursor <= WINDOW_END;
    if (day >= 1 && day <= 5 && inWindow) {
      const wk = iso(mondayOf(cursor));
      const available = weekdaysOf(mondayOf(cursor)).length;
      const offset = day - 1;
      if (offset < available) {
        perWeek.set(wk, (perWeek.get(wk) ?? 0) + 1);
        totalDays += 1;
      }
    }
    cursor = addDays(cursor, 1);
  }
  if (!totalDays) continue;
  let assigned = 0;
  const entriesList = [...perWeek.entries()];
  entriesList.forEach(([wk, days], i) => {
    const isLast = i === entriesList.length - 1;
    const raw = isLast ? actual - assigned : q(jitter((actual * days) / totalDays, 0.15));
    const hours = Math.max(0, q(raw));
    assigned += hours;
    plannedTaskWeek.set(`${task.id}|${wk}`, hours);
  });
  plannedActual.set(task.id, assigned);
}

const timeEntries: TimeEntry[] = [];
let entrySeq = 0;

function pushEntries(opts: {
  memberId: string;
  weekStart: Date;
  hours: number;
  task: TaskSeed | null;
  descriptions: string[];
  dayCursor: Map<string, number>;
  preferDays?: number[];
}) {
  const { memberId, weekStart, hours, task, descriptions, dayCursor } = opts;
  if (hours <= 0.05) return;
  const available = opts.preferDays ?? weekdaysOf(weekStart);
  if (!available.length) return;
  const chunks = Math.min(available.length, Math.max(1, Math.round(hours / 2.6)));
  const days = [...available].sort(() => rand() - 0.5).slice(0, chunks);
  let left = hours;
  days.forEach((dayOffset, i) => {
    const isLast = i === days.length - 1;
    const raw = isLast ? left : q(jitter(hours / days.length, 0.3));
    const dur = Math.max(0.25, Math.min(left, q(raw)));
    left = q(left - dur);
    if (dur <= 0) return;
    const date = addDays(weekStart, dayOffset);
    const key = `${memberId}|${iso(date)}`;
    const start = dayCursor.get(key) ?? 9 + Math.round(rand() * 2) * 0.25;
    const end = start + dur;
    dayCursor.set(key, end + 0.25);
    const seed = seedProject(task);
    const billable = Boolean(seed?.billableProject) && Boolean(task && task.kind !== "ongoing" ? true : seed?.billableProject);
    const covered =
      billable &&
      seed?.rate != null &&
      seed.rateEffectiveFrom != null &&
      date >= seed.rateEffectiveFrom;
    timeEntries.push({
      id: `e${++entrySeq}`,
      date: iso(date),
      start,
      end,
      duration: dur,
      description: descriptions[Math.floor(rand() * descriptions.length)] ?? "Work",
      memberId,
      taskId: task ? task.id : null,
      projectId: seed ? seed.id : null,
      tag: task ? task.tag : null,
      billable,
      revenue: covered ? dur * (seed!.rate as number) : 0,
    });
  });
}

function seedProject(task: TaskSeed | null) {
  if (!task) return null;
  return seedById(task.projectId);
}

const dayCursor = new Map<string, number>();

for (const weekStart of weeks) {
  const mk = monthKey(weekStart);
  const availableDays = weekdaysOf(weekStart).length;
  const dayFactor = availableDays / 5;

  for (const member of teamMembers) {
    // 1. story tasks planned this week
    const memberTasks = taskSeeds.filter((t) => t.assignee === member.id);
    let plannedTotal = 0;
    for (const task of memberTasks) {
      if (task.flex) continue;
      const hours = plannedTaskWeek.get(`${task.id}|${iso(weekStart)}`) ?? 0;
      if (hours > 0) {
        plannedTotal += hours;
        pushEntries({
          memberId: member.id,
          weekStart,
          hours,
          task,
          descriptions: descriptionsFor(task),
          dayCursor,
        });
      }
    }

    // 2. target for the week
    const ratio = ratioByMonth[member.id]?.[mk] ?? 1;
    const target = q(jitter(member.capacity * ratio * dayFactor, 0.06));

    // 3. internal (non-billable) studio time
    const internalShare = member.id === "ce" ? 0.2 : 0.06;
    const internalBump = internalBumpByMonth[mk] ?? 1;
    const internalHours = q(
      Math.min(target * 0.5, jitter(target * internalShare * internalBump, 0.25)),
    );
    const internalTask = taskSeeds.find(
      (t) => t.projectId === "studio-internal" && t.assignee === member.id,
    )!;
    pushEntries({
      memberId: member.id,
      weekStart,
      hours: internalHours,
      task: internalTask,
      descriptions: [
        "Business development & prospect calls",
        "Studio admin & invoicing",
        "Internal tooling",
        "Team planning",
      ],
      dayCursor,
    });

    // 4. a little untagged "general / misc" time, growing over the months
    if (rand() > 0.35) {
      const miscHours = q(Math.max(0.25, jitter(miscByMonth[mk] ?? 0.5, 0.4)) * dayFactor);
      pushEntries({
        memberId: member.id,
        weekStart,
        hours: miscHours,
        task: null,
        descriptions: miscDescriptions,
        dayCursor,
      });
      plannedTotal += miscHours;
    }

    // 5. remaining capacity goes to the ongoing client buckets
    const remaining = q(target - plannedTotal - internalHours);
    if (remaining > 0.25) {
      const flex = memberTasks.filter(
        (t) =>
          t.flex &&
          t.projectId !== "studio-internal" &&
          weekStart >= mondayOf(t.start) &&
          weekStart <= t.end,
      );
      if (flex.length) {
        const weights = flex.map((t) =>
          t.projectId === "verdant-redesign" ? 0.55 : 0.45,
        );
        const sum = weights.reduce((s, v) => s + v, 0);
        flex.forEach((task, i) => {
          const hours = q((remaining * (weights[i] ?? 1)) / sum);
          pushEntries({
            memberId: member.id,
            weekStart,
            hours,
            task,
            descriptions: descriptionsFor(task).concat([task.name]),
            dayCursor,
          });
        });
      }
    }
  }
}

timeEntries.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : a.start - b.start));

export { timeEntries };

/* ------------------------------------------------------------------ */
/* Derived: tasks                                                      */
/* ------------------------------------------------------------------ */

const trackedByTask = new Map<string, number>();
const entriesByTask = new Map<string, number>();
for (const e of timeEntries) {
  if (!e.taskId) continue;
  trackedByTask.set(e.taskId, (trackedByTask.get(e.taskId) ?? 0) + e.duration);
  entriesByTask.set(e.taskId, (entriesByTask.get(e.taskId) ?? 0) + 1);
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
  estimateHours: number;
  estimate: string;
  tracked: number;
  /** tracked - estimate, in hours (positive = over estimate). */
  delta: number;
  /** tracked / estimate (1 = on target). */
  ratio: number;
  priority: Priority;
  tag: string | null;
  status: TaskStatus;
  billable: boolean;
  kind: TaskKind;
};

export const tasks: Task[] = taskSeeds.map((t) => {
  const tracked = q(trackedByTask.get(t.id) ?? 0);
  // Ongoing buckets are re-estimated from their real load (they look on target).
  const estimateHours = t.flex ? q(Math.max(1, tracked / 1.03)) : t.estimate;
  const seed = seedById(t.projectId);
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
    estimateHours,
    estimate: formatHours(estimateHours),
    tracked,
    delta: q(tracked - estimateHours),
    ratio: estimateHours ? tracked / estimateHours : 0,
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

export const clients = ["Verdant Health", "Halyard Finance"];

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

const monthKeys = ["2026-03", "2026-04", "2026-05", "2026-06", "2026-07", "2026-08"];
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

export type MemberWeek = {
  memberId: string;
  weekStart: string;
  tracked: number;
  billable: number;
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
    const weeksInMonth = memberWeeks.filter(
      (w) => w.memberId === m.id && w.weekStart.startsWith(key),
    ).length;
    const capacity = m.capacity * Math.max(weeksInMonth, 1);
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

/** Members table rows (shape kept from the previous dataset). */
export const members = memberStats.map((m) => ({
  name: m.name,
  initials: m.initials,
  email: m.email,
  role: m.id === "ce" ? "Administrator" : "Member",
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
  lane?: 0 | 1;
};

export const calendarEvents: CalendarEvent[] = timeEntries
  .filter(
    (e) => e.memberId === currentUser.id && e.date >= weekFrom && e.date <= weekTo,
  )
  .map((e) => {
    const project = e.projectId ? projectById(e.projectId) : null;
    const day = Math.round(
      (Date.parse(e.date) - CURRENT_WEEK_START.getTime()) / (24 * 3600 * 1000),
    );
    return {
      id: e.id,
      day,
      start: e.start,
      end: e.end,
      title: e.description,
      ...(project ? { subtitle: project.name } : {}),
      duration: formatHours(e.duration),
      color: project?.color ?? "pink",
      billable: e.billable,
    };
  });

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

export const workloadTarget = 7; // daily target for a 35h week (current user)

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
  uncoveredProjects: [...new Set(uncoveredEntries.map((e) => projectById(e.projectId!)!.name))],
  nonBillableProjects: projects.filter((p) => !p.billableProject).map((p) => p.name),
  months: monthlyStats,
};

export const utilization = {
  billableShare: Math.round((totalBillable / totalTracked) * 100),
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

const augStats = monthlyStats.find((m) => m.key === "2026-08")!;
const aprStats = monthlyStats.find((m) => m.key === "2026-04")!;

export const askConversation = [
  {
    role: "user" as const,
    text: "How is Studio North doing this month compared to the start of the engagement?",
  },
  {
    role: "assistant" as const,
    text: `In August the studio tracked ${formatHours(augStats.tracked)} across three client projects and internal work, for ${money(
      augStats.revenue,
    )} of invoiceable revenue.`,
    table: {
      head: ["Month", "Tracked", "Revenue", "Contribution margin"],
      rows: [
        [
          aprStats.label,
          formatHours(aprStats.tracked),
          money(aprStats.revenue),
          money(aprStats.margin),
        ],
        ...monthlyStats
          .filter((m) => ["2026-05", "2026-06", "2026-07", "2026-08"].includes(m.key))
          .map((m) => [
            m.label,
            formatHours(m.tracked),
            money(m.revenue),
            money(m.margin),
          ]),
      ],
    },
    takeaways: [
      `${formatHours(uncoveredHours)} of billable time carries no revenue because a project rate was activated after the work happened.`,
      `Billable share across the workspace is ${utilization.billableShare} %, against a ${utilization.target} % target.`,
    ],
    actions: [
      "Review Halyard Finance — Onboarding Flow rate history",
      "Compare weekly load per member",
    ],
  },
];
