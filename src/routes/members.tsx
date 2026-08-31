import { createFileRoute } from "@tanstack/react-router";
import { ChevronDown, Filter, Plus, Search, Settings } from "lucide-react";
import { members } from "@/data/fixtures";
import { Card, PrimaryButton } from "@/components/app/primitives";

export const Route = createFileRoute("/members")({
  head: () => ({
    meta: [
      { title: "Members — Focus Replica" },
      {
        name: "description",
        content: "Workspace member list with role, groups and status.",
      },
      { property: "og:title", content: "Members — Focus Replica" },
      {
        property: "og:description",
        content: "Workspace members and their roles.",
      },
    ],
  }),
  component: MembersScreen,
});

function MembersScreen() {
  return (
    <div className="pb-12">
      <div className="flex items-center gap-3 px-7 pb-3 pt-5">
        <h1 className="text-2xl font-semibold tracking-tight">Members</h1>
        <PrimaryButton className="ml-auto">
          <Plus className="size-4" />
          Invite members
        </PrimaryButton>
      </div>

      <div className="flex flex-wrap items-center gap-2 px-7 py-3">
        <button className="pill">
          Active
          <ChevronDown className="size-3.5 text-muted-foreground" />
        </button>
        <button className="pill">
          <Filter className="size-3.5 text-muted-foreground" />
          Filters
        </button>
        <div className="ml-auto flex items-center gap-3 text-muted-foreground">
          <Search className="size-4" />
          <Settings className="size-4" />
        </div>
      </div>

      <div className="px-7">
        <Card className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="label-caps px-5 py-2.5 text-left">Name</th>
                <th className="label-caps px-5 py-2.5 text-left">Email</th>
                <th className="label-caps px-5 py-2.5 text-left">Role</th>
                <th className="label-caps px-5 py-2.5 text-left">Groups</th>
                <th className="label-caps px-5 py-2.5 text-right">Cost rate</th>
                <th className="label-caps px-5 py-2.5 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.email} className="border-b border-border/60 last:border-0">
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center gap-3">
                      <span className="flex size-7 items-center justify-center rounded-full bg-surface-2 text-[11px]">
                        {m.initials}
                      </span>
                      {m.name}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">{m.email}</td>
                  <td className="px-5 py-3.5">{m.role}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{m.groups}</td>
                  <td className="tnum px-5 py-3.5 text-right text-muted-foreground">
                    {m.rate}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center gap-2 text-positive">
                      <span className="size-2 rounded-full bg-current" />
                      {m.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
