import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Upload } from "lucide-react";
import { projectQuery, compoundsQuery, fmt } from "@/lib/data";
import { PageHeader, RdkitBanner, StatusBadge } from "@/components/molforge/common";
import { ImportDialog } from "@/components/molforge/ImportDialog";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/projects/$projectId")({
  head: () => ({ meta: [{ title: "Project — MolForge AI" }, { name: "description", content: "Project compound library." }, { property: "og:title", content: "Project — MolForge AI" }, { property: "og:description", content: "Project compound library." }] }),
  component: ProjectPage,
});

function ProjectPage() {
  const { projectId } = Route.useParams();
  const { data: p } = useQuery(projectQuery(projectId));
  const { data: cs } = useQuery(compoundsQuery(projectId));
  if (!p) return <p className="text-muted-foreground">Loading…</p>;
  return (
    <div>
      <PageHeader title={p.name} subtitle={p.research_objective ?? undefined} actions={<ImportDialog projectId={projectId} trigger={<Button variant="brand"><Upload /> Import compounds</Button>} />} />
      <RdkitBanner />
      <div className="overflow-x-auto rounded-lg border bg-card">
        <table className="w-full text-xs">
          <thead className="text-left text-muted-foreground"><tr>{["Name", "Canonical SMILES (computed)", "Formula", "MW", "cLogP", "HBD", "HBA", "TPSA", "Status", "Source"].map((h) => <th key={h} className="p-2">{h}</th>)}</tr></thead>
          <tbody>
            {(cs ?? []).map((c) => (
              <tr key={c.id} className="border-t">
                <td className="p-2">{c.name ?? "—"}</td>
                <td className="max-w-64 truncate p-2 font-mono" title={c.canonical_smiles ?? c.original_input}>{c.canonical_smiles ?? <span className="text-muted-foreground">input: {c.original_input.split("\n")[0]}</span>}</td>
                <td className="p-2 font-mono">{c.formula ?? "—"}</td>
                <td className="p-2 font-mono">{fmt(c.mw)}</td><td className="p-2 font-mono">{fmt(c.clogp)}</td>
                <td className="p-2 font-mono">{c.hbd ?? "—"}</td><td className="p-2 font-mono">{c.hba ?? "—"}</td><td className="p-2 font-mono">{fmt(c.tpsa)}</td>
                <td className="p-2" title={c.calculation_error ?? ""}><StatusBadge status={c.calculation_status} /></td>
                <td className="p-2 text-muted-foreground">{c.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {cs?.length === 0 && <p className="p-6 text-center text-sm text-muted-foreground">No compounds yet. Import SMILES, CSV or SDF.</p>}
      </div>
    </div>
  );
}
