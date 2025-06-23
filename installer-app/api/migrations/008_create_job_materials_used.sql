create table if not exists job_materials_used (
  id uuid primary key default uuid_generate_v4(),
  job_id uuid references jobs(id) on delete cascade,
  material_id uuid references materials(id),
  quantity int not null,
  installer_id uuid references auth.users(id),
  photo_url text,
  created_at timestamptz default now()
);

alter table job_materials_used enable row level security;

create policy "JobMaterialsUsed Select" on job_materials_used
  for select using (
    installer_id = auth.uid()
    or exists (
      select 1 from user_roles where user_id = auth.uid() and role in ('Admin','Manager','Install Manager')
    )
  );

create policy "JobMaterialsUsed Insert" on job_materials_used
  for insert with check (
    installer_id = auth.uid() and
    exists (
      select 1 from jobs where id = job_id and assigned_to = auth.uid()
    )
  );
