create extension if not exists "uuid-ossp";

create table if not exists job_materials (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references jobs(id) on delete cascade,
  material_id uuid not null references materials(id),
  quantity numeric not null default 1,
  sale_price numeric not null,
  unit_material_cost numeric not null,
  unit_labor_cost numeric not null,
  install_location text,
  created_at timestamp without time zone not null default now()
);

alter table job_materials enable row level security;
create policy "authenticated" on job_materials
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Example seed:
insert into job_materials (
  job_id,
  material_id,
  quantity,
  sale_price,
  unit_material_cost,
  unit_labor_cost,
  install_location
) values (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  2,
  100,
  30,
  20,
  'Room A'
);
