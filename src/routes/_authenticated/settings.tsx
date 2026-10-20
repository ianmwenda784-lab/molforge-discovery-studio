import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, RdkitBanner } from "@/components/molforge/common";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings — MolForge AI" }, { name: "description", content: "Integrations and RDKit setup." }, { property: "og:title", content: "Settings — MolForge AI" }, { property: "og:description", content: "Integrations and RDKit setup." }] }),
  component: () => (
    <div>
      <PageHeader title="Settings & Integrations" />
      <RdkitBanner />
      <div className="rounded-lg border bg-card p-5 text-sm">
        <h2 className="font-medium">RDKit service setup</h2>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-muted-foreground">
          <li>Deploy the included RDKit service (Python/FastAPI, Dockerfile provided) to any container host.</li>
          <li>Optionally set SERVICE_TOKEN on the service.</li>
          <li>Add RDKIT_SERVICE_URL (and RDKIT_SERVICE_TOKEN) as project secrets.</li>
          <li>Reopen a project and recalculate stored structures.</li>
        </ol>
      </div>
    </div>
  ),
});
