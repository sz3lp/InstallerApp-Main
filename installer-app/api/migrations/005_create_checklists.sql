create table if not exists checklists (
  id uuid primary key default uuid_generate_v4(),
  job_id uuid references jobs(id) on delete cascade,
  completed boolean default false,
  responses jsonb,
  created_at timestamptz not null default now()
);
