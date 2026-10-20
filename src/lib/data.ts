import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Project = Tables<"projects">;
export type Compound = Tables<"compounds">;
export type AuditEvent = Tables<"audit_events">;

export const projectsQuery = queryOptions({
  queryKey: ["projects"],
  queryFn: async () => {
    const { data, error } = await supabase.from("projects").select("*").order("updated_at", { ascending: false });
    if (error) throw error;
    return data;
  },
});

export const projectQuery = (id: string) =>
  queryOptions({
    queryKey: ["project", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("projects").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

export const compoundsQuery = (projectId?: string) =>
  queryOptions({
    queryKey: ["compounds", projectId ?? "all"],
    queryFn: async () => {
      let q = supabase.from("compounds").select("*").order("created_at", { ascending: false }).limit(1000);
      if (projectId) q = q.eq("project_id", projectId);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });

export const auditQuery = (projectId?: string) =>
  queryOptions({
    queryKey: ["audit", projectId ?? "all"],
    queryFn: async () => {
      let q = supabase.from("audit_events").select("*").order("created_at", { ascending: false }).limit(50);
      if (projectId) q = q.eq("project_id", projectId);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });

export const dashboardQuery = queryOptions({
  queryKey: ["dashboard"],
  queryFn: async () => {
    const count = async (table: "projects" | "compounds" | "datasets" | "assay_measurements", f?: (q: any) => any) => {
      let q: any = supabase.from(table).select("id", { count: "exact", head: true });
      if (f) q = f(q);
      const { count: c, error } = await q;
      if (error) throw error;
      return c ?? 0;
    };
    const jobs = async (table: "generation_jobs" | "prediction_jobs" | "docking_jobs" | "optimization_runs") => {
      const { data, error } = await supabase.from(table).select("status");
      if (error) throw error;
      return data;
    };
    const [projects, compounds, calculated, invalid, uncalculated, datasets, assays, g, p, d, o] = await Promise.all([
      count("projects"),
      count("compounds"),
      count("compounds", (q) => q.eq("calculation_status", "calculated")),
      count("compounds", (q) => q.eq("calculation_status", "invalid")),
      count("compounds", (q) => q.in("calculation_status", ["pending", "service_unavailable", "error"])),
      count("datasets"),
      count("assay_measurements"),
      jobs("generation_jobs"),
      jobs("prediction_jobs"),
      jobs("docking_jobs"),
      jobs("optimization_runs"),
    ]);
    const all = [...g, ...p, ...d, ...o];
    const jobStatus = (["queued", "running", "succeeded", "failed", "cancelled"] as const).map((s) => ({
      status: s,
      count: all.filter((j) => j.status === s).length,
    }));
    return { projects, compounds, calculated, invalid, uncalculated, datasets, assays, jobStatus, totalJobs: all.length };
  },
});

export async function logAudit(e: { project_id?: string | null; entity_type: string; entity_id?: string | null; action: string; details?: Record<string, unknown> }) {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return;
  await supabase.from("audit_events").insert({ user_id: u.user.id, ...e, details: (e.details ?? {}) as never });
}

export const fmt = (v: number | null | undefined, d = 2) => (v === null || v === undefined ? "—" : Number(v).toFixed(d));
