create or replace function generate_invoice_for_job(p_job_id uuid)
returns uuid as $$
declare
  inv_id uuid;
  client uuid;
  sub numeric;
begin
  select client_id into client from jobs where id = p_job_id;
  if client is null then
    raise exception 'Job not found';
  end if;

  select sum(jmu.quantity * m.retail_price)
    into sub
    from job_materials_used jmu
    join materials m on jmu.material_id = m.id
    where jmu.job_id = p_job_id;

  insert into invoices(job_id, client_id, created_by, invoice_date, status, subtotal, total_due)
    values(p_job_id, client, auth.uid(), now(), 'draft', coalesce(sub,0), coalesce(sub,0))
    returning id into inv_id;

  insert into invoice_line_items(invoice_id, material_id, description, quantity, unit_price, line_total)
    select inv_id, m.id, m.name, jmu.quantity, m.retail_price, jmu.quantity * m.retail_price
    from job_materials_used jmu
    join materials m on jmu.material_id = m.id
    where jmu.job_id = p_job_id;

  return inv_id;
end;
$$ language plpgsql;
