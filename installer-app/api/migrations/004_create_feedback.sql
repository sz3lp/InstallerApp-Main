create table if not exists feedback (
  id uuid primary key default uuid_generate_v4(),
  installer_name text,
  job_number text,
  date date,
  score int,
  issues text[],
  notes text,
  created_at timestamptz not null default now()
);
