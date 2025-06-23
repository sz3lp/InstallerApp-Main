create table if not exists leads (
  id uuid primary key default uuid_generate_v4(),
  clinic_name text not null,
  contact_name text,
  contact_email text,
  contact_phone text,
  address text,
  sales_rep_id uuid references auth.users(id),
  status text not null default 'new' check (status in (
    'new','attempted_contact','appointment_scheduled','consultation_complete','proposal_sent','waiting','won','lost','closed'
  )),
  updated_by uuid references auth.users(id),
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table leads enable row level security;

create policy "Leads Select" on leads
  for select using (
    sales_rep_id = auth.uid() or
    exists (select 1 from user_roles where user_id = auth.uid() and role in ('Sales','Manager','Install Manager','Admin'))
  );

create policy "Leads Insert" on leads
  for insert with check (
    sales_rep_id = auth.uid() or
    exists (select 1 from user_roles where user_id = auth.uid() and role in ('Sales','Manager','Install Manager','Admin'))
  );

create policy "Leads Update" on leads
  for update using (
    sales_rep_id = auth.uid() or
    exists (select 1 from user_roles where user_id = auth.uid() and role in ('Sales','Manager','Install Manager','Admin'))
  );

create or replace function set_lead_audit_fields()
returns trigger as $$
begin
  new.updated_by := auth.uid();
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

create trigger trg_leads_set_audit
before update on leads
for each row execute procedure set_lead_audit_fields();

create trigger trg_leads_set_audit_insert
before insert on leads
for each row execute procedure set_lead_audit_fields();
