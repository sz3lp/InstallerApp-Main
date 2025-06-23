alter table clients enable row level security;

drop policy if exists "Clients Select" on clients;
create policy "Clients Select" on clients
  for select using (
    exists (select 1 from user_roles where user_id = auth.uid() and role in ('Sales','Manager','Install Manager','Admin'))
  );

drop policy if exists "Clients Insert" on clients;
create policy "Clients Insert" on clients
  for insert with check (
    exists (select 1 from user_roles where user_id = auth.uid() and role in ('Sales','Manager','Install Manager','Admin'))
  );

drop policy if exists "Clients Update" on clients;
create policy "Clients Update" on clients
  for update using (
    exists (select 1 from user_roles where user_id = auth.uid() and role in ('Sales','Manager','Install Manager','Admin'))
  );
