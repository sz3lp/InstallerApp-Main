create table if not exists job_quantities_completed (
  id uuid primary key default uuid_generate_v4(),
  job_id uuid references jobs(id) on delete cascade,
  material_id uuid references materials(id),
  quantity_completed int not null,
  user_id uuid references auth.users(id),
  created_at timestamptz default now()
);

alter table job_quantities_completed enable row level security;

create policy "JobQuantitiesCompleted Select" on job_quantities_completed
  for select using (
    user_id = auth.uid()
    or exists (select 1 from users where id = auth.uid() and lower(role) in ('admin','manager'))
  );

create policy "JobQuantitiesCompleted Insert" on job_quantities_completed
  for insert with check (
    user_id = auth.uid()
    and exists (select 1 from jobs where id = job_id and assigned_to = auth.uid())
  );
