import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { FolderKanban, Plus } from "lucide-react";
import { projectsQuery } from "@/lib/data";
import { PageHeader, EmptyState } from "@/components/molforge/common";
import { ProjectFormDialog } from "@/components/molforge/ProjectFormDialog";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/projects/")({
  head: () => ({ meta: [{ title: "Projects — MolForge AI" }, { name: "description", content: "Your projects." }, { property: "og:title", content: "Projects — MolForge AI" }, { property: "og:description", content: "Your projects." }] }),
  component: Projects,
});

function Projects() {
  const { data } = useQuery(projectsQuery);
  return (
    <div>
      <PageHeader title="Projects" actions={<ProjectFormDialog trigger={<Button variant="brand"><Plus /> Create Project</Button>} />} />
      {data && data.length === 0 ? <EmptyState icon={FolderKanban} title="No projects yet" /> : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {(data ?? []).map((p) => (
            <Link key={p.id} to="/projects/$projectId" params={{ projectId: p.id }} className="rounded-lg border bg-card p-4 hover:border-primary">
              <p className="font-medium">{p.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">{p.ligand_only ? "Ligand-only" : p.target_name ?? "No target"}{p.pdb_id ? ` · ${p.pdb_id}` : ""}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
