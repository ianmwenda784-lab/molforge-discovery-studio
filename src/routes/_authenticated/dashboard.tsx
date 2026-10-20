import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { FolderKanban, Plus, Target } from "lucide-react";
import { dashboardQuery, auditQuery } from "@/lib/data";
import { PageHeader, EmptyState, RdkitBanner } from "@/components/molforge/common";
import { ProjectFormDialog } from "@/components/molforge/ProjectFormDialog";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Overview — MolForge AI" }, { name: "description", content: "Workspace overview." }, { property: "og:title", content: "Overview — MolForge AI" }, { property: "og:description", content: "Workspace overview." }] }),
  component: Dashboard,
});

function Dashboard() {
  const { data } = useQuery(dashboardQuery);
  const { data: audit } = useQuery(auditQuery());
  const stats = data ? [["Projects", data.projects], ["Compounds", data.compounds], ["RDKit calculated", data.calculated], ["Not calculated", data.uncalculated], ["Invalid", data.invalid], ["Datasets", data.datasets], ["Assay values (exp.)", data.assays], ["Jobs", data.totalJobs]] : [];
  return (
    <div>
      <PageHeader title="Overview" subtitle="All figures are counted from your saved records."
        actions={<><ProjectFormDialog trigger={<Button variant="brand"><Plus /> Create Project</Button>} /><Button asChild variant="outline"><Link to="/lead-optimization"><Target /> Start Lead Optimization</Link></Button></>} />
      <RdkitBanner />
      {data && data.projects === 0 ? (
        <EmptyState icon={FolderKanban} title="No projects yet">Create your first project to start building a compound library.</EmptyState>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {stats.map(([l, v]) => <div key={l as string} className="rounded-lg border bg-card p-4"><p className="text-xs text-muted-foreground">{l}</p><p className="mt-1 font-mono text-2xl">{v}</p></div>)}
          </div>
          <h2 className="mt-8 mb-2 text-sm font-medium">Recent activity</h2>
          <div className="rounded-lg border bg-card text-sm">
            {(audit ?? []).length === 0 ? <p className="p-4 text-muted-foreground">No activity yet.</p> : audit!.map((a) => (
              <div key={a.id} className="flex justify-between border-b p-3 last:border-0"><span className="font-mono text-xs">{a.action}</span><span className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleString()}</span></div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
