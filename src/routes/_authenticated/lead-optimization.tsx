import { createFileRoute } from "@tanstack/react-router";
import { ModuleUnavailable } from "@/components/molforge/common";

export const Route = createFileRoute("/_authenticated/lead-optimization")({
  head: () => ({ meta: [{ title: "Lead Optimization — MolForge AI" }, { name: "description", content: "Lead Optimization module in MolForge AI." }, { property: "og:title", content: "Lead Optimization — MolForge AI" }, { property: "og:description", content: "Lead Optimization module in MolForge AI." }] }),
  component: () => <ModuleUnavailable title="Lead Optimization" description="Optimize a seed compound against project objectives. Create or open a project with a starting SMILES first." requires={["A project with a starting compound (Projects page)", "An optimization engine service (generative + scoring models)"]} />,
});
