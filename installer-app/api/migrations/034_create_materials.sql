create table if not exists materials (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  unit_of_measure text not null,
  default_cost numeric,
  retail_price numeric,
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create or replace function update_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger materials_set_updated
before update on materials
for each row
execute procedure update_timestamp();

alter table materials enable row level security;

create policy "Allow all roles to view materials"
on materials for select
using (auth.uid() is not null);

create policy "Allow Admin to create materials"
on materials for insert
with check (
  exists (
    select 1 from user_roles
    where user_id = auth.uid() and role = 'Admin'
  )
);

create policy "Allow Admin to update materials"
on materials for update
using (
  exists (
    select 1 from user_roles
    where user_id = auth.uid() and role = 'Admin'
  )
)
with check (true);

create policy "Allow Admin to delete materials"
on materials for delete
using (
  exists (
    select 1 from user_roles
    where user_id = auth.uid() and role = 'Admin'
  )
);
