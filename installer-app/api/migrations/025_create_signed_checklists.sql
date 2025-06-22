create table if not exists signed_checklists (
  id uuid primary key default uuid_generate_v4(),
  job_id uuid references jobs(id) on delete cascade,
  installer_id uuid references auth.users(id),
  signature_url text not null,
  created_at timestamptz default now()
);

alter table signed_checklists enable row level security;

create policy "SignedChecklists Select" on signed_checklists
  for select using (
    installer_id = auth.uid()
    or exists (select 1 from user_roles where user_id = auth.uid() and role in ('Admin','Manager'))
  );

create policy "SignedChecklists Insert" on signed_checklists
  for insert with check (
    installer_id = auth.uid()
    and exists (select 1 from jobs where id = job_id and assigned_to = auth.uid())
  );
