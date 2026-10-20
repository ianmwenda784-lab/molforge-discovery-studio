import { createFileRoute } from "@tanstack/react-router";
import { ModuleUnavailable } from "@/components/molforge/common";

export const Route = createFileRoute("/_authenticated/docking")({
  head: () => ({ meta: [{ title: "Docking & Binding — MolForge AI" }, { name: "description", content: "Docking & Binding module in MolForge AI." }, { property: "og:title", content: "Docking & Binding — MolForge AI" }, { property: "og:description", content: "Docking & Binding module in MolForge AI." }] }),
  component: () => <ModuleUnavailable title="Docking & Binding" description="Dock compounds into a prepared protein structure." requires={["A docking backend (e.g. AutoDock Vina / GNINA) with GPU or CPU compute", "A prepared receptor from the project PDB ID"]} />,
});
