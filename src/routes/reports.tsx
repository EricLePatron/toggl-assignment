import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  BarChart3,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  Plus,
  Settings,
  TriangleAlert,
  Wallet,
} from "lucide-react";
import {
  profitability,
  projects,
  timeLogs,
  totals,
  utilization,
  weekSummary,
  workloadDays,
  workloadTarget,
  projectColorClass,
} from "@/data/fixtures";
import { Card, Stat, Tabs } from "@/components/app/primitives";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Reports — Focus Replica" },
      {
        name: "description",
        content:
          "Time reports: summary, utilization, workload, profitability, time logs and time off.",
      },
      { property: "og:title", content: "Reports — Focus Replica" },
      {
        property: "og:description",
        content: "Summary, workload and profitability on mock data.",
      },
    ],
  }),
  component: ReportsScreen,
});

const TABS = [
  "Summary",
  "Utilization",
  "Workload",
  "Profitability",
  "Time logs",
  "Time off",
];

function ReportsScreen() {
  const [tab, setTab] = useState<string>("Summary");

  return (
    <div className="pb-12">
      <div className="flex items-center gap-3 px-7 pb-3 pt-5">
        <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
        <button className="pill ml-auto">
          <Download className="size-3.5" />
          Export
          <ChevronDown className="size-3.5 text-muted-foreground" />
        </button>
      </div>

      <Tabs tabs={TABS} value={tab} onChange={setTab} />

      <div className="flex flex-wrap items-center gap-2 px-7 py-3">
        <button className="pill">
          <BarChart3 className="size-3.5 text-muted-foreground" />
          {tab}
          <ChevronDown className="size-3.5 text-muted-foreground" />
        </button>
        <div className="flex items-center gap-1">
          <button className="pill size-8 justify-center !px-0">
            <ChevronLeft className="size-4" />
          </button>
          <button className="pill">
            <CalendarDays className="size-3.5 text-muted-foreground" />
            {weekSummary.rangeLabel}
          </button>
          <button className="pill size-8 justify-center !px-0">
            <ChevronRight className="size-4" />
          </button>
        </div>
        <button className="pill">
          <Filter className="size-3.5 text-muted-foreground" />
          Filters
        </button>
        <button className="pill">Today</button>
        <button className="pill">
          <Plus className="size-3.5" />
          Filter
        </button>
        <div className="ml-auto flex items-center gap-2">
          <button className="pill">
            <Wallet className="size-3.5 text-muted-foreground" />
            Displayed in USD
            <ChevronDown className="size-3.5 text-muted-foreground" />
          </button>
          <button className="text-muted-foreground transition-colors hover:text-foreground">
            <Settings className="size-4" />
          </button>
        </div>
      </div>

      <div className="space-y-5 px-7">
        {tab === "Summary" && <SummaryTab />}
        {tab === "Utilization" && <UtilizationTab />}
        {tab === "Workload" && <WorkloadTab />}
        {tab === "Profitability" && <ProfitabilityTab />}
        {tab === "Time logs" && <TimeLogsTab />}
        {tab === "Time off" && <TimeOffTab />}
      </div>
    </div>
  );
}

function StatRow({ items }: { items: { label: string; value: string; hint?: string }[] }) {
  return (
    <div className="panel flex divide-x divide-border">
      {items.map((i) => (
        <Stat key={i.label} {...i} />
      ))}
    </div>
  );
}

