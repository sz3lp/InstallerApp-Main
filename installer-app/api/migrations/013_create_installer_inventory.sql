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
      select 1 from user_roles where user_id = auth.uid() and role in ('Admin','Manager','Install Manager')
    )
  );

create policy "InstallerInventory Insert" on installer_inventory
  for insert with check (
    installer_id = auth.uid()
    or exists (
      select 1 from user_roles where user_id = auth.uid() and role in ('Admin','Manager','Install Manager')
    )
  );

create policy "InstallerInventory Update" on installer_inventory
  for update using (
    installer_id = auth.uid()
    or exists (
      select 1 from user_roles where user_id = auth.uid() and role in ('Admin','Manager','Install Manager')
    )
  );
