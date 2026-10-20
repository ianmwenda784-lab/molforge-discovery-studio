import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * RDKit integration. All cheminformatics runs in an external Python/RDKit
 * service configured via RDKIT_SERVICE_URL (+ optional RDKIT_SERVICE_TOKEN).
 * Nothing here computes or guesses descriptors: values are only stored when
 * the service returns a response that passes schema validation.
 */

function getConfig() {
  const url = process.env["RDKIT_SERVICE_URL"]?.replace(/\/+$/, "");
  const token = process.env["RDKIT_SERVICE_TOKEN"];
  return { url, token };
}

function headers(token?: string) {
  const h: Record<string, string> = { "content-type": "application/json" };
  if (token) h["authorization"] = `Bearer ${token}`;
  return h;
}

const healthSchema = z.object({
  status: z.literal("ok"),
  rdkit_version: z.string(),
  service_version: z.string().optional(),
});

export type RdkitStatus =
  | { state: "not_configured" }
  | { state: "unreachable"; error: string }
  | { state: "ok"; rdkitVersion: string; serviceVersion?: string | undefined };

async function checkHealth(): Promise<RdkitStatus> {
  const { url, token } = getConfig();
  if (!url) return { state: "not_configured" };
  try {
    const res = await fetch(`${url}/health`, { headers: headers(token), signal: AbortSignal.timeout(8000) });
    if (!res.ok) return { state: "unreachable", error: `Health check returned HTTP ${res.status}` };
    const parsed = healthSchema.safeParse(await res.json());
    if (!parsed.success) return { state: "unreachable", error: "Health response did not match the expected MolForge RDKit contract" };
    return { state: "ok", rdkitVersion: parsed.data.rdkit_version, serviceVersion: parsed.data.service_version };
  } catch (e) {
    return { state: "unreachable", error: e instanceof Error ? e.message : "Network error" };
  }
}

export const getRdkitStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async () => checkHealth());

const alertSchema = z.object({ catalog: z.string(), description: z.string() });
const resultSchema = z.object({
  index: z.number().int(),
  valid: z.boolean(),
  error: z.string().nullable().optional(),
  canonical_smiles: z.string().nullable().optional(),
  inchikey: z.string().nullable().optional(),
  formula: z.string().nullable().optional(),
  descriptors: z
    .object({
      mw: z.number(),
      clogp: z.number(),
      hbd: z.number().int(),
      hba: z.number().int(),
      tpsa: z.number(),
      rotatable_bonds: z.number().int(),
      ring_count: z.number().int(),
      aromatic_ring_count: z.number().int(),
      heavy_atoms: z.number().int(),
      qed: z.number().nullable().optional(),
    })
    .nullable()
    .optional(),
  lipinski_violations: z.number().int().nullable().optional(),
  alerts: z.array(alertSchema).nullable().optional(),
});
const processResponseSchema = z.object({
  rdkit_version: z.string(),
  results: z.array(resultSchema),
});
type RdkitResult = z.infer<typeof resultSchema>;

async function callProcess(records: { input: string; format: "smiles" | "molblock" }[]) {
  const { url, token } = getConfig();
  if (!url) return { ok: false as const, reason: "RDKit service is not configured (RDKIT_SERVICE_URL missing)." };
  try {
    const res = await fetch(`${url}/process`, {
      method: "POST",
      headers: headers(token),
      body: JSON.stringify({ records }),
      signal: AbortSignal.timeout(60000),
    });
    if (!res.ok) return { ok: false as const, reason: `RDKit service returned HTTP ${res.status}` };
    const parsed = processResponseSchema.safeParse(await res.json());
    if (!parsed.success) return { ok: false as const, reason: "RDKit response failed schema validation; nothing was stored as calculated." };
    if (parsed.data.results.length !== records.length)
      return { ok: false as const, reason: "RDKit response record count mismatch; nothing was stored as calculated." };
    return { ok: true as const, version: parsed.data.rdkit_version, results: parsed.data.results };
  } catch (e) {
    return { ok: false as const, reason: `RDKit service unreachable: ${e instanceof Error ? e.message : "network error"}` };
  }
}

function calcFields(r: RdkitResult, version: string) {
  const d = r.descriptors!;
  return {
    canonical_smiles: r.canonical_smiles!,
    inchikey: r.inchikey ?? null,
    formula: r.formula ?? null,
    mw: d.mw,
    clogp: d.clogp,
    hbd: d.hbd,
    hba: d.hba,
    tpsa: d.tpsa,
    rotatable_bonds: d.rotatable_bonds,
    ring_count: d.ring_count,
    aromatic_ring_count: d.aromatic_ring_count,
    heavy_atoms: d.heavy_atoms,
    qed: d.qed ?? null,
    lipinski_violations: r.lipinski_violations ?? null,
    structural_alerts: r.alerts ?? [],
    calculation_status: "calculated" as const,
    calculation_error: null,
    calculation_engine: `RDKit ${version}`,
    calculated_at: new Date().toISOString(),
  };
}

