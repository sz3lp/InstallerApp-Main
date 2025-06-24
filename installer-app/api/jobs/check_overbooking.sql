create or replace function check_overbooking(
  p_installer_id uuid,
  p_start_time timestamptz,
  p_end_time timestamptz
) returns void as $$
declare
  v_count integer;
begin
  select count(*)
    into v_count
    from jobs
    where installer_id = p_installer_id
      and start_time < p_end_time
      and end_time > p_start_time;

  if v_count > 0 then
    raise exception 'Installer has an overlapping job during this time';
  end if;
end;
$$ language plpgsql;

