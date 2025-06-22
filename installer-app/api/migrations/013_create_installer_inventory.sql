create table if not exists installer_inventory (
  id uuid primary key default uuid_generate_v4(),
  installer_id uuid references auth.users(id),
  material_id uuid references materials(id),
  quantity int not null default 0
);

alter table installer_inventory enable row level security;

create policy "InstallerInventory Select" on installer_inventory
  for select using (
    installer_id = auth.uid()
    or exists (
      select 1 from users where id = auth.uid() and lower(role) in ('admin','manager')
    )
  );

create policy "InstallerInventory Insert" on installer_inventory
  for insert with check (
    installer_id = auth.uid()
    or exists (
      select 1 from users where id = auth.uid() and lower(role) in ('admin','manager')
    )
  );

create policy "InstallerInventory Update" on installer_inventory
  for update using (
    installer_id = auth.uid()
    or exists (
      select 1 from users where id = auth.uid() and lower(role) in ('admin','manager')
    )
  );
