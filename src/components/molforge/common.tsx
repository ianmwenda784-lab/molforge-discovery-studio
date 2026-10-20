import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { AlertTriangle, CheckCircle2, PlugZap, type LucideIcon } from "lucide-react";
import { getRdkitStatus } from "@/lib/rdkit.functions";
import { cn } from "@/lib/utils";

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, children, action }: { icon: LucideIcon; title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-lg border border-dashed bg-card/40 px-6 py-14 text-center">
      <Icon className="size-8 text-muted-foreground" />
      <h3 className="mt-3 font-medium">{title}</h3>
      {children && <div className="mt-1 max-w-md text-sm text-muted-foreground">{children}</div>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function useRdkitStatus() {
  const fn = useServerFn(getRdkitStatus);
  return useQuery({ queryKey: ["rdkit-status"], queryFn: () => fn(), staleTime: 60_000, retry: false });
}

export function RdkitBanner({ compact }: { compact?: boolean }) {
  const { data, isLoading } = useRdkitStatus();
  if (isLoading || !data) return <div className="mb-4 h-10 animate-pulse rounded-md bg-muted" />;
  if (data.state === "ok") {
    if (compact) return null;
    return (
      <div className="mb-4 flex items-center gap-2 rounded-md border border-success/30 bg-success/10 px-3 py-2 text-sm">
        <CheckCircle2 className="size-4 text-success" /> RDKit service connected · RDKit {data.rdkitVersion}
      </div>
    );
  }
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2 rounded-md border border-warning/30 bg-warning/10 px-3 py-2 text-sm">
      <AlertTriangle className="size-4 text-warning" />
      <span className="flex-1">
        {data.state === "not_configured"
          ? "RDKit service not configured. Structures are stored with their original input but no descriptors are calculated."
          : `RDKit service unreachable (${data.error}). New imports will be stored as uncalculated.`}
      </span>
      <Link to="/settings" className="font-medium text-cyan hover:underline">Set up RDKit →</Link>
    </div>
  );
}

const statusStyles: Record<string, string> = {
  calculated: "border-success/30 bg-success/10 text-success",
  invalid: "border-destructive/40 bg-destructive/10 text-destructive",
  service_unavailable: "border-warning/30 bg-warning/10 text-warning",
  pending: "border-border bg-muted text-muted-foreground",
  error: "border-destructive/40 bg-destructive/10 text-destructive",
};
const statusLabel: Record<string, string> = {
  calculated: "RDKit calculated",
  invalid: "Invalid structure",
  service_unavailable: "Not calculated",
  pending: "Pending",
  error: "Error",
};
export function StatusBadge({ status }: { status: string }) {
  return <span className={cn("inline-flex whitespace-nowrap rounded border px-1.5 py-0.5 text-[11px] font-medium", statusStyles[status])}>{statusLabel[status] ?? status}</span>;
}

export function ModuleUnavailable({ title, description, requires }: { title: string; description: string; requires: string[] }) {
  return (
    <div>
      <PageHeader title={title} subtitle={description} />
      <EmptyState icon={PlugZap} title="Not available yet — needs an integration">
        <p>This module isn't in the current release. To turn it on, MolForge needs:</p>
        <ul className="mt-3 space-y-1 text-left">
          {requires.map((r) => <li key={r} className="flex gap-2"><span className="text-cyan">•</span>{r}</li>)}
        </ul>
        <p className="mt-3">No jobs or results are created or shown until a real backend is connected.</p>
      </EmptyState>
    </div>
  );
}
