create extension if not exists "uuid-ossp";

create table if not exists audit_log (
  id uuid primary key default uuid_generate_v4(),
  job_id uuid not null,
  actor_id uuid,
  event text not null,
  details jsonb,
  created_at timestamptz not null default now()
);

