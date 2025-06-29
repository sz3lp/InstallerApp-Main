-- Add status column to quotes if missing
alter table quotes add column if not exists status text default 'draft';

-- Ensure job_materials has required columns
alter table job_materials add column if not exists job_id uuid;
alter table job_materials add column if not exists material_id uuid;
alter table job_materials add column if not exists quantity integer;

-- RPC to convert quote into job
create or replace function convert_quote_to_job(quote_id uuid)
returns uuid
language plpgsql
security definer
as $$
declare
  quote_record record;
  new_job_id uuid;
begin
  -- Fetch quote
  select * into quote_record from quotes where id = quote_id;
  if not found then
    raise exception 'Quote not found';
  end if;

  if quote_record.status != 'approved' then
    raise exception 'Quote must be approved';
  end if;

  -- Create job
  insert into jobs (client_id, quote_id, status, created_by)
  values (quote_record.client_id, quote_id, 'created', auth.uid())
  returning id into new_job_id;

  -- Copy quote items into job materials
  insert into job_materials (job_id, material_id, quantity)
  select new_job_id, material_id, quantity
  from quote_items
  where quote_id = quote_id;

  -- Update quote status
  update quotes set status = 'converted_to_job' where id = quote_id;

  return new_job_id;
end;
$$;

-- RLS Policies
-- Jobs insert policy
drop policy if exists "Jobs Insert" on jobs;
create policy "Allow quote converters to insert jobs" on jobs for insert
  with check (
    exists (
      select 1 from user_roles
      where user_id = auth.uid()
      and role in ('Sales', 'Manager', 'Admin')
    )
  );

-- Job materials insert policy
alter table job_materials enable row level security;
drop policy if exists "Job Materials Insert" on job_materials;
create policy "Allow quote converters to assign job materials" on job_materials for insert
  with check (
    exists (
      select 1 from user_roles
      where user_id = auth.uid()
      and role in ('Sales', 'Manager', 'Admin')
    )
  );

-- Quotes status update policy for conversion
create policy "Allow status update to converted_to_job" on quotes for update
  using (
    exists (
      select 1 from user_roles
      where user_id = auth.uid()
      and role in ('Sales', 'Manager', 'Admin')
    )
  )
  with check (status = 'converted_to_job');
