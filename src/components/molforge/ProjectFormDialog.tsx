import { useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { logAudit, type Project } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";

const list = (s: string) => s.split(/[,\n]/).map((x) => x.trim()).filter(Boolean);
const num = (s: string) => (s.trim() === "" ? undefined : Number(s));

export function ProjectFormDialog({ trigger, project }: { trigger: ReactNode; project?: Project }) {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const hc = (project?.hard_constraints ?? {}) as Record<string, number | undefined>;
  const [f, setF] = useState({
    name: project?.name ?? "",
    research_objective: project?.research_objective ?? "",
    target_name: project?.target_name ?? "",
    pdb_id: project?.pdb_id ?? "",
    organism: project?.organism ?? "",
    ligand_only: project?.ligand_only ?? false,
    starting_compound_name: project?.starting_compound_name ?? "",
    starting_smiles: project?.starting_smiles ?? "",
    endpoint_name: project?.endpoint_name ?? "",
    endpoint_units: project?.endpoint_units ?? "",
    assay_type: project?.assay_type ?? "",
    objectives: (project?.optimization_objectives ?? []).join(", "),
    tools: (project?.preferred_tools ?? []).join(", "),
    mw_max: hc.mw_max?.toString() ?? "",
    clogp_max: hc.clogp_max?.toString() ?? "",
    tpsa_max: hc.tpsa_max?.toString() ?? "",
    hbd_max: hc.hbd_max?.toString() ?? "",
  });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const constraints = Object.fromEntries(
      (["mw_max", "clogp_max", "tpsa_max", "hbd_max"] as const).map((k) => [k, num(f[k])]).filter(([, v]) => v !== undefined && !Number.isNaN(v)),
    );
    const payload = {
      name: f.name.trim(),
      research_objective: f.research_objective || null,
      target_name: f.ligand_only ? null : f.target_name || null,
      pdb_id: f.ligand_only ? null : f.pdb_id.trim().toUpperCase() || null,
      organism: f.organism || null,
      ligand_only: f.ligand_only,
      starting_compound_name: f.starting_compound_name || null,
      starting_smiles: f.starting_smiles.trim() || null,
      endpoint_name: f.endpoint_name || null,
      endpoint_units: f.endpoint_units || null,
      assay_type: f.assay_type || null,
      optimization_objectives: list(f.objectives),
      preferred_tools: list(f.tools),
      hard_constraints: constraints,
    };
    setBusy(true);
    try {
      if (project) {
        const { error } = await supabase.from("projects").update(payload).eq("id", project.id);
        if (error) throw error;
        await logAudit({ project_id: project.id, entity_type: "project", entity_id: project.id, action: "project.updated" });
        toast.success("Project updated");
      } else {
        const { data: u } = await supabase.auth.getUser();
        const { data, error } = await supabase.from("projects").insert({ ...payload, user_id: u.user!.id }).select("id").single();
        if (error) throw error;
        if (payload.target_name) {
          await supabase.from("targets").insert({ user_id: u.user!.id, project_id: data.id, name: payload.target_name, pdb_id: payload.pdb_id, organism: payload.organism });
        }
        await logAudit({ project_id: data.id, entity_type: "project", entity_id: data.id, action: "project.created", details: { name: payload.name } });
        toast.success("Project created");
        navigate({ to: "/projects/$projectId", params: { projectId: data.id } });
      }
      qc.invalidateQueries();
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{project ? "Edit project" : "Create project"}</DialogTitle>
          <DialogDescription>Each project has its own private compound library and audit history.</DialogDescription>
        </DialogHeader>
        <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
          <Field label="Project name *" className="sm:col-span-2"><Input required maxLength={200} value={f.name} onChange={set("name")} /></Field>
          <Field label="Research objective" className="sm:col-span-2"><Textarea rows={2} value={f.research_objective} onChange={set("research_objective")} /></Field>
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <Checkbox checked={f.ligand_only} onCheckedChange={(v) => setF({ ...f, ligand_only: v === true })} /> Ligand-only project (no protein target)
          </label>
          {!f.ligand_only && (<>
            <Field label="Target name"><Input value={f.target_name} onChange={set("target_name")} placeholder="e.g. EGFR" /></Field>
            <Field label="PDB / protein ID"><Input value={f.pdb_id} onChange={set("pdb_id")} placeholder="e.g. 1M17" /></Field>
          </>)}
          <Field label="Organism"><Input value={f.organism} onChange={set("organism")} placeholder="Homo sapiens" /></Field>
          <Field label="Starting compound name"><Input value={f.starting_compound_name} onChange={set("starting_compound_name")} /></Field>
          <Field label="Starting compound SMILES" className="sm:col-span-2"><Input className="font-mono" value={f.starting_smiles} onChange={set("starting_smiles")} /></Field>
          <Field label="Known endpoint"><Input value={f.endpoint_name} onChange={set("endpoint_name")} placeholder="IC50" /></Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Units"><Input value={f.endpoint_units} onChange={set("endpoint_units")} placeholder="nM" /></Field>
            <Field label="Assay type"><Input value={f.assay_type} onChange={set("assay_type")} placeholder="biochemical" /></Field>
          </div>
          <Field label="Optimization objectives (comma-separated)" className="sm:col-span-2"><Input value={f.objectives} onChange={set("objectives")} placeholder="Improve potency, reduce cLogP" /></Field>
          <div className="sm:col-span-2">
            <Label className="text-xs text-muted-foreground">Hard property constraints (max)</Label>
            <div className="mt-1.5 grid grid-cols-4 gap-2">
              <Input placeholder="MW" type="number" step="any" value={f.mw_max} onChange={set("mw_max")} />
              <Input placeholder="cLogP" type="number" step="any" value={f.clogp_max} onChange={set("clogp_max")} />
              <Input placeholder="TPSA" type="number" step="any" value={f.tpsa_max} onChange={set("tpsa_max")} />
              <Input placeholder="HBD" type="number" step="1" value={f.hbd_max} onChange={set("hbd_max")} />
            </div>
          </div>
          <Field label="Preferred tools / compute" className="sm:col-span-2"><Input value={f.tools} onChange={set("tools")} placeholder="RDKit, AutoDock Vina, GPU cluster" /></Field>
          <DialogFooter className="sm:col-span-2">
            <Button type="submit" variant="brand" disabled={busy}>{busy ? "Saving…" : project ? "Save changes" : "Create project"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return <div className={`space-y-1.5 ${className ?? ""}`}><Label className="text-xs text-muted-foreground">{label}</Label>{children}</div>;
}
