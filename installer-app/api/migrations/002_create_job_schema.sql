create table if not exists jobs (
  id uuid primary key default uuid_generate_v4(),
  clinic_name text not null,
  contact_name text not null,
  contact_phone text not null,
  assigned_to uuid references auth.users(id),
  status text not null default 'created' check (status in ('created','assigned','in_progress','submitted','complete')),
  created_at timestamp default now()
);

create table if not exists job_materials (
  id uuid primary key default uuid_generate_v4(),
  job_id uuid references jobs(id) on delete cascade,
  material_id uuid references materials(id),
  quantity int not null,
  used_quantity int default 0
);

create table if not exists checklist_items (
  id uuid primary key default uuid_generate_v4(),
  job_id uuid references jobs(id) on delete cascade,
  description text not null,
  completed boolean default false
);
