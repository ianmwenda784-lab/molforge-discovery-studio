import { createFileRoute } from "@tanstack/react-router";
import { ModuleUnavailable } from "@/components/molforge/common";

export const Route = createFileRoute("/_authenticated/analysis")({
  head: () => ({ meta: [{ title: "Analysis & Validation — MolForge AI" }, { name: "description", content: "Analysis & Validation module in MolForge AI." }, { property: "og:title", content: "Analysis & Validation — MolForge AI" }, { property: "og:description", content: "Analysis & Validation module in MolForge AI." }] }),
  component: () => <ModuleUnavailable title="Analysis & Validation" description="SAR analysis and model validation against experimental assays." requires={["Imported experimental assay measurements", "A trained model version for comparison"]} />,
});
