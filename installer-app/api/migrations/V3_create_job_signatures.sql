create table if not exists job_signatures (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references jobs(id) on delete cascade not null,
  signed_by text not null,
  signature_url text not null,
  signed_at timestamptz default now()
);

alter table job_signatures enable row level security;

create policy "User can access signatures for their jobs" on job_signatures
  for select using (
    exists (
      select 1 from jobs
      where jobs.id = job_signatures.job_id
        and jobs.assigned_to = auth.uid()
    )
  );

create policy "User can insert signatures for assigned job" on job_signatures
  for insert with check (
    exists (
      select 1 from jobs
      where jobs.id = job_signatures.job_id
        and jobs.assigned_to = auth.uid()
    )
  );