function SummaryTab() {
  return (
    <>
      <StatRow
        items={[
          { label: "Tracked time", value: weekSummary.tracked },
          { label: "Billable time", value: weekSummary.billableShare },
          { label: "Amount", value: weekSummary.amount },
          { label: "Average hours per day", value: totals.avgPerDay },
        ]}
      />
      <Card>
        <h2 className="pb-6 text-base font-semibold">Billable vs non-billable time</h2>
        <BarChart />
        <div className="flex items-center justify-center gap-6 pt-16 text-xs text-muted-foreground">
          <span className="flex items-center gap-2">
            <span className="size-2.5 rounded-[3px] bg-accent" /> Billable
          </span>
          <span className="flex items-center gap-2">
            <span className="size-2.5 rounded-[3px] bg-accent-pink/50" /> Non-billable
          </span>
        </div>
      </Card>
      <Card className="p-0">
        <div className="flex items-center px-5 py-4">
          <h2 className="text-base font-semibold">Member and task breakdown</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-y border-border">
              <th className="label-caps px-5 py-2.5 text-left">Project</th>
              <th className="label-caps px-5 py-2.5 text-left">Client</th>
              <th className="label-caps px-5 py-2.5 text-right">Tracked time</th>
              <th className="label-caps px-5 py-2.5 text-right">Entries</th>
              <th className="label-caps px-5 py-2.5 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr key={p.id} className="border-b border-border/60">
                <td className="px-5 py-3">
                  <span className="inline-flex items-center gap-2">
                    <span
                      className={cn("size-2.5 rounded-[3px]", projectColorClass[p.color])}
                    />
                    {p.name}
                  </span>
                </td>
                <td className="px-5 py-3 text-muted-foreground">{p.client ?? "—"}</td>
                <td className="tnum px-5 py-3 text-right">{formatH(p.tracked)}</td>
                <td className="tnum px-5 py-3 text-right text-muted-foreground">
                  {p.entries}
                </td>
                <td className="tnum px-5 py-3 text-right">
                  {p.rate ? `${(p.rate * p.billable).toFixed(2)} USD` : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}

function BarChart({ showTarget = false }: { showTarget?: boolean }) {
  const max = 5;
  return (
    <div className="relative h-64">
      {[5, 4, 3, 2, 1, 0].map((v) => (
        <div
          key={v}
          className="absolute inset-x-0 flex items-center gap-3"
          style={{ bottom: `${(v / max) * 100}%` }}
        >
          <span className="tnum w-6 shrink-0 text-xs text-subtle">{v}h</span>
          <span className="h-px flex-1 border-t border-dashed border-border" />
        </div>
      ))}
      {showTarget && (
        <div
          className="absolute inset-x-9 border-t-2 border-warning"
          style={{ bottom: `${(workloadTarget / 10) * 100}%` }}
        />
      )}
      <div className="absolute inset-y-0 left-9 right-0 flex items-end gap-6">
        {workloadDays.map((d) => (
          <div key={d.date} className="flex flex-1 flex-col items-center gap-2">
            <span className="tnum text-xs text-muted-foreground">{formatH(d.tracked)}</span>
            <div
              className={cn(
                "w-full rounded-t-sm",
                d.tracked > 3 ? "bg-accent" : "bg-accent-pink/50",
              )}
              style={{ height: `${(d.tracked / max) * 210}px` }}
            />
          </div>
        ))}
      </div>
      <div className="absolute -bottom-12 left-9 right-0 flex gap-6">
        {workloadDays.map((d) => (
          <div key={d.date} className="flex-1 text-center text-xs text-muted-foreground">
            <div>{d.label}</div>
            <div className="tnum">{d.date}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WorkloadTab() {
  return (
    <>
      <Card>
        <div className="flex items-center gap-2 pb-6">
          <h2 className="text-base font-semibold">Am I overworked?</h2>
          <span className="pill !py-1 text-xs">Target: 8h / day</span>
        </div>
        <BarChart showTarget />
        <div className="flex items-center justify-center gap-6 pt-16 text-xs text-muted-foreground">
          <span className="flex items-center gap-2">
            <span className="h-0.5 w-4 bg-warning" /> Target working hours
          </span>
          <span className="flex items-center gap-2">
            <span className="size-2.5 rounded-[3px] bg-accent" /> Tracked time
          </span>
        </div>
      </Card>
      <StatRow
        items={[
          { label: "Tracked time", value: weekSummary.tracked },
          { label: "Weekly capacity", value: "40h" },
          { label: "Gap", value: "-29h 45m", hint: "under capacity" },
          { label: "Average hours per day", value: totals.avgPerDay },
        ]}
      />
    </>
  );
}

function ProfitabilityTab() {
  return (
    <>
      <StatRow
        items={[
          { label: "Revenue", value: profitability.revenue },
          { label: "Cost", value: profitability.cost },
          { label: "Profit", value: profitability.profit },
          { label: "Margin", value: profitability.margin, hint: "40 % target" },
        ]}
      />
      <Card className="border-warning/40">
        <div className="flex gap-3">
          <TriangleAlert className="size-5 shrink-0 text-warning" />
          <div className="text-sm">
            <div className="font-semibold">Missing data</div>
            <ul className="list-disc space-y-1 pl-5 pt-2 text-muted-foreground">
              <li>
                Members with no cost rate : {profitability.missingCostRates.join(", ")}
              </li>
              <li>
                Billable projects with no active rate :{" "}
                {profitability.missingProjectRates.join(", ")}
              </li>
            </ul>
          </div>
        </div>
      </Card>
      <Card className="p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="label-caps px-5 py-2.5 text-left">Project</th>
              <th className="label-caps px-5 py-2.5 text-right">Rate</th>
              <th className="label-caps px-5 py-2.5 text-right">Billable</th>
              <th className="label-caps px-5 py-2.5 text-right">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr key={p.id} className="border-b border-border/60 last:border-0">
                <td className="px-5 py-3">{p.name}</td>
                <td className="tnum px-5 py-3 text-right text-muted-foreground">
                  {p.rate ? `${p.rate} USD` : "—"}
                </td>
                <td className="tnum px-5 py-3 text-right">{formatH(p.billable)}</td>
                <td className="tnum px-5 py-3 text-right">
                  {p.rate ? `${(p.rate * p.billable).toFixed(2)} USD` : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}

function UtilizationTab() {
  return (
    <>
      <StatRow
        items={[
          { label: "Utilization rate", value: `${utilization.billableShare} %` },
          { label: "Target", value: `${utilization.target} %` },
          { label: "Billable time", value: formatH(totals.billable) },
          { label: "Tracked time", value: formatH(totals.tracked) },
        ]}
      />
      <Card className="p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="label-caps px-5 py-2.5 text-left">Member</th>
              <th className="label-caps px-5 py-2.5 text-right">Tracked time</th>
              <th className="label-caps px-5 py-2.5 text-right">Billable</th>
              <th className="label-caps px-5 py-2.5 text-right">Utilization</th>
            </tr>
          </thead>
          <tbody>
            {utilization.rows.map((r) => (
              <tr key={r.member} className="border-b border-border/60 last:border-0">
                <td className="px-5 py-3">{r.member}</td>
                <td className="tnum px-5 py-3 text-right">{r.tracked}</td>
                <td className="tnum px-5 py-3 text-right">{r.billable}</td>
                <td className="tnum px-5 py-3 text-right">{r.util}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}

function TimeLogsTab() {
  return (
    <Card className="p-0">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="label-caps px-5 py-2.5 text-left">Date</th>
            <th className="label-caps px-5 py-2.5 text-left">Description</th>
            <th className="label-caps px-5 py-2.5 text-left">Project</th>
            <th className="label-caps px-5 py-2.5 text-right">Duration</th>
            <th className="label-caps px-5 py-2.5 text-right">Billable</th>
          </tr>
        </thead>
        <tbody>
          {timeLogs.map((l, i) => (
            <tr key={i} className="border-b border-border/60 last:border-0">
              <td className="tnum px-5 py-3 text-muted-foreground">{l.date}</td>
              <td className="px-5 py-3">{l.description}</td>
              <td className="px-5 py-3 text-muted-foreground">{l.project}</td>
              <td className="tnum px-5 py-3 text-right">{l.duration}</td>
              <td className="px-5 py-3 text-right">
                {l.billable ? (
                  <span className="text-positive">$</span>
                ) : (
                  <span className="text-subtle">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

function TimeOffTab() {
  return (
    <>
      <StatRow
        items={[
          { label: "Time off days taken", value: "0" },
          { label: "Planned days", value: "0" },
          { label: "Balance", value: "—" },
          { label: "Tracked members", value: "1" },
        ]}
      />
      <Card>
        <p className="py-10 text-center text-sm text-muted-foreground">
          No time off recorded for the selected period.
        </p>
      </Card>
    </>
  );
}

function formatH(h: number) {
  const hours = Math.floor(h);
  const min = Math.round((h - hours) * 60);
  return min ? `${hours}h ${min}m` : `${hours}h`;
}
