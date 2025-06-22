alter table jobs enable row level security;

create policy "Jobs Select Assigned" on jobs
  for select using (
    assigned_to = auth.uid()
    or exists (select 1 from users where id = auth.uid() and lower(role) in ('admin','manager'))
  );

create policy "Jobs Update Assigned" on jobs
  for update using (
    assigned_to = auth.uid()
    or exists (select 1 from users where id = auth.uid() and lower(role) in ('admin','manager'))
  );

create policy "Jobs Insert" on jobs
  for insert with check (true);
