import { createFileRoute } from "@tanstack/react-router";
import { ModuleUnavailable } from "@/components/molforge/common";

export const Route = createFileRoute("/_authenticated/compounds")({
  head: () => ({ meta: [{ title: "Compound Library — MolForge AI" }, { name: "description", content: "Compound Library module in MolForge AI." }, { property: "og:title", content: "Compound Library — MolForge AI" }, { property: "og:description", content: "Compound Library module in MolForge AI." }] }),
  component: () => <ModuleUnavailable title="Compound Library" description="Each project keeps its own isolated library — open a project to view and import compounds." requires={["RDKit service connected (Settings & Integrations)", "Compounds imported into a project"]} />,
});
