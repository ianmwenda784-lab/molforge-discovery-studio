import { createFileRoute } from "@tanstack/react-router";
import { ModuleUnavailable } from "@/components/molforge/common";

export const Route = createFileRoute("/_authenticated/reports")({
  head: () => ({ meta: [{ title: "Reports — MolForge AI" }, { name: "description", content: "Reports module in MolForge AI." }, { property: "og:title", content: "Reports — MolForge AI" }, { property: "og:description", content: "Reports module in MolForge AI." }] }),
  component: () => <ModuleUnavailable title="Reports" description="Exportable project reports." requires={["Calculated compound data and completed analyses to report on"]} />,
});
