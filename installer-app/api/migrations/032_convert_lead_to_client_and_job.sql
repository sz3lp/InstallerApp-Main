create or replace function convert_lead_to_client_and_job(lead_id uuid)
returns uuid
language plpgsql
security definer
as $$
declare
  lead_record record;
  new_client_id uuid;
  new_job_id uuid;
begin
  select * into lead_record from leads where id = lead_id;
  if not found then
    raise exception 'Lead not found';
  end if;

  insert into clients (name, contact_name, contact_email, address)
  values (
    coalesce(lead_record.clinic_name, 'New Client'),
    lead_record.contact_name,
    lead_record.contact_email,
    lead_record.address
  )
  returning id into new_client_id;

  insert into jobs (
    client_id,
    quote_id,
    status,
    created_by,
    assigned_to
  ) values (
    new_client_id,
    null,
    'created',
    auth.uid(),
    null
  ) returning id into new_job_id;

  update leads set status = 'converted' where id = lead_id;

  insert into lead_status_history (lead_id, old_status, new_status, changed_by)
  values (
    lead_id,
    lead_record.status,
    'converted',
    auth.uid()
  );

  return new_job_id;
end;
$$;

-- allow new status value
alter table leads drop constraint if exists leads_status_check;
alter table leads add constraint leads_status_check
  check (status in (
    'new','attempted_contact','appointment_scheduled','consultation_complete',
    'proposal_sent','waiting','won','lost','closed','converted'
  ));

-- RLS policy updates

drop policy if exists "Leads Update" on leads;
create policy "Allow authorized role to update lead status" on leads for update
  using (
    exists (
      select 1 from user_roles where user_id = auth.uid() and role in ('Sales','Manager','Admin')
    )
  )
  with check (status = 'converted');

drop policy if exists "Lead status history access" on lead_status_history;
create policy "Lead status history access" on lead_status_history for select using (
  exists (
    select 1 from user_roles where user_id = auth.uid() and role in ('Sales','Manager','Admin','Install Manager')
  )
);

create policy "Allow secure insert into lead_status_history" on lead_status_history for insert
  using (
    auth.uid() is not null and
    exists (
      select 1 from leads
      where id = new.lead_id
        and (
          leads.sales_rep_id = auth.uid() or
          exists (
            select 1 from user_roles
            where user_id = auth.uid() and role in ('Manager','Admin')
          )
        )
    )
  );

drop policy if exists "Clients Insert" on clients;
create policy "Allow role-based insert into clients" on clients for insert
  with check (
    exists (
      select 1 from user_roles where user_id = auth.uid() and role in ('Sales','Manager','Admin')
    )
  );

drop policy if exists "Jobs Insert" on jobs;
create policy "Allow role-based insert into jobs" on jobs for insert
  with check (
    exists (
      select 1 from user_roles where user_id = auth.uid() and role in ('Sales','Manager','Admin')
    )
  );
