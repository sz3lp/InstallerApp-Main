create table if not exists lead_status_history (
  id uuid primary key default uuid_generate_v4(),
  lead_id uuid not null references leads(id) on delete cascade,
  old_status text,
  new_status text not null,
  changed_by uuid references auth.users(id),
  changed_at timestamptz not null default now()
);

alter table lead_status_history enable row level security;

create policy "Lead status history access" on lead_status_history
  for select using (
    exists (select 1 from user_roles where user_id = auth.uid() and role in ('Sales','Manager','Install Manager','Admin'))
  );

create or replace function log_lead_status_change()
returns trigger as $$
begin
  if new.status is distinct from old.status then
    insert into lead_status_history(lead_id, old_status, new_status, changed_by)
    values (old.id, old.status, new.status, auth.uid());
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_log_lead_status_change
after update on leads
for each row execute procedure log_lead_status_change();
