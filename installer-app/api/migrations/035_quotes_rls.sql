alter table quotes enable row level security;

drop policy if exists "Quotes Select" on quotes;
create policy "Quotes Select" on quotes
  for select using (
    auth.uid() = created_by
    or exists (select 1 from user_roles where user_id = auth.uid() and role in ('Sales','Manager','Admin'))
  );

drop policy if exists "Quotes Insert" on quotes;
create policy "Quotes Insert" on quotes
  for insert with check (
    exists (select 1 from user_roles where user_id = auth.uid() and role in ('Sales','Manager','Admin'))
  );

drop policy if exists "Quotes Update" on quotes;
create policy "Quotes Update" on quotes
  for update using (
    auth.uid() = created_by
    or exists (select 1 from user_roles where user_id = auth.uid() and role in ('Sales','Manager','Admin'))
  );