const recordSchema = z.object({
  input: z.string().min(1).max(200000),
  format: z.enum(["smiles", "molblock"]),
  name: z.string().max(300).nullable().optional(),
  tags: z.array(z.string().max(60)).max(20).optional(),
  line: z.number().int().optional(),
});

const importSchema = z.object({
  projectId: z.string().uuid(),
  sourceType: z.enum(["manual", "paste", "csv", "sdf"]),
  datasetName: z.string().min(1).max(300),
  fileName: z.string().max(300).nullable().optional(),
  fileSize: z.number().int().nullable().optional(),
  records: z.array(recordSchema).min(1).max(2000),
});

export type ImportOutcome = {
  line: number;
  name: string | null;
  input: string;
  outcome: "calculated" | "invalid" | "duplicate_in_batch" | "duplicate_in_project" | "stored_uncalculated";
  message?: string;
  canonical?: string | null;
};

export type ImportSummary = {
  datasetId: string;
  serviceAvailable: boolean;
  serviceMessage?: string;
  accepted: number;
  invalid: number;
  duplicates: number;
  uncalculated: number;
  outcomes: ImportOutcome[];
};

export const importCompounds = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => importSchema.parse(input))
  .handler(async ({ data, context }): Promise<ImportSummary> => {
    const { supabase, userId } = context;
    const { data: project, error: pErr } = await supabase
      .from("projects")
      .select("id")
      .eq("id", data.projectId)
      .maybeSingle();
    if (pErr || !project) throw new Error("Project not found or not accessible.");

    let uploadedFileId: string | null = null;
    if (data.fileName) {
      const { data: f } = await supabase
        .from("uploaded_files")
        .insert({ user_id: userId, project_id: data.projectId, file_name: data.fileName, file_type: data.sourceType, size_bytes: data.fileSize ?? null })
        .select("id")
        .single();
      uploadedFileId = f?.id ?? null;
    }

    const { data: dataset, error: dErr } = await supabase
      .from("datasets")
      .insert({
        user_id: userId,
        project_id: data.projectId,
        name: data.datasetName,
        source_type: data.sourceType,
        uploaded_file_id: uploadedFileId,
        records_submitted: data.records.length,
      })
      .select("id")
      .single();
    if (dErr || !dataset) throw new Error(`Could not create dataset: ${dErr?.message}`);

    const source = `${data.sourceType}:${data.fileName ?? data.datasetName}`;
    const outcomes: ImportOutcome[] = [];
    const svc = await callProcess(data.records.map((r) => ({ input: r.input, format: r.format })));

    if (!svc.ok) {
      // Preserve every submitted structure, explicitly marked as not calculated.
      const rows = data.records.map((r) => ({
        user_id: userId,
        project_id: data.projectId,
        dataset_id: dataset.id,
        name: r.name ?? null,
        original_input: r.input,
        input_format: r.format,
        source,
        tags: r.tags ?? [],
        calculation_status: "service_unavailable" as const,
        calculation_error: svc.reason,
      }));
      const { error } = await supabase.from("compounds").insert(rows);
      if (error) throw new Error(`Could not store compounds: ${error.message}`);
      data.records.forEach((r, i) =>
        outcomes.push({ line: r.line ?? i + 1, name: r.name ?? null, input: r.input, outcome: "stored_uncalculated", message: svc.reason }),
      );
      await supabase.from("datasets").update({ records_accepted: rows.length }).eq("id", dataset.id);
      await supabase.from("audit_events").insert({
        user_id: userId,
        project_id: data.projectId,
        entity_type: "dataset",
        entity_id: dataset.id,
        action: "compounds.imported_uncalculated",
        details: { source, submitted: rows.length, reason: svc.reason },
      });
      return { datasetId: dataset.id, serviceAvailable: false, serviceMessage: svc.reason, accepted: rows.length, invalid: 0, duplicates: 0, uncalculated: rows.length, outcomes };
    }

    // Existing canonical structures in this project
    const canon = Array.from(new Set(svc.results.filter((r) => r.valid && r.canonical_smiles).map((r) => r.canonical_smiles!)));
    const existing = new Map<string, string>();
    for (let i = 0; i < canon.length; i += 200) {
      const { data: ex } = await supabase
        .from("compounds")
        .select("canonical_smiles, name, id")
        .eq("project_id", data.projectId)
        .in("canonical_smiles", canon.slice(i, i + 200));
      ex?.forEach((e) => e.canonical_smiles && existing.set(e.canonical_smiles, e.name ?? e.id.slice(0, 8)));
    }

    const seen = new Map<string, number>();
    const rows: Record<string, unknown>[] = [];
    let invalid = 0;
    let duplicates = 0;
    svc.results.forEach((r, i) => {
      const rec = data.records[i]!;
      const line = rec.line ?? i + 1;
      const base = { line, name: rec.name ?? null, input: rec.input };
      if (!r.valid || !r.canonical_smiles || !r.descriptors) {
        invalid++;
        outcomes.push({ ...base, outcome: "invalid", message: r.error ?? "RDKit could not parse/sanitize this structure." });
        return;
      }
      if (existing.has(r.canonical_smiles)) {
        duplicates++;
        outcomes.push({ ...base, outcome: "duplicate_in_project", canonical: r.canonical_smiles, message: `Same canonical structure already in project (${existing.get(r.canonical_smiles)}).` });
        return;
      }
      if (seen.has(r.canonical_smiles)) {
        duplicates++;
        outcomes.push({ ...base, outcome: "duplicate_in_batch", canonical: r.canonical_smiles, message: `Same canonical structure as record ${seen.get(r.canonical_smiles)} in this import.` });
        return;
      }
      seen.set(r.canonical_smiles, line);
      rows.push({
        user_id: userId,
        project_id: data.projectId,
        dataset_id: dataset.id,
        name: rec.name ?? null,
        original_input: rec.input,
        input_format: rec.format,
        source,
        tags: rec.tags ?? [],
        ...calcFields(r, svc.version),
      });
      outcomes.push({ ...base, outcome: "calculated", canonical: r.canonical_smiles });
    });

    if (rows.length) {
      const { error } = await supabase.from("compounds").insert(rows as never);
      if (error) throw new Error(`Could not store compounds: ${error.message}`);
    }
    await supabase
      .from("datasets")
      .update({ records_accepted: rows.length, records_invalid: invalid, records_duplicate: duplicates })
      .eq("id", dataset.id);
    await supabase.from("audit_events").insert({
      user_id: userId,
      project_id: data.projectId,
      entity_type: "dataset",
      entity_id: dataset.id,
      action: "compounds.imported",
      details: { source, submitted: data.records.length, accepted: rows.length, invalid, duplicates, engine: `RDKit ${svc.version}` },
    });
    return { datasetId: dataset.id, serviceAvailable: true, accepted: rows.length, invalid, duplicates, uncalculated: 0, outcomes };
  });

