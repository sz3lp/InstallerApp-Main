alter table clients enable row level security;

drop policy if exists "Clients Select" on clients;
create policy "Clients Select" on clients
  for select using (
    exists (select 1 from users where id = auth.uid() and lower(role) in ('sales','manager','admin'))
  );

drop policy if exists "Clients Insert" on clients;
create policy "Clients Insert" on clients
  for insert with check (
    exists (select 1 from users where id = auth.uid() and lower(role) in ('sales','manager','admin'))
  );

drop policy if exists "Clients Update" on clients;
create policy "Clients Update" on clients
  for update using (
    exists (select 1 from users where id = auth.uid() and lower(role) in ('sales','manager','admin'))
  );
