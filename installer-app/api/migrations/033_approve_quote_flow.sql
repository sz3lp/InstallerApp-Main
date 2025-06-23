-- Add status column to quotes if missing
alter table quotes add column if not exists status text default 'draft';

-- History table for quote status changes
create table if not exists quote_status_history (
  id uuid primary key default uuid_generate_v4(),
  quote_id uuid references quotes(id),
  old_status text,
  new_status text,
  changed_by uuid references auth.users(id),
  changed_at timestamptz default now()
);

-- RPC to approve quote
create or replace function approve_quote(quote_id uuid)
returns void
language plpgsql
security definer
as $$
declare
  old_status text;
begin
  select status into old_status from quotes where id = quote_id;
  if old_status is null then
    raise exception 'Quote not found';
  end if;

  update quotes set status = 'approved' where id = quote_id;

  insert into quote_status_history (quote_id, old_status, new_status, changed_by)
  values (quote_id, old_status, 'approved', auth.uid());
end;
$$;

-- RLS policies
create policy "Allow Manager/Admin to approve quotes" on quotes for update
  using (
    exists (
      select 1 from user_roles
      where user_id = auth.uid() and role in ('Manager','Admin')
    )
  )
  with check (status = 'approved');

alter table quote_status_history enable row level security;
create policy "Allow authorized quote status logging" on quote_status_history for insert
  using (
    auth.uid() is not null and
    exists (select 1 from quotes where id = new.quote_id)
  );
