import { createFileRoute } from "@tanstack/react-router";
import { ModuleUnavailable } from "@/components/molforge/common";

export const Route = createFileRoute("/_authenticated/properties")({
  head: () => ({ meta: [{ title: "Molecular Properties — MolForge AI" }, { name: "description", content: "Molecular Properties module in MolForge AI." }, { property: "og:title", content: "Molecular Properties — MolForge AI" }, { property: "og:description", content: "Molecular Properties module in MolForge AI." }] }),
  component: () => <ModuleUnavailable title="Molecular Properties" description="RDKit descriptors are shown per compound in each project library." requires={["RDKit service connected (Settings & Integrations)", "Compounds imported into a project"]} />,
});
