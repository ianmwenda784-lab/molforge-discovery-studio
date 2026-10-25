# MolForge Discovery Studio

Build MolForge AI, a professional full-stack computational drug-discovery and lead-optimization SaaS for medicinal chemists. Start with the brief's Phase 1 and deliver a working vertical slice: authentication, project management, compound ingestion, RDKit descriptors, database persistence, and dashboard. Do not build a static mockup or fabricate scientific data.

TECH/SAFETY: React + TypeScript, Tailwind + shadcn/ui, Supabase auth/Postgres/RLS. Keep provider secrets server-side. Use RDKit in a secure Python service for parsing, sanitization, canonical isomeric SMILES, descriptors, and medicinal chemistry filters. If no RDKit service is configured, show an explicit unavailable/setup state; do not present placeholder or guessed descriptor values as calculations. Likewise don't claim unavailable backend computations succeeded.

PRODUCT / VISUALS: Name MolForge AI. Dark navy/charcoal scientific workstation; white/slate text, violet/cyan accents; dense readable tables; persistent left sidebar with Overview, Projects, Compound Library, Generative Design, Lead Optimization, Molecular Properties, Docking & Binding, ADMET Assessment, Analysis & Validation, Reports, Settings & Integrations. Desktop first but responsive. Functional first-phase navigation and clear disabled/configuration states for later scientific integrations. A crisp, polished dashboard with metrics derived only from persisted records and a genuine empty state for new accounts. Prominent Create Project and Start Lead Optimization actions (latter can guide to create/select a project).

PHASE 1 FUNCTIONAL SCOPE:
- Authenticated private users and per-user RLS.
- Create/manage multiple projects, isolated compound libraries and audit history. Project fields: name, research objective, target name, optional PDB/protein identifier and organism, starting compound and SMILES, optional known endpoint/units/assay type, optimization objectives, hard property constraints, preferred tools/compute. Permit ligand-only projects.
- Compound library imports: manual SMILES, pasted multiline SMILES, CSV (required SMILES column), and SDF if safely supported. Preserve source/original input; informative invalid-structure errors; no silent loss. Store canonical isomeric SMILES, formula, MW, cLogP, HBD/HBA, TPSA, rotatable bonds, ring count, structural alerts where supported, provenance, timestamps, calculation status. Deduplicate by canonical structure within a project, explain duplicates. Search, filter, sort, tag, preview 2D structure, CSV export; SDF export if implemented.
- Persisted dashboard totals / recent activity / job statuses; no sample fake compounds or fabricated jobs.
- Relational schema should support brief's core entities (profiles, projects, targets, compounds, compound_relationships, datasets, assay_measurements, models/model_versions, generation_jobs, prediction_jobs, docking_jobs, prediction_results, optimization_runs/candidates, uploaded_files, reports, audit_events) with FKs/timestamps/indexes/RLS, but prioritize a robust Phase 1 schema instead of pretending later workflows are implemented.
- Clear provenance and explicit labels separating experimental and computed/predicted values. Use empty states for unavailable later phase modules and describe setup needed. No decorative fake-computation buttons.
- Include a clear RDKit integration status/setup experience if the Python service cannot be provisioned here. Calculated status must reflect validated backend response only.

Deliver the implementation, not just a plan. Verify the actual Phase 1 flows in preview and fix any build/runtime issues. At the end report what works, what needs external setup (especially RDKit backend), and the preview URL.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/246e630d-594a-4293-bf5d-b16c5c09597c).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
