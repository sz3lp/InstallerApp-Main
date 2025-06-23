-- Add scheduled_date column if missing
alter table jobs
  add column if not exists scheduled_date timestamptz;

-- Policy allowing only Manager or Admin to update scheduled_date
create policy "Allow rescheduling by Manager/Admin" on jobs
  for update
  using (
    exists (
      select 1 from user_roles
      where user_id = auth.uid() and role in ('Manager', 'Admin')
    )
  )
  with check (true);
