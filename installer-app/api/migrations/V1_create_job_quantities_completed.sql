create table if not exists job_quantities_completed (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references jobs(id),
  material_id uuid references materials(id),
  quantity numeric,
  recorded_by uuid references auth.users(id),
  created_at timestamp default now()
);

create or replace function log_material_usage(
  _job_id uuid,
  _material_id uuid,
  _quantity numeric
)
returns void as $$
begin
  insert into job_quantities_completed (job_id, material_id, quantity, recorded_by)
  values (_job_id, _material_id, _quantity, auth.uid());
end;
$$ language plpgsql security definer;
