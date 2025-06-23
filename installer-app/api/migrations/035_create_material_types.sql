create table if not exists material_types (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  unit_of_measure text,
  default_cost numeric,
  retail_price numeric,
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

alter table material_types enable row level security;

create policy "Allow Admins to manage material types"
  on material_types for all
  using (
    exists (
      select 1 from user_roles
      where user_id = auth.uid()
      and role = 'Admin'
    )
  )
  with check (
    exists (
      select 1 from user_roles
      where user_id = auth.uid()
      and role = 'Admin'
    )
  );
