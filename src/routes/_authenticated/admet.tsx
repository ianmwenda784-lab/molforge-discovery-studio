import { createFileRoute } from "@tanstack/react-router";
import { ModuleUnavailable } from "@/components/molforge/common";

export const Route = createFileRoute("/_authenticated/admet")({
  head: () => ({ meta: [{ title: "ADMET Assessment — MolForge AI" }, { name: "description", content: "ADMET Assessment module in MolForge AI." }, { property: "og:title", content: "ADMET Assessment — MolForge AI" }, { property: "og:description", content: "ADMET Assessment module in MolForge AI." }] }),
  component: () => <ModuleUnavailable title="ADMET Assessment" description="Predicted absorption, distribution, metabolism, excretion and toxicity." requires={["A validated ADMET prediction model service", "Model version and applicability-domain reporting"]} />,
});