/** Re-run RDKit for compounds stored while the service was unavailable. */
export const recalculatePending = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ projectId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: pending, error } = await supabase
      .from("compounds")
      .select("id, original_input, input_format, name")
      .eq("project_id", data.projectId)
      .in("calculation_status", ["service_unavailable", "pending", "error"])
      .limit(1000);
    if (error) throw new Error(error.message);
    if (!pending?.length) return { processed: 0, calculated: 0, invalid: 0, duplicates: 0, serviceMessage: null as string | null };
    const svc = await callProcess(
      pending.map((p) => ({ input: p.original_input, format: p.input_format === "molblock" ? "molblock" : "smiles" })),
    );
    if (!svc.ok) return { processed: 0, calculated: 0, invalid: 0, duplicates: 0, serviceMessage: svc.reason };

    const { data: ex } = await supabase
      .from("compounds")
      .select("canonical_smiles")
      .eq("project_id", data.projectId)
      .not("canonical_smiles", "is", null);
    const taken = new Set((ex ?? []).map((e) => e.canonical_smiles!));
    let calculated = 0, invalid = 0, duplicates = 0;
    for (let i = 0; i < pending.length; i++) {
      const p = pending[i]!;
      const r = svc.results[i]!;
      if (!r.valid || !r.canonical_smiles || !r.descriptors) {
        invalid++;
        await supabase.from("compounds").update({ calculation_status: "invalid", calculation_error: r.error ?? "RDKit could not parse/sanitize this structure.", calculation_engine: `RDKit ${svc.version}` }).eq("id", p.id);
        continue;
      }
      if (taken.has(r.canonical_smiles)) {
        duplicates++;
        await supabase.from("compounds").update({ calculation_status: "error", calculation_error: `Duplicate: canonical structure ${r.canonical_smiles} already exists in this project. Delete this record or the other copy.` }).eq("id", p.id);
        continue;
      }
      taken.add(r.canonical_smiles);
      await supabase.from("compounds").update(calcFields(r, svc.version) as never).eq("id", p.id);
      calculated++;
    }
    await supabase.from("audit_events").insert({
      user_id: userId,
      project_id: data.projectId,
      entity_type: "project",
      entity_id: data.projectId,
      action: "compounds.recalculated",
      details: { processed: pending.length, calculated, invalid, duplicates, engine: `RDKit ${svc.version}` },
    });
    return { processed: pending.length, calculated, invalid, duplicates, serviceMessage: null as string | null };
  });

export const depictStructure = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ smiles: z.string().min(1).max(5000) }).parse(input))
  .handler(async ({ data }) => {
    const { url, token } = getConfig();
    if (!url) return { svg: null as string | null, error: "RDKit service not configured" };
    try {
      const res = await fetch(`${url}/depict`, {
        method: "POST",
        headers: headers(token),
        body: JSON.stringify({ smiles: data.smiles, width: 320, height: 240 }),
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) return { svg: null, error: `HTTP ${res.status}` };
      const j = (await res.json()) as { svg?: unknown };
      if (typeof j.svg !== "string" || !j.svg.trimStart().startsWith("<")) return { svg: null, error: "Invalid depiction response" };
      return { svg: j.svg, error: null };
    } catch (e) {
      return { svg: null, error: e instanceof Error ? e.message : "Network error" };
    }
  });
