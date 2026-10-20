import { createFileRoute } from "@tanstack/react-router";
import { ModuleUnavailable } from "@/components/molforge/common";

export const Route = createFileRoute("/_authenticated/generative")({
  head: () => ({ meta: [{ title: "Generative Design — MolForge AI" }, { name: "description", content: "Generative Design module in MolForge AI." }, { property: "og:title", content: "Generative Design — MolForge AI" }, { property: "og:description", content: "Generative Design module in MolForge AI." }] }),
  component: () => <ModuleUnavailable title="Generative Design" description="Generate novel structures conditioned on project objectives." requires={["A generative chemistry model service (e.g. REINVENT) with an API endpoint", "Server-side credentials stored as project secrets"]} />,
});
