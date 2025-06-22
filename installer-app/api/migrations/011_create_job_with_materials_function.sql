create or replace function create_job_with_materials(
  p_clinic_name text,
  p_address text,
  p_start_time date,
  p_installer uuid,
  p_materials jsonb
) returns uuid as $$
declare
  new_job_id uuid;
begin
  insert into jobs (clinic_name, address, scheduled_date, assigned_to, status)
  values (p_clinic_name, p_address, p_start_time, p_installer, 'assigned')
  returning id into new_job_id;

  if p_materials is not null then
    insert into job_materials (job_id, material_id, quantity)
    select new_job_id,
           (m->>'material_id')::uuid,
           (m->>'quantity')::int
    from jsonb_array_elements(p_materials) as m;
  end if;

  return new_job_id;
end;
$$ language plpgsql;
