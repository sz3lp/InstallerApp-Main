alter table jobs add column if not exists client_id uuid references clients(id);
alter table jobs add column if not exists template_type text;
alter table jobs add column if not exists created_by uuid references auth.users(id);
alter table jobs add column if not exists origin_lead_id uuid references leads(id);

drop policy if exists "Jobs Insert" on jobs;
create policy "Jobs Insert" on jobs
  for insert with check (
    exists (
      select 1 from users where id = auth.uid() and lower(role) in ('sales','manager','admin')
    )
  );
