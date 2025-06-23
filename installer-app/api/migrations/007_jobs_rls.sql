alter table jobs enable row level security;

create policy "Jobs Select Assigned" on jobs
  for select using (
    assigned_to = auth.uid()
    or exists (select 1 from user_roles where user_id = auth.uid() and role in ('Admin','Manager','Install Manager'))
  );

create policy "Jobs Update Assigned" on jobs
  for update using (
    assigned_to = auth.uid()
    or exists (select 1 from user_roles where user_id = auth.uid() and role in ('Admin','Manager','Install Manager'))
  );

create policy "Jobs Insert" on jobs
  for insert with check (true);
