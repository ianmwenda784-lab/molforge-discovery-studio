
create or replace function public.set_updated_at() returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text, organization text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "own profile select" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "own profile insert" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "own profile update" on public.profiles for update to authenticated using (auth.uid() = id);

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name) values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1)))
  on conflict (id) do nothing;
  return new;
end; $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  name text not null check (char_length(name) between 1 and 200),
  research_objective text,
  target_name text, pdb_id text, organism text,
  ligand_only boolean not null default false,
  starting_compound_name text, starting_smiles text,
  endpoint_name text, endpoint_units text, assay_type text,
  optimization_objectives text[] not null default '{}',
  hard_constraints jsonb not null default '{}'::jsonb,
  preferred_tools text[] not null default '{}',
  status text not null default 'active' check (status in ('active','archived')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index projects_user_idx on public.projects(user_id, updated_at desc);

create table public.targets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null, pdb_id text, uniprot_id text, organism text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index targets_project_idx on public.targets(project_id);

create table public.uploaded_files (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  file_name text not null, file_type text not null, size_bytes integer,
  created_at timestamptz not null default now()
);
create index uploaded_files_project_idx on public.uploaded_files(project_id);

create table public.datasets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null, source_type text not null, uploaded_file_id uuid references public.uploaded_files(id) on delete set null,
  records_submitted integer not null default 0, records_accepted integer not null default 0,
  records_invalid integer not null default 0, records_duplicate integer not null default 0,
  created_at timestamptz not null default now()
);
create index datasets_project_idx on public.datasets(project_id, created_at desc);

create table public.compounds (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  dataset_id uuid references public.datasets(id) on delete set null,
  name text,
  original_input text not null,
  input_format text not null default 'smiles',
  source text not null,
  canonical_smiles text,
  inchikey text,
  formula text, mw numeric, clogp numeric, hbd integer, hba integer, tpsa numeric,
  rotatable_bonds integer, ring_count integer, aromatic_ring_count integer, heavy_atoms integer,
  qed numeric,
  lipinski_violations integer,
  structural_alerts jsonb,
  calculation_status text not null default 'pending' check (calculation_status in ('pending','calculated','invalid','service_unavailable','error')),
  calculation_error text,
  calculation_engine text,
  calculated_at timestamptz,
  tags text[] not null default '{}',
  notes text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create unique index compounds_project_canonical_uniq on public.compounds(project_id, canonical_smiles) where canonical_smiles is not null;
create index compounds_project_idx on public.compounds(project_id, created_at desc);
create index compounds_user_idx on public.compounds(user_id);
create index compounds_status_idx on public.compounds(project_id, calculation_status);

create table public.compound_relationships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  parent_id uuid not null references public.compounds(id) on delete cascade,
  child_id uuid not null references public.compounds(id) on delete cascade,
  relationship_type text not null, created_at timestamptz not null default now()
);
create index compound_rel_project_idx on public.compound_relationships(project_id);

create table public.assay_measurements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  compound_id uuid not null references public.compounds(id) on delete cascade,
  endpoint text not null, value numeric not null, units text, relation text default '=',
  assay_type text, source_reference text,
  value_kind text not null default 'experimental' check (value_kind = 'experimental'),
  measured_at date, created_at timestamptz not null default now()
);
create index assay_compound_idx on public.assay_measurements(compound_id);

create table public.models (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  project_id uuid references public.projects(id) on delete cascade,
  name text not null, model_type text not null, endpoint text,
  created_at timestamptz not null default now()
);
create table public.model_versions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  model_id uuid not null references public.models(id) on delete cascade,
  version text not null, metrics jsonb, training_dataset_id uuid references public.datasets(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.generation_jobs (
  id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  status text not null default 'queued' check (status in ('queued','running','succeeded','failed','cancelled')),
  parameters jsonb not null default '{}'::jsonb, error text, provider text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.prediction_jobs (
  id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  model_version_id uuid references public.model_versions(id) on delete set null,
  status text not null default 'queued' check (status in ('queued','running','succeeded','failed','cancelled')),
  parameters jsonb not null default '{}'::jsonb, error text, provider text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.docking_jobs (
  id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  target_id uuid references public.targets(id) on delete set null,
  status text not null default 'queued' check (status in ('queued','running','succeeded','failed','cancelled')),
  parameters jsonb not null default '{}'::jsonb, error text, provider text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.prediction_results (
  id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  compound_id uuid not null references public.compounds(id) on delete cascade,
  prediction_job_id uuid references public.prediction_jobs(id) on delete cascade,
  docking_job_id uuid references public.docking_jobs(id) on delete cascade,
  endpoint text not null, value numeric, units text, uncertainty numeric,
  value_kind text not null default 'predicted' check (value_kind in ('predicted','computed')),
  created_at timestamptz not null default now()
);
create table public.optimization_runs (
  id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  seed_compound_id uuid references public.compounds(id) on delete set null,
  status text not null default 'queued' check (status in ('queued','running','succeeded','failed','cancelled')),
  objectives jsonb not null default '{}'::jsonb, error text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.optimization_candidates (
  id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid(),
  run_id uuid not null references public.optimization_runs(id) on delete cascade,
  compound_id uuid references public.compounds(id) on delete set null,
  smiles text not null, score numeric, rationale text,
  created_at timestamptz not null default now()
);
create table public.reports (
  id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null, content jsonb, created_at timestamptz not null default now()
);
create table public.audit_events (
  id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid(),
  project_id uuid references public.projects(id) on delete cascade,
  entity_type text not null, entity_id uuid, action text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index audit_user_idx on public.audit_events(user_id, created_at desc);
create index audit_project_idx on public.audit_events(project_id, created_at desc);

do $$
declare t text;
begin
  foreach t in array array['projects','targets','uploaded_files','datasets','compounds','compound_relationships','assay_measurements','models','model_versions','generation_jobs','prediction_jobs','docking_jobs','prediction_results','optimization_runs','optimization_candidates','reports','audit_events'] loop
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
    execute format('grant all on public.%I to service_role', t);
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "own select" on public.%I for select to authenticated using (auth.uid() = user_id)', t);
    execute format('create policy "own insert" on public.%I for insert to authenticated with check (auth.uid() = user_id)', t);
    execute format('create policy "own update" on public.%I for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id)', t);
    execute format('create policy "own delete" on public.%I for delete to authenticated using (auth.uid() = user_id)', t);
  end loop;
end $$;

-- audit events are append-only
drop policy "own update" on public.audit_events;
drop policy "own delete" on public.audit_events;
revoke update, delete on public.audit_events from authenticated;

create trigger projects_updated before update on public.projects for each row execute function public.set_updated_at();
create trigger compounds_updated before update on public.compounds for each row execute function public.set_updated_at();
create trigger targets_updated before update on public.targets for each row execute function public.set_updated_at();
create trigger profiles_updated before update on public.profiles for each row execute function public.set_updated_at();
