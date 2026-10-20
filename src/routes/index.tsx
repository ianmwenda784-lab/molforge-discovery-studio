import { createFileRoute, Link } from "@tanstack/react-router";
import { FlaskConical, Atom, ShieldCheck, Database } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MolForge AI — Lead optimization workstation" },
      { name: "description", content: "Private compound libraries, RDKit-validated descriptors and project audit trails for medicinal chemists." },
      { property: "og:title", content: "MolForge AI — Lead optimization workstation" },
      { property: "og:description", content: "Private compound libraries, RDKit-validated descriptors and project audit trails for medicinal chemists." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <div className="grid size-8 place-items-center rounded-md bg-brand"><FlaskConical className="size-4 text-primary-foreground" /></div>
          <span className="font-semibold">MolForge <span className="text-brand">AI</span></span>
        </div>
        <Button asChild variant="outline" size="sm"><Link to="/auth">Sign in</Link></Button>
      </header>
      <main className="mx-auto max-w-6xl px-6 pt-20 pb-24">
        <p className="font-mono text-xs uppercase tracking-widest text-cyan">Computational drug discovery</p>
        <h1 className="mt-4 max-w-3xl text-5xl font-semibold leading-tight tracking-tight">A scientific workstation for <span className="text-brand">lead optimization</span>.</h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">Organize targets and series, ingest compound libraries, and compute descriptors and medicinal-chemistry alerts with RDKit — with provenance on every value.</p>
        <div className="mt-8 flex gap-3">
          <Button asChild variant="brand" size="lg"><Link to="/auth">Open workspace</Link></Button>
        </div>
        <div className="mt-20 grid gap-4 md:grid-cols-3">
          {[
            { i: Database, t: "Isolated project libraries", d: "SMILES, CSV and SDF import with canonical deduplication and full audit history." },
            { i: Atom, t: "RDKit-validated chemistry", d: "Canonical isomeric SMILES, descriptors and PAINS/Brenk alerts from a real RDKit backend." },
            { i: ShieldCheck, t: "Honest provenance", d: "Experimental, computed and predicted values are always labelled. Nothing is guessed." },
          ].map(({ i: I, t, d }) => (
            <div key={t} className="rounded-lg border bg-card p-5">
              <I className="size-5 text-cyan" />
              <h3 className="mt-3 font-medium">{t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
