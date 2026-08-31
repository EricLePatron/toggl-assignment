import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { projectColorClass, type ProjectColor, type TaskStatus } from "@/data/fixtures";

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 px-7 pb-2 pt-5">
      <div className="min-w-0">
        <h1 className="truncate text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="pt-0.5 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="ml-auto flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Toolbar({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center gap-2 px-7 py-3">{children}</div>;
}

export function Pill({
  children,
  className,
  active,
}: {
  children: ReactNode;
  className?: string;
  active?: boolean;
}) {
  return (
    <button
      className={cn(
        "pill",
        active && "border-accent/60 bg-accent/15 text-foreground",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function PrimaryButton({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      className={cn(
        "grad-accent inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("panel p-5", className)}>{children}</div>;
}

export function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="flex-1 px-5 py-4">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="tnum pt-1 text-2xl font-semibold">{value}</div>
      {hint && <div className="pt-0.5 text-xs text-subtle">{hint}</div>}
    </div>
  );
}

export function ProjectChip({
  name,
  color,
}: {
  name: string;
  color: ProjectColor;
}) {
  return (
    <span className="inline-flex items-center gap-2 text-sm">
      <span className={cn("size-2.5 rounded-[3px]", projectColorClass[color])} />
      <span className="truncate">{name}</span>
    </span>
  );
}

const statusStyle: Record<TaskStatus, string> = {
  Todo: "text-muted-foreground",
  "In Progress": "text-warning",
  Blocked: "text-destructive",
  Done: "text-positive",
};

export function StatusBadge({ status }: { status: TaskStatus }) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-sm", statusStyle[status])}>
      <span className="size-2 rounded-full bg-current" />
      {status}
    </span>
  );
}

export function Tabs({
  tabs,
  value,
  onChange,
}: {
  tabs: string[];
  value: string;
  onChange: (t: string) => void;
}) {
  return (
    <div className="flex items-center gap-1 border-b border-border px-7">
      {tabs.map((t) => (
        <button
          key={t}
          onClick={() => onChange(t)}
          className={cn(
            "relative px-3 py-2.5 text-sm transition-colors",
            value === t
              ? "font-semibold text-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {t}
          {value === t && (
            <span className="grad-accent absolute inset-x-2 -bottom-px h-0.5 rounded-full" />
          )}
        </button>
      ))}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
      {icon && <div className="pb-4 text-subtle">{icon}</div>}
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="max-w-md pt-2 text-sm text-muted-foreground">{description}</p>
      {action && <div className="pt-5">{action}</div>}
    </div>
  );
}
